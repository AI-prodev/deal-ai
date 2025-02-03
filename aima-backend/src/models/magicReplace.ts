import mongoose, { Document, Schema } from "mongoose"

interface IMagicReplace extends Document {
    userId: mongoose.Schema.Types.ObjectId
    image: string
    mask: string
    result: string
}

const MagicReplaceSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    creationTimes: [{ type: Date, required: true }]
})

export default mongoose.model<IMagicReplace>("MagicReplace", MagicReplaceSchema)
