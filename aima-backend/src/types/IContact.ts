import { Schema, Document } from "mongoose"

export interface IContact extends Document {
    user: Schema.Types.ObjectId
    project?: Schema.Types.ObjectId
    funnel?: Schema.Types.ObjectId
    page?: Schema.Types.ObjectId
    firstName?: string
    lastName?: string
    email?: string
    listIds: Schema.Types.ObjectId[]
    address?: Record<string, any>
    shippingAddress?: Record<string, any>
    ip?: string
    unsubscribed?: boolean
    phoneNumber?: string
}

export interface IContactExtended extends IContact {
    numOfLists?: number
    numOfPurchases?: number
}
