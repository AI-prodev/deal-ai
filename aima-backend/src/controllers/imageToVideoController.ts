import { Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"
import { IExtendedRequest } from "../types/IExtendedRequest"
import creationService from "../services/creation.service"
import { processImageToVideoRequest } from "../utils/processRequestImageToVideo"
import { deleteRedis, getRedis, setRedis } from "../services/redis.service"

export const startImageToVideoRequest = async (req: Request, res: Response) => {
    const input = req.body
    const token = `pending-request:${uuidv4()}`

    if (!input) {
        res.status(400).send("Missing input.")
        return
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const userId = req.user.id

    await setRedis(token, JSON.stringify({
        status: "processing",
        progress: 0,
        input: input
    }))

    processImageToVideoRequest(input, token, userId).catch(async (err) => {
        console.error("err", err)
        await setRedis(token, JSON.stringify({
            status: "error",
            error: err.message,
            progress: 100,
            input
        }))
    })

    res.json({ token })
}

export const endImageToVideoRequest = async (
    req: IExtendedRequest,
    res: Response
): Promise<void> => {
    const id = req.user.id
    const token = req.params.token
    const request = JSON.parse(await getRedis(token))

    if (!request) {
        res.status(404).send("Request not found.")
        return
    }

    if (request.status === "completed") {
        const parsedContent = JSON.parse(request.response)

        const results: any = await creationService.addCreations(
            id,
            "image-to-video",
            request.input as any,
            [parsedContent]
        )

        res.json({
            response: results.map((result: any) => ({
                url: result.output.url,
                id: result._id,
                input: result.input
            }))
        })

        await deleteRedis(token)
    } else if (request.status === "error") {
        console.log(request.error)
        res.status(500).json({ error: request.error })
        await deleteRedis(token)
    } else {
        res.status(202).json({ status: "Still processing" })
    }
}

export const queryImageToVideoRequest = async (req: Request, res: Response) => {
    const token = req.params.token
    const request = JSON.parse(await getRedis(token))

    if (!request) {
        res.status(404).send("Request not found.")
        return
    }

    if (request.status === "error") {
        res.json({ status: request.status, progress: request.progress, error: request.error })
    } else {
        res.json({ status: request.status, progress: request.progress })
    }
}
