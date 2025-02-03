import mongoose, { Schema } from "mongoose"
import { IDomain } from "../types/IDomain"

const DomainSchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        domain: String,
        external: {
            type: Boolean,
            default: true
        },
        autoRenew: {
            type: Boolean,
            default: true
        },
        subscriptionId: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IDomain>("Domain", DomainSchema)
