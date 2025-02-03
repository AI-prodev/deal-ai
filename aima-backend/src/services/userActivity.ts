import mongoose from "mongoose"

const userActivitySchema = new mongoose.Schema(
    {
        userId: mongoose.Schema.Types.ObjectId,
        feature: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
)

export const UserActivityModel = mongoose.model(
    "UserActivity",
    userActivitySchema,
    "useractivity"
)
