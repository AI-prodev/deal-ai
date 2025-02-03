import mongoose, { Schema } from "mongoose"
import { BroadcastEmailStatus, IBroadcastEmail } from "../types/IBroadcastEmail"

const BroadcastEmailSchema: Schema = new Schema(
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
        lists: [
            {
                type: Schema.Types.ObjectId,
                ref: "List",
                required: true
            }
        ],
        status: {
            type: String,
            default: BroadcastEmailStatus.draft,
            enum: BroadcastEmailStatus,
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
        scheduledAt: {
            type: Date
        },
        sentAt: {
            type: Date
        },
        opensCount: {
            type: Number,
            default: 0
        },
        bounceCount: {
            type: Number,
            default: 0
        },
        recipientsCount: {
            type: Number,
            default: 0
        },
        deliveredCount: {
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

export default mongoose.model<IBroadcastEmail>(
    "BroadcastEmail",
    BroadcastEmailSchema
)
