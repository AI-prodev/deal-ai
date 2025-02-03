import { Response } from "express"
import AssistSettingsService from "../services/assistSettings.service"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { IAssistSettings } from "../types/ITicket"
import { validationResult } from "express-validator"

export const getAssistSettings = async (
    req: IExtendedRequest,
    res: Response
): Promise<IAssistSettings | Record<string, any>> => {
    try {
        const { assistKey } = req.query

        const assistSettings = await AssistSettingsService.getAssistSettings(
            assistKey as string
        )
        return res.status(200).json(assistSettings)
    } catch (error) {
        return res.status(500).json({
            error: `Error fetching assist settings: ${error?.message}`,
            message: error.message
        })
    }
}

export const patchAssistSettings = async (
    req: IExtendedRequest,
    res: Response
): Promise<IAssistSettings | Record<string, any>> => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { id } = req.user
        const { name, color, url } = req.body

        const assistSettings = await AssistSettingsService.patchAssistSettings(
            id,
            { name, color, url }
        )
        return res.status(200).json(assistSettings)
    } catch (error) {
        return res.status(500).json({
            error: `Error patching assist settings: ${error?.message}`,
            message: error.message
        })
    }
}
