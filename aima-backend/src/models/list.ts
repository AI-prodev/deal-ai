import mongoose, { Schema } from "mongoose"
import { IList } from "../types/IList"

const ListSchema: Schema = new Schema(
    {
        title: String,
        numContacts: {
            type: Number,
            default: 0
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IList>("List", ListSchema)
