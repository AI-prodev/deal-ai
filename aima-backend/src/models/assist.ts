import mongoose, { Schema } from "mongoose"
import {
    ITicket,
    TicketStatusEnum,
    IMessage,
    MessageTypeEnum
} from "../types/ITicket"

export const MessageSchema = new mongoose.Schema<IMessage>(
    {
        message: { type: String },
        images: { type: [String] },
        type: {
            type: String,
            enum: MessageTypeEnum,
            default: MessageTypeEnum.TEXT
        },
        sentBy: { type: Schema.Types.Mixed, required: true },
        seenBy: { type: [Schema.Types.Mixed] },
        isBot: { type: Boolean, default: false }
    },
    { timestamps: true }
)

export const AssistSchema = new mongoose.Schema<ITicket>(
    {
        appKey: { type: String, required: true },
        visitor: {
            _id: { type: String, required: true },
            name: { type: String, required: true },
            email: { type: String },
            language: { type: String },
            location: { type: String },
            receivedMail: {
                type: Boolean,
                default: false
            }
        },
        messages: { type: [MessageSchema], default: [] },
        status: {
            type: String,
            enum: Object.values(TicketStatusEnum),
            default: TicketStatusEnum.OPEN
        }
    },
    {
        timestamps: true
    }
)

export const AssistModel: mongoose.Model<ITicket> = mongoose.model(
    "Assist",
    AssistSchema
)

export default AssistModel
