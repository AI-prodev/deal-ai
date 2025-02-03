import mongoose, { Schema, Types } from "mongoose"

export interface IAIEditor extends Document {
    originalUrl: string
    editedUrl: string
    userId: Types.ObjectId
}

const AIEditorSchema: Schema = new Schema(
    {
        originalUrl: {
            type: String,
            required: true
        },
        editedUrl: {
            type: String
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IAIEditor>("AIEditor", AIEditorSchema)
