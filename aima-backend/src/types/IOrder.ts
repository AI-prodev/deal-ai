import { Schema, Document } from "mongoose"

export interface IOrder extends Document {
    project?: Schema.Types.ObjectId,
    funnel: Schema.Types.ObjectId,
    contact: Schema.Types.ObjectId,
    page: Schema.Types.ObjectId,
    transaction: string;
    customer: string;
    product: string;
    amount: number;
    type: string;
    interval: string;
}

export interface OrderData {
    project: string;
    funnel: string;
    contact: string;
    page: string;
    type: string;
    customer: string;
    product: string;
    transaction?: string;
    amount?: number;
    interval?: string
}
