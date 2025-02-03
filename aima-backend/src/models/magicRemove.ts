import mongoose, { Document, Schema } from "mongoose"

interface IMagicRemove extends Document {
    userId: mongoose.Schema.Types.ObjectId
    image: string
    mask: string
    result: string
}

const MagicRemoveSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    creationTimes: [{ type: Date, required: true }]
})

export default mongoose.model<IMagicRemove>("MagicRemove", MagicRemoveSchema)
