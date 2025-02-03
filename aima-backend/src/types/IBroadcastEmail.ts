import { Schema, Document } from "mongoose"
import Integration from "../models/integration"
import List from "../models/list"
import User from "../models/user"
import { EmailData } from "@sendgrid/helpers/classes/email-address"

export enum BroadcastEmailStatus {
    draft = "draft",
    scheduled = "scheduled",
    sendNow = "sendNow",
    report = "report"
}

export interface IBroadcastEmail extends Document {
    user: Schema.Types.ObjectId | typeof User
    sendgridAccount: Schema.Types.ObjectId | typeof Integration
    status: BroadcastEmailStatus
    lists: Schema.Types.ObjectId[] | (typeof List)[]
    subject: string
    title: string
    html: string
    from: EmailData
    scheduledAt?: Date | null
    sentAt?: Date | null
    opensCount: number | null
    bounceCount: number | null
    recipientsCount: number | null
    deliveredCount: number | null
    clickCount: number | null
}
