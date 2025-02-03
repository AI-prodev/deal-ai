import UserModel from "../models/user"
import AssistSettingsModel from "../models/assistSettings"
import { IAssistSettings } from "../types/ITicket"

const createAssistSettings = async (
    assistKey: string
): Promise<IAssistSettings> => {
    try {
        const assistSettingsFound = await AssistSettingsModel.findOne({
            appKey: assistKey
        })
        if (assistSettingsFound)
            throw new Error("Assist Settings already exists")

        if (!assistKey) throw new Error("Key not found")

        const assistSettingsCreated = await AssistSettingsModel.create({
            appKey: assistKey,
            name: "",
            url: "",
            color: "#4361ee"
        })

        return assistSettingsCreated
    } catch (error) {
        throw new Error(error)
    }
}

const getAssistSettings = async (
    assistKey: string
): Promise<IAssistSettings> => {
    try {
        if (!assistKey) throw new Error("Key not found")
        const assistSettingsFound = await AssistSettingsModel.findOne({
            appKey: assistKey
        })
        if (!assistSettingsFound) {
            const newAssistSettings = await createAssistSettings(assistKey)
            return newAssistSettings
        }
        return assistSettingsFound
    } catch (error) {
        throw new Error(error)
    }
}

const patchAssistSettings = async (
    userId: string,
    body: Record<string, string>
): Promise<IAssistSettings> => {
    try {
        const { assistKey } = await UserModel.findOne(
            { _id: userId },
            "assistKey"
        )
        if (!assistKey) throw new Error("Key not found")
        const assistSettingsFound = await AssistSettingsModel.findOneAndUpdate(
            {
                appKey: assistKey
            },
            body,
            { new: true }
        )

        return assistSettingsFound
    } catch (error) {
        throw new Error(error)
    }
}
export default {
    createAssistSettings,
    getAssistSettings,
    patchAssistSettings
}
