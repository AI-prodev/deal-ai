import { Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"
import { Query } from "../types/query"
import { processRequest } from "../utils/processRequest"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { deleteRedis, getRedis, setRedis } from "../services/redis.service"

export const startRequest = async (req: IExtendedRequest, res: Response) => {
    const token = `pending-request:${uuidv4()}`

    let query: Query

    try {
        query = req.body
    } catch (err) {
        console.error("Couldn't parse query")
        console.error(err)
        console.log("Body was")
        console.log(req.body)
    }

    await setRedis(token, JSON.stringify({ status: "processing", progress: 0 }))

    const userId = req.user.id
    processRequest(token, query, userId).catch(async (err) => {
        console.error(err)
        await setRedis(token, JSON.stringify({
            status: "error",
            error: err.message
        }))
    })

    res.json({ token })
}

export const endRequest = async (req: Request, res: Response) => {
    const token = req.params.token
    const request = JSON.parse(await getRedis(token))

    if (request) {
        if (request.status === "completed") {
            const parsedContent = JSON.parse(request.response as string)
            res.json({ response: parsedContent })
            await deleteRedis(token)
        } else if (request.status === "error") {
            res.status(500).json({ error: request.error })
            await deleteRedis(token)
        } else {
            res.status(400).json({ error: "Request is still processing" })
        }
    } else {
        res.status(404).json({ error: "Token not found" })
    }
}

export const queryRequest = async (req: Request, res: Response) => {
    const token = req.params.token
    const request = JSON.parse(await getRedis(token))

    if (request) {
        if (request.status === "processing") {
            res.json({ progress: 0 })
        } else {
            res.json({ status: request.status })
        }
    } else {
        res.status(404).json({ error: "Token not found" })
    }
}
