import mongoose, { Schema } from "mongoose"
import { INote } from "../types/INote"

const NoteSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        data: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<INote>("Note", NoteSchema)
