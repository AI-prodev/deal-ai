import mongoose, { Schema } from "mongoose"
import { IProposal } from "../types/IProposal"

const schema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        businessName: String,
        businessWebsite: String,
        pdfFile: {
            type: Schema.Types.ObjectId,
            ref: "File"
        },
        docFile: {
            type: Schema.Types.ObjectId,
            ref: "File"
        },
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IProposal>("Proposal", schema)
