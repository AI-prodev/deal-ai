import { Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"

import { processRequestPageGenerator } from "../utils/processRequestPageGenerator"
import { deleteRedis, getRedis, setRedis } from "../services/redis.service"


export const startPageGeneratorRequest = async (req: Request, res: Response) => {
    const { input, projectId, funnelId, title } = req.body
    const token = `pending-request:${uuidv4()}`

    console.log("input", input, req.body)
    if (!input) {
        res.status(400).send("Missing input.")
        return
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const userId = req.user.id

    await setRedis(token, JSON.stringify({ status: "processing", progress: 0 }))

    processRequestPageGenerator(token, title, input, userId, projectId, funnelId).catch(
        async (err) => {
            console.error(err)
            await setRedis(token, JSON.stringify({
                status: "error",
                error: err.message
            }))
        }
    )

    res.json({ token })
}

export const endPageGeneratorRequest = async (
    req: Request,
    res: Response
): Promise<void> => {
    const token = req.params.token
    const request = JSON.parse(await getRedis(token))

    if (!request) {
        res.status(404).send("Request not found.")
        return
    }

    if (request.status === "completed") {
        const parsedContent = JSON.parse(request.response as string)

        res.json({ response: parsedContent })

        await deleteRedis(token)
    } else if (request.status === "error") {
        res.status(500).json({ error: request.error })
        await deleteRedis(token)
    } else {
        res.status(202).json({ status: "Still processing" })
    }
}

export const queryPageGeneratorRequest = async (req: Request, res: Response) => {
    const token = req.params.token
    const request = JSON.parse(await getRedis(token))

    if (!request) {
        res.status(404).send("Request not found.")
        return
    }

    res.json({ status: request.status, progress: request.progress })
}
