import mongoose from "mongoose"

export interface ICampaign {
    title: string
    user: mongoose.Schema.Types.ObjectId
    businessId: mongoose.Schema.Types.ObjectId
    adAccountId: string
    objective: string
    fbCampaignId: string
    budget: number
    targetURL: string
    displayLink: string
    page: {
        facebook: string
        instagram: string
    }
    callToAction: string
    headline: string
    targeting: {
        minAge: number
        maxAge: number
        gender: string
        country: string
    }
    currentRound: number
    totalRounds: number
    billingEvent: string
    optimizationGoal: string
    pageId: string
    enableAutoPilot: boolean
}
const CampaignSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        businessId: {
            type: String,
            ref: "BusinessModel",
            required: true
        },
        adAccountId: {
            type: String,
            required: true
        },
        objective: {
            type: String,
            required: true
        },
        fbCampaignId: {
            type: String,
            required: true
        },

        enableAutoPilot: { type: Boolean, required: false, default: false },

        budget: { type: Number, required: false },

        targetURL: { type: String, required: false },

        displayLink: { type: String, required: false },

        page: {
            facebook: { type: String, required: false },
            instagram: { type: String, required: false }
        },

        targeting: {
            minAge: { type: Number, default: 18 },
            maxAge: { type: Number, default: 65 },
            gender: { type: String, default: "both" },
            country: { type: String, default: "US" }
        },

        currentRound: { type: Number, required: true, default: 0 },

        totalRounds: { type: Number, required: false },

        billingEvent: { type: String, required: false },

        optimizationGoal: { type: String, required: false },

        pageId: { type: String, required: false }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<ICampaign & mongoose.Document>(
    "CampaignModel",
    CampaignSchema
)
