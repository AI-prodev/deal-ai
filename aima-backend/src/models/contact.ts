import mongoose, { Schema } from "mongoose"
import { IContact } from "../types/IContact"

const ContactSchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project"
        },
        funnel: {
            type: Schema.Types.ObjectId,
            ref: "Funnel"
        },
        page: {
            type: Schema.Types.ObjectId,
            ref: "Page"
        },
        firstName: String,
        lastName: String,
        email: String,
        listIds: [
            {
                type: Schema.Types.ObjectId,
                ref: "List"
            }
        ],
        address: {
            type: Schema.Types.Mixed,
            default: {}
        },
        shippingAddress: {
            type: Schema.Types.Mixed,
            default: {}
        },
        ip: String,
        unsubscribed: {
            type: Boolean,
            default: false
        },
        phoneNumber: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IContact>("Contact", ContactSchema)
