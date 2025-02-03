import mongoose, { Schema } from "mongoose"
import { IIntegration } from "../types/IIntegration"

export const IntegrationSchema = new mongoose.Schema<IIntegration>(
    {
        user: { type: String, required: true },
        type: { type: String, required: true, enum: ["stripe", "zapier", "sendgrid"] },
        data: {
            type: Schema.Types.Mixed,
            required: false
        }
    },
    {
        timestamps: true
    }
)

const IntegrationModel = mongoose.model(
    "Integration",
    IntegrationSchema
)

export default IntegrationModel
