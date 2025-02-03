import mongoose, { Schema } from "mongoose"
import { ISection } from "../types/ISection"

const SectionSchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        title: String,
        jsonUrl: String,
    },
    {
        timestamps: true
    }
)

export default mongoose.model<ISection>("Section", SectionSchema)
