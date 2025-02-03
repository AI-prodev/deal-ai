import { Schema, Document } from "mongoose"

export interface ISection extends Document {
    user: Schema.Types.ObjectId,
    title: string,
    jsonUrl: string
}
