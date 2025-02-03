import { Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"
import { IExtendedRequest } from "../types/IExtendedRequest"
import creationService from "../services/creation.service"
import {
    getRedis,
    setRedis,
    deleteRedis,
    updateOrCreateComposite
} from "../services/redis.service"
import { processRequestFaq } from "../utils/processRequestFaq"

export const startFaqRequest = async (req: Request, res: Response) => {
    const input = req.body
    const token = `pending-request:${uuidv4()}`

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
    processRequestFaq(token, input, userId).catch(async (err) => {
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

export const endFaqRequest = async (
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
        const parsedContent = JSON.parse(request.response as string)

        const slicedContent = parsedContent.slice(0, 20)

        const results: any = await creationService.addCreations(
            id,
            "faq",
            request.input as any,
            slicedContent
        )

        res.json({
            response: results.map((result: any) => ({
                q: result.output.q,
                a: result.output.a,
                id: result._id,
                input: result.input,
                lang: (request.input as { language: string }).language
            }))
        })

        await deleteRedis(token)

        const input = request.input as { correlationId?: string }

        if (input?.correlationId) {
            await updateOrCreateComposite(
                `correlationId:${input.correlationId}`,
                {
                    input: input,
                    output: {
                        faqs: slicedContent.slice(0, 4)
                    }
                }
            )
        }
    } else if (request.status === "error") {
        res.status(500).json({ error: request.error })
        await deleteRedis(token)
    } else {
        res.status(202).json({ status: "Still processing" })
    }
}

export const queryFaqRequest = async (req: Request, res: Response) => {
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
