import mongoose, { Schema } from "mongoose"
import {
    BroadcastEmailDataStatus,
    IBroadcastEmailData
} from "../types/IBroadcastEmailData"

const BroadcastEmailDataSchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        sendgridAccount: {
            type: Schema.Types.ObjectId,
            ref: "Integration",
            required: true
        },
        broadcastEmail: {
            type: Schema.Types.ObjectId,
            ref: "BroadcastEmail",
            required: true
        },
        messageId: {
            type: String,
            required: false
        },
        status: {
            type: String,
            default: BroadcastEmailDataStatus.sent,
            enum: BroadcastEmailDataStatus,
            required: true
        },
        subject: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        html: {
            type: String,
            required: true
        },
        from: {
            type: Object,
            required: true
        },
        to: {
            type: Object,
            required: true
        },
        scheduledAt: {
            type: Date
        },
        sentAt: {
            type: Date,
            default: new Date()
        },
        opensCount: {
            type: Number,
            default: 0
        },
        clickCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IBroadcastEmailData>(
    "BroadcastEmailData",
    BroadcastEmailDataSchema
)
