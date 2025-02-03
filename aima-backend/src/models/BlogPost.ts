import mongoose, { Schema } from "mongoose"
import { IBlogPost } from "../types/IBlogPost"

const BlogPostSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        author: {
            type: String,
            default: "anonymous"
        },
        slug: {
            type: String,
            required: true,
            unique: true
        },
        content: {
            type: String,
            required: false,
            default: ""
        },
        heroImage: {
            type: String,
            required: false,
            default: ""
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IBlogPost>("BlogPost", BlogPostSchema)
