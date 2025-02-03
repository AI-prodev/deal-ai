import { Schema, Document } from "mongoose"

export interface IFile extends Document {
    user: Schema.Types.ObjectId
    folder: Schema.Types.ObjectId // undefined for root folder
    displayName: string
    mimeType: string
    size: number
    shareToken?: string
}
