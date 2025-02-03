import { Schema, Document } from "mongoose"
import User from "../models/user"
import Integration from "../models/integration"
import BroadcastEmail from "../models/broadcastEmail"
import { EmailData } from "@sendgrid/helpers/classes/email-address"

enum BroadcastEmailDataStatus {
    scheduled = "scheduled",
    sent = "sent",
    failed = "failed"
}

interface IBroadcastEmailData extends Document {
    user: Schema.Types.ObjectId | typeof User
    sendgridAccount: Schema.Types.ObjectId | typeof Integration
    broadcastEmail: Schema.Types.ObjectId | typeof BroadcastEmail
    messageId: string
    from: EmailData
    to: EmailData
    status: BroadcastEmailDataStatus
    subject: string
    title: string
    html: string
    sentAt: Date | null
    opensCount?: number | null
    clickCount?: number | null
}

export { IBroadcastEmailData, BroadcastEmailDataStatus }
