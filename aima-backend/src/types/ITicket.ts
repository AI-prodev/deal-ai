import { Schema, Document } from "mongoose"

export interface IVisitor {
    _id: string
    name: string
    email?: string
    language: string
    location: string
    receivedMail?: boolean
}
export enum MessageTypeEnum {
    TEXT = "Text",
    IMAGE = "Image"
}
export interface IMessage {
    _id?: string
    sentBy: Schema.Types.ObjectId | Pick<IVisitor, "_id" | "name">
    seenBy: [Schema.Types.ObjectId | string]
    message?: string
    images?: string[]

    type?: MessageTypeEnum
    isBot?: boolean

    createdAt?: Date
    updatedAt?: Date
}

export enum TicketStatusEnum {
    OPEN = "OPEN",
    CLOSED = "CLOSED"
}
export interface ITicket extends Document {
    _id?: Schema.Types.ObjectId
    appKey: Schema.Types.ObjectId
    visitor: IVisitor

    status: TicketStatusEnum

    messages: IMessage[]

    createdAt?: Date
    updatedAt?: Date
}

export interface IAssistSettings extends Document {
    appKey: string
    name: string
    url: string
    color: string
}
