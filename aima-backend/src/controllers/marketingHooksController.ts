// MarketingHooksController.ts

import { Request, Response } from "express"
import { IExtendedRequest } from "../types/IExtendedRequest"
import creationService from "../services/creation.service"
import { v4 as uuidv4 } from "uuid"
import { processRequestMarketing } from "../utils/processRequestMarketing"
import {
    setRedis,
    getRedis,
    deleteRedis,
    updateOrCreateComposite
} from "../services/redis.service"
import { Mixed } from "mongoose"
import { finalizeCompositeCreationInternal } from "./compositeCreationController"

interface Hook {
    h: string // Hook text
    c: number // C score
    l: number // L score
    a: number // A score
}

export const startMarketingRequest = async (req: Request, res: Response) => {
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
    processRequestMarketing(token, input, userId).catch(async (err) => {
        console.error(err.message)
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

export const endMarketingRequest = async (
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

        const slicedContent = parsedContent
            .sort((a, b) => b.c + b.l + b.a - (a.c + a.l + a.a))
            .slice(0, 20)

        const results = await creationService.addCreations(
            id,
            "marketing-hook",
            request.input,
            slicedContent as any
        )

        res.json({
            response: results.map((result: any) => ({
                h: result.output.h,
                c: result.output.c,
                l: result.output.l,
                a: result.output.a,
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
                        "magic-hook": slicedContent[0].h
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

export const queryMarketingRequest = async (req: Request, res: Response) => {
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
