import { Response } from "express"
import { v4 as uuidv4 } from "uuid"
import { processRequest } from "../utils/processRequest"
import { SocrateLandQuery } from "../types/query"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { setRedis } from "../services/redis.service"

export const SocratesLandStartRequest = async (
    req: IExtendedRequest,
    res: Response
) => {
    const token = `pending-request:${uuidv4()}`

    let socratesLandInput: SocrateLandQuery

    try {
        socratesLandInput = req.body
    } catch (err) {
        console.error("Couldn't parse socratesLandInput")
        console.error(err)
    }

    await setRedis(token, JSON.stringify({ status: "processing", progress: 0 }))
    const userId = req.user.id

    processRequest(token, socratesLandInput, userId).catch(async (err) => {
        console.error(err)
        await setRedis(token, JSON.stringify({
            status: "error",
            error: err.message
        }))
    })

    res.json({ token })
}
