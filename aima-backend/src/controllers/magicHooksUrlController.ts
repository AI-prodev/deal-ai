import { Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"
import { deleteRedis, getRedis, setRedis } from "../services/redis.service"
import processUrlRequest from "../utils/processUrlRequest"

export const startUrlRequest = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { url } = req.body

        if (!url) {
            res.status(400).send("URL is required.")
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const userId = req.user.id
        const token = `pending-request:${uuidv4()}`

        await setRedis(token, JSON.stringify({ status: "processing", progress: 0 }))

        processUrlRequest(url, token, userId).catch(
            async (error) => {
                console.error(error)
                await setRedis(token, JSON.stringify({
                    status: "error",
                    progress: 100,
                    error: error.message
                }))
            }
        )

        res.json({ token })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const queryUrlRequest = async (req: Request, res: Response) => {
    const token = req.params.token
    const request = JSON.parse(await getRedis(token))

    if (!request) {
        res.status(404).send("Request not found.")
        return
    }

    res.json({ status: request.status, progress: request.progress })
}

export const endUrlRequest = async (req: Request, res: Response) => {
    const token = req.params.token
    const request = JSON.parse(await getRedis(token))

    if (!request) {
        res.status(404).send("Request not found.")
        return
    }

    if (request.status === "completed") {
        res.json({ response: request.response })
        await deleteRedis(token)
    } else if (request.status === "error") {
        res.status(500).json({ error: request.error })
        await deleteRedis(token)
    } else {
        res.status(202).json({ status: "Still processing" })
    }
}
