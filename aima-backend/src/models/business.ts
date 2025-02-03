import mongoose from "mongoose"

export interface IBusiness {
    accountId: mongoose.Schema.Types.ObjectId
    name: string
    isActive: boolean
    businessId: string
}
const BusinessSchema = new mongoose.Schema(
    {
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AccountModel",
            required: true
        },
        businessId: { type: String, required: true },
        name: { type: String, required: true },
        isActive: { type: Boolean, required: true, default: true }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IBusiness & mongoose.Document>(
    "BusinessModel",
    BusinessSchema
)
