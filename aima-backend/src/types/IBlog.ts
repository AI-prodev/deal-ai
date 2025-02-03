import { Schema, Document } from "mongoose"

export interface IBlog extends Document {
    user: Schema.Types.ObjectId
    domain: Schema.Types.ObjectId
    subdomain?: string;
    title: string
    logoImage?: string
    posts: Schema.Types.ObjectId[]
}
