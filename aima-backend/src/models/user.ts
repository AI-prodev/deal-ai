import mongoose, { Schema } from "mongoose"
import { IUser } from "../types/IUser"

export const UserSchema = new mongoose.Schema<IUser>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        lastLoginDate: { type: Date },
        lastLoginIpAddress: { type: String },
        roles: { type: [String], default: [] },
        store: [
            {
                storeId: { type: String },
                domain: { type: String }
            }
        ],
        status: { type: String, default: "active" },
        passwordResetToken: { type: String },
        passwordResetExpires: { type: Number },
        expiryDate: { type: Date },
        apiKey: { type: String },
        csrfToken: { type: String },
        apps: [
            {
                type: Schema.Types.ObjectId,
                ref: "App"
            }
        ],
        emailFreeQuota: { type: Number, default: 0 },
        emailPaidQuota: { type: Number, default: 0 },
        emailSubscriptionId: { type: String, required: false },
        phoneFreeQuota: { type: Number, default: 0 },
        phonePaidQuota: { type: Number, default: 0 },
        phoneSubscriptionInvalidAt: { type: Date },
        phoneSubscriptionWarnedAt: { type: Date },
        phoneSubscriptionId: { type: String, required: false },
        fileCount: { type: Number, default: 0 }, // number of files
        fileSize: { type: Number, default: 0 }, // total size of files
        fileDownloadSize: { type: Number, default: 0 }, // total amount downloaded
        businessName: { type: String, required: false },
        businessAddress: {
            type: Schema.Types.Mixed,
            default: {}
        },
        assistKey: { type: String, unique: true }
    },
    {
        timestamps: true
    }
)

export const UserModel: mongoose.Model<IUser> = mongoose.model(
    "User",
    UserSchema
)

export default UserModel

// koyeyal817@agromgt.com
// K9NS8IAdGR
