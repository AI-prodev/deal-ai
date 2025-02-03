import { Request, Response } from "express"
import { IExtendedRequest } from "../types/IExtendedRequest"
import creationService from "../services/creation.service"
import { v4 as uuidv4 } from "uuid"
import { processAdSocialImageRequest } from "../utils/processRequestAdSocialImage"
import { setRedis, getRedis, deleteRedis } from "../services/redis.service"

export const startAdSocialImageRequest = (
    req: Request,
    res: Response
): void => {
    const input = req.body
    const token = `pending-request:${uuidv4()}`

    if (!input) {
        res.status(400).send("Missing input.")
        return
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const userId = req.user.id

    setRedis(token, JSON.stringify({
        status: "processing",
        progress: 0,
        input: input
    }))

    processAdSocialImageRequest(input, token, userId).catch(
        (err) => {
            console.error(err)
            setRedis(token, JSON.stringify({
                status: "error",
                error: err.message,
                progress: 100,
                input
            }))
        }
    )

    res.json({ token })
}

export const endAdSocialImageRequest = async (
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
            "ad-social-image",
            request.input as any,
            [parsedContent]
        )

        res.json({
            response: results.map((result: any) => ({
                url: result.output.url,
                prompt: result.output.prompt,
                id: result._id,
                input: result.input
            }))
        })

        deleteRedis(token)
    } else if (request.status === "error") {
        res.status(500).json({ error: request.error })
        deleteRedis(token)
    } else {
        res.status(202).json({ status: "Still processing" })
    }
}

export const queryAdSocialImageRequest = async (
    req: Request,
    res: Response
) => {
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
