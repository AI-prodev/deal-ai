import mongoose, { Schema } from "mongoose"
import { IFile } from "../types/IFile"

const FileSchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        folder: {
            type: Schema.Types.ObjectId,
            ref: "Folder"
        },
        displayName: String,
        mimeType: String,
        size: Number,
        shareToken: String
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IFile>("File", FileSchema)
