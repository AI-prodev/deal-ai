import mongoose, { Schema } from "mongoose"
import { IOrder } from "../types/IOrder"

export const OrderSchema = new mongoose.Schema<IOrder>(
    {
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project"
        },
        funnel: {
            type: Schema.Types.ObjectId,
            ref: "Funnel"
        },
        contact: {
            type: Schema.Types.ObjectId,
            ref: "Contact"
        },
        page: {
            type: Schema.Types.ObjectId,
            ref: "Page"
        },
        transaction: { type: String, required: true},
        amount: { type: Number },
        product: { type: String, required: true },
        customer: { type: String, required: true },
        interval: { type: String },
        type: {
            type: String,
            enum: ["one_time", "recurring"],
        }
    },
    {
        timestamps: true
    }
)

export const OrderModel: mongoose.Model<IOrder> = mongoose.model(
    "Order",
    OrderSchema
)