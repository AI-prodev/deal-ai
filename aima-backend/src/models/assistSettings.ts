import mongoose from "mongoose"
import { IAssistSettings } from "../types/ITicket"

export const AssistSettingsSchema = new mongoose.Schema<IAssistSettings>(
    {
        appKey: { type: String, required: true },
        name: { type: String },
        color: { type: String, required: true },
        url: { type: String }
    },
    {
        timestamps: true
    }
)

export const AssistSettingsModel: mongoose.Model<IAssistSettings> =
    mongoose.model("AssistsSetting", AssistSettingsSchema)

export default AssistSettingsModel
