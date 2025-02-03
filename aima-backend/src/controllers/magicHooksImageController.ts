import { Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"
import { processImageRequest } from "../utils/processImageRequest"
import { deleteRedis, getRedis, setRedis } from "../services/redis.service"

export const startImageRequest = async (
    req: Request,
    res: Response
): Promise<void> => {
    if (!req.file) {
        res.status(400).send("No file uploaded.")
        return
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const userId = req.user.id

    const token = `pending-request:${uuidv4()}`
    await setRedis(token, JSON.stringify({ status: "processing", progress: 0 }))

    processImageRequest(req.file, token, userId).catch(async (err) => {
        console.error(err)
        await setRedis(
            token,
            JSON.stringify({
                status: "error",
                error: err.message,
                progress: 0
            })
        )
    })

    res.json({ token })
}
export const queryImageRequest = async (req: Request, res: Response) => {
    const token = req.params.token
    const request = JSON.parse(await getRedis(token))

    if (!request) {
        res.status(404).send("Request not found.")
        return
    }

    res.json({ status: request.status, progress: request.progress })
}

export const endImageRequest = async (req: Request, res: Response) => {
    const token = req.params.token
    const request = JSON.parse(await getRedis(token))

    if (!request) {
        res.status(404).send("Request not found.")
        return
    }

    if (request.status === "completed") {
        const parsedContent = JSON.parse(request.response as string)

        res.json({
            response: JSON.stringify(parsedContent.response),
            imgUrl: parsedContent.imgUrl
        })
        await deleteRedis(token)
    } else if (request.status === "error") {
        res.status(500).json({ error: request.error })
        await deleteRedis(token)
    } else {
        res.status(202).json({ status: "Still processing" })
    }
}
