import mongoose from "mongoose"

export interface IRound {
    fbCampaignId: string
    campaignId: mongoose.Schema.Types.ObjectId
    testAssetAdSetId: mongoose.Schema.Types.ObjectId
    controlAssetAdSetId: mongoose.Schema.Types.ObjectId
    winnerId: mongoose.Schema.Types.ObjectId
    budget: number
    sequence: number
    billingEvent: string
    optimizationGoal: string
    testAdSetId: string
    controlAdSetId: string
    testAdSets: {
        insights: any
        ads?: any[] // Change 'any[]' to the actual type of 'ads' if possible
        // other properties if any
        imageUrl: string
    }

    controlAdSets: {
        ads?: any[] // Change 'any[]' to the actual type of 'ads' if possible
        // other properties if any
        imageUrl: string

        insights: object
    }

    isActive: boolean
}
const RoundSchema = new mongoose.Schema(
    {
        fbCampaignId: {
            type: String,
            required: true
        },

        campaignId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CampaignModel",
            required: true
        },

        testAssetAdSetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CampaignAsset",
            required: false
        },

        controlAssetAdSetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CampaignAsset",
            required: false
        },

        winnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CampaignAsset",
            required: false
        },

        budget: { type: Number, required: false },

        sequence: { type: Number, required: true, default: 0 },

        billingEvent: { type: String, required: false },

        optimizationGoal: { type: String, required: false },

        testAdSetId: { type: String, required: false },

        controlAdSetId: { type: String, required: false },

        testAdSets: { type: Object, required: false },

        controlAdSets: { type: Object, required: false },

        isActive: { type: Boolean, required: false, default: false }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IRound & mongoose.Document>(
    "RoundModel",
    RoundSchema
)
