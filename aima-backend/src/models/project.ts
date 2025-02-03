import mongoose, { Schema } from "mongoose"
import { IProject } from "../types/IProject"

const ProjectSchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        title: String
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IProject>("Project", ProjectSchema)
