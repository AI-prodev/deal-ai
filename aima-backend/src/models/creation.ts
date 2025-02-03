import mongoose, { Schema, Types } from "mongoose"
import { Document } from "mongoose"
import { IUser } from "../types/IUser"

export interface ICreation {
    type: string
    user: IUser["_id"]
    input: Schema.Types.Mixed
    output: Schema.Types.Mixed
    rating?: number
}

const CreationSchema: Schema = new Schema(
    {
        type: {
            type: String,
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        input: {
            type: Schema.Types.Mixed,
            required: true
        },
        output: {
            type: Schema.Types.Mixed,
            required: true
        },
        rating: {
            type: Number,
            required: false
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<ICreation>("Creation", CreationSchema)
