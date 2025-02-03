import { Document, Schema } from "mongoose"

export interface IBlogPost extends Document {
    title: string
    content: string
    author: string
    heroImage: string
    slug: string
    user: Schema.Types.ObjectId
}
