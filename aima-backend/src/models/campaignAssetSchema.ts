import mongoose, { Schema } from "mongoose"

const CampaignAssetSchema = new Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        campaign: {
            type: Schema.Types.ObjectId,
            ref: "Campaign",
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        currentRound: { type: Number, require: false, default: 0 },

        type: { type: String, require: false },

        scrollStopper: {
            url: { type: String, required: true },
            additionalData: { type: Schema.Types.Mixed, required: false }
        },
        magicHook: {
            input: { type: Schema.Types.Mixed, required: false },
            output: { type: Schema.Types.Mixed, required: false },
            additionalData: { type: Schema.Types.Mixed, required: false }
        },

        isDeleted: { type: Boolean, required: false, default: false }
    },
    {
        timestamps: true
    }
)

export default mongoose.model("CampaignAsset", CampaignAssetSchema)
