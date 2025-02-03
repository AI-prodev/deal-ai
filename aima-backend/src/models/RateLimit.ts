import mongoose from "mongoose"

export const RateLimitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    exceededCount: { type: Number, default: 0 },
    currentUsage: { type: Number, default: 0 },
    remaining: { type: Number, default: process.env.FREE_REQUESTS_POINTS },
    lastExceeded: { type: Date },
    lastUsageDate: { type: Date },
    totalTokensUsed: { type: Number, default: 0 },
    lastTimeTotalTokensUsage: { type: Date }
})

export const RateLimitModel = mongoose.model("RateLimitData", RateLimitSchema)
