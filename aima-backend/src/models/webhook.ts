import mongoose, { Schema } from "mongoose"
import { IWebhook } from "../types/IWebhook"

const WebhookSchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project"
        },
        funnel: {
            type: Schema.Types.ObjectId,
            ref: "Funnel"
        },
        page: {
            type: Schema.Types.ObjectId,
            ref: "Page"
        },
        contact: {
            type: Schema.Types.ObjectId,
            ref: "Contact"
        },

        url: String,
        payload: Schema.Types.Mixed,
        
        status: Number,
        succeeded: { type: Date },
        failed: { type: Date },
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IWebhook>("Webhook", WebhookSchema)
