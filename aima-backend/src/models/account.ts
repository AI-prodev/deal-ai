import mongoose from "mongoose"

export interface IAccount {
    user: mongoose.Schema.Types.ObjectId
    name: string
    accessToken: string
    facebookId: string
    expiresIn: string
}
const AccountSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: { type: String, required: true },
        expiresIn: { type: String, required: true },
        accessToken: { type: String, required: true },
        facebookId: { type: String, required: true },
        isDeleted: { type: Boolean, required: false, default: false }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IAccount & mongoose.Document>(
    "AccountModel",
    AccountSchema
)
