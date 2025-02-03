import mongoose, { Schema } from "mongoose"
import { IBlog } from "../types/IBlog"

const BlogSchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        domain: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: "Domain"
        },
        subdomain: {
            type: String,
            required: false,
        },
        title: {
            type: String,
            required: false
        },
        logoImage: {
            type: String,
            required: false
        },
        posts: {
            type: [Schema.Types.ObjectId],
            ref: "BlogPost",
            required: false,
            default: []
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IBlog>("Blog", BlogSchema)
