import mongoose, { Document, Schema } from "mongoose"

export interface IUpdateStats extends Document {
    businessesLastUpdated: number
    landLastUpdated: number
    businessesVectorCount: number
    landVectorCount: number
}

const updateStatsSchema: Schema = new Schema({
    businessesLastUpdated: { type: Number, required: true },
    landLastUpdated: { type: Number, required: true },
    businessesVectorCount: { type: Number, required: true },
    landVectorCount: { type: Number, required: true }
})

export default mongoose.model<IUpdateStats>("UpdateStats", updateStatsSchema)
