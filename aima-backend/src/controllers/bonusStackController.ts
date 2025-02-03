import { Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"
import { IExtendedRequest } from "../types/IExtendedRequest"
import creationService from "../services/creation.service"
import { processRequestBonusStack } from "../utils/processRequestBonusStack"
import { setRedis, getRedis, deleteRedis } from "../services/redis.service"

export const startBonusStackRequest = async (req: Request, res: Response) => {
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

    await setRedis(token, JSON.stringify({
        status: "processing",
        progress: 0,
        input: input
    }))
    processRequestBonusStack(token, input, userId).catch(
        async (err) => {
            console.error(err)
            await setRedis(token, JSON.stringify({
                status: "error",
                error: err.message,
                input
            }))
        }
    )

    res.json({ token })
}

export const endBonusStackRequest = async (
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
        console.log(slicedContent)

        const results: any = await creationService.addCreations(
            id,
            "bonus-stack",
            request.input as any,
            slicedContent
        )

        res.json({
            response: results.map((result: any) => ({
                b: result.output.b,
                r: result.output.r,
                id: result._id,
                input: result.input,
                lang: (request.input as { language: string }).language
            }))
        })

        await deleteRedis(token)
    } else if (request.status === "error") {
        res.status(500).json({ error: request.error })
        await deleteRedis(token)
    } else {
        res.status(202).json({ status: "Still processing" })
    }
}

export const queryBonusStackRequest = async (req: Request, res: Response) => {
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
