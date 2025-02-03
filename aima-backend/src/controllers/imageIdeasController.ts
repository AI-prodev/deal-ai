import { Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { processRequestImageIdeas } from "../utils/processRequestImageIdeas"
import { setRedis, getRedis, deleteRedis } from "../services/redis.service"
import creationService from "../services/creation.service"

export const startImageIdeasRequest = async (req: Request, res: Response) => {
    const input = req.body
    const token = `pending-request:${uuidv4()}`

    console.log("input", input, req.body)
    if (!input) {
        res.status(400).send("Missing input.")
        return
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const userId = req.user.id

    await setRedis(
        token,
        JSON.stringify({
            status: "processing",
            progress: 0,
            input: input
        })
    )
    processRequestImageIdeas(token, input, userId).catch(async (err) => {
        console.error(err)
        await setRedis(
            token,
            JSON.stringify({
                status: "error",
                error: err.message,
                input
            })
        )
    })

    res.json({ token })
}

export const endImageIdeasRequest = async (
    req: IExtendedRequest,
    res: Response
): Promise<void> => {
    const token = req.params.token
    const request = JSON.parse(await getRedis(token))
    const id = req.user.id
    if (!request) {
        res.status(404).send("Request not found.")
        return
    }

    if (request.status === "completed") {
        const parsedContent = JSON.parse(request.response as string)
        const results: any = await creationService.addCreations(
            id,
            "image-ideas",
            request.input as any,
            parsedContent
        )

        const responseData = results.map((result: any) => ({
            result: result.output,
            id: result._id
        }))

        res.json({ response: responseData })

        await deleteRedis(token)
    } else if (request.status === "error") {
        res.status(500).json({ error: request.error })
        await deleteRedis(token)
    } else {
        res.status(202).json({ status: "Still processing" })
    }
}

export const queryImageIdeasRequest = async (req: Request, res: Response) => {
    const token = req.params.token
    const request = JSON.parse(await getRedis(token))

    if (!request) {
        res.status(404).send("Request not found.")
        return
    }

    res.json({
        status: request.status,
        progress: request.progress,
        error: request.error
    })
}
