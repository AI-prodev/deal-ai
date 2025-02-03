// MarketingHooksController.ts

import { Request, Response } from "express"
import { IExtendedRequest } from "../types/IExtendedRequest"
import creationService from "../services/creation.service"
import { finalizeComposite } from "../services/redis.service"
import { ICreation } from "../models/creation"

export const finalizeCompositeCreationInternal = async (
    id: string,
    type: string,
    correlationId: string,
    additionalInput?: object,
    additionalOutput?: object
): Promise<object | string> => {
    console.log("finalizeCompositeCreationInternal", id, type, correlationId)

    const creation = (await finalizeComposite(
        `correlationId:${correlationId}`
    )) as {
        input: object
        output: object
    }

    if (0 === Object.keys(creation).length) {
        return "Composite not found."
    }

    creation.input = { ...creation.input, ...additionalInput }
    creation.output = { ...creation.output, ...additionalOutput }

    const results = (await creationService.addCreations(
        id,
        type,
        creation.input as any,
        [creation.output as any]
    )) as (ICreation & { _id: string })[]

    console.log(results)

    return {
        id: results[0]._id
    }
}

export const finalizeCompositeCreation = async (
    req: IExtendedRequest,
    res: Response
): Promise<void> => {
    const result: string | object = await finalizeCompositeCreationInternal(
        req.user.id,
        req.params.type,
        req.params.correlationId,
        req.body.additionalInput,
        req.body.additionalOutput
    )

    if (typeof result === "string") {
        res.status(404).send(result)
        return
    }

    res.json(result)
}
