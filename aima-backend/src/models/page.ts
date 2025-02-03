import mongoose, { Schema } from "mongoose"
import { IPage } from "../types/IPage"

const PageSchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project"
        },
        funnel: {
            type: Schema.Types.ObjectId,
            ref: "Funnel"
        },
        products: {
            type: [{
                priceId: String,
                productId: String,
                accountId: String,
                type: {
                    type: String,
                    enum: ["one_time", "recurring"],
                }
            }],
            default: [],
            required: false
        },
        funnelStep: Number,
        contentUrl: String,
        jsonUrl: String,
        thumbnailUrl: String,
        title: String,
        path: String,
        extraBody: String,
        extraHead: String,
        input: {
            type: Schema.Types.Mixed
        },
        fields: {
            type: Schema.Types.Mixed
        },
        versions: [
            {
                contentUrl: String,
                jsonUrl: String,
                thumbnailUrl: String,
                updatedAt: Date
            }
        ]
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IPage>("Page", PageSchema)
