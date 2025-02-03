import { Schema, Document } from "mongoose"

export interface IFolder extends Document {
    user: Schema.Types.ObjectId
    parentFolder?: Schema.Types.ObjectId // undefined for root folder
    displayName?: string
}
