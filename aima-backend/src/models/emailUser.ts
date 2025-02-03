import mongoose, { Schema } from "mongoose"
import { IEmailUser } from "../types/IEmailUser"

const schema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        domain: {
            type: Schema.Types.ObjectId,
            ref: "Domain"
        },
        email: String,
        password: String,
        firstName: String,
        lastName: String,
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IEmailUser>("EmailUser", schema)
