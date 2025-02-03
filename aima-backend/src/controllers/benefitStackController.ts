import { Request, Response } from "express"
import { IExtendedRequest } from "../types/IExtendedRequest"
import creationService from "../services/creation.service"
import { v4 as uuidv4 } from "uuid"
import { processRequestBenefitStack } from "../utils/processRequestBenefitStack"
import {
    setRedis,
    getRedis,
    deleteRedis,
    updateOrCreateComposite
} from "../services/redis.service"

export const startBenefitStackRequest = async (req: Request, res: Response) => {
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
    processRequestBenefitStack(token, input, userId).catch(async (err) => {
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

export const endBenefitStackRequest = async (
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
            "benefit-stack",
            request.input as any,
            slicedContent
        )

        res.json({
            response: results.map((result: any) => ({
                n: result.output.n,
                a: result.output.a,
                id: result._id,
                input: {
                    correlationId: request?.input?.correlationId
                },
                lang: (request.input as { language: string }).language
            }))
        })

        deleteRedis(token)

        const input = request.input as { correlationId?: string }

        if (input?.correlationId) {
            await updateOrCreateComposite(
                `correlationId:${input.correlationId}`,
                {
                    input: input,
                    output: {
                        "benefit-stacks": slicedContent
                            .slice(0, 4)
                            .map((stack: any) => stack.a)
                    }
                }
            )
        }
    } else if (request.status === "error") {
        res.status(500).json({ error: request.error })
        deleteRedis(token)
    } else {
        res.status(202).json({ status: "Still processing" })
    }
}

export const queryBenefitStackRequest = async (req: Request, res: Response) => {
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
