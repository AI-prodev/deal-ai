import { Request, Response } from "express"
import { IExtendedRequest } from "../types/IExtendedRequest"
import creationService from "../services/creation.service"
import { v4 as uuidv4 } from "uuid"

import {
    setRedis,
    getRedis,
    deleteRedis,
    updateOrCreateComposite
} from "../services/redis.service"
import {
    processRequestEmailAbandonedCart,
    processRequestEmailBroadcast
} from "../utils/processRequestEmailSequence"

interface Hook {
    h: string // Hook text
    c: number // C score
    l: number // L score
    a: number // A score
}

export const startEmailSequenceRequest = async (
    req: Request,
    res: Response
) => {
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

    switch (input.type) {
        case "Abandoned Cart Sequence":
            processRequestEmailAbandonedCart(token, input, userId).catch(
                async (err) => {
                    console.error(err.message)
                    await setRedis(
                        token,
                        JSON.stringify({
                            status: "error",
                            error: err.message,
                            input
                        })
                    )
                }
            )
            break
        case "News Broadcast":
            processRequestEmailBroadcast(token, input, userId).catch(
                async (err) => {
                    console.error(err.message)
                    await setRedis(
                        token,
                        JSON.stringify({
                            status: "error",
                            error: err.message,
                            input
                        })
                    )
                }
            )
            break
        default:
            res.status(400).send("Invalid type.")
            return
    }

    res.json({ token })
}

export const endEmailSequenceRequest = async (
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
        const parsedContent: Hook[] = JSON.parse(request.response as string)

        const slicedContent = parsedContent.slice(0, 20)

        const results = await creationService.addCreations(
            id,
            "email-sequence",
            request.input,
            slicedContent as any
        )

        res.json({
            response: results.map((result: any) => ({
                output: result.output,
                id: result._id,
                input: {
                    correlationId: request?.input?.correlationId
                },
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
                        "email-sequence": slicedContent[0].h
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

export const queryEmailSequenceRequest = async (
    req: Request,
    res: Response
) => {
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
