import mongoose, { Schema } from "mongoose"
import { IFolder } from "../types/IFolder"

const FolderSchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        parentFolder: {
            type: Schema.Types.ObjectId,
            ref: "Folder"
        },
        displayName: String
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IFolder>("Folder", FolderSchema)
