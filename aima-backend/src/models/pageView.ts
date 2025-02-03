import mongoose, { Schema } from "mongoose"
import { IPageView } from "../types/IPageView"

const pageViewSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true },
    project: { type: Schema.Types.ObjectId, required: false },
    funnel: { type: Schema.Types.ObjectId, required: true },
    page: { type: Schema.Types.ObjectId, required: true },
    ipAddr: { type: String }
}, { timestamps: true })

export default mongoose.model<IPageView>("PageView", pageViewSchema)
