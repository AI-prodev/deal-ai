import mongoose, { Schema } from "mongoose"

const CampaignAssetInputSchema = new Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        campaignId: {
            type: Schema.Types.ObjectId,
            ref: "Campaign",
            required: false
        },
        businessDescription: { type: String, required: false, default: "" }, // Changed default value to an empty string

        targetAudience: { type: String, required: false },
        colours: { type: String, required: false },
        imageType: { type: String, required: false },
        imageStyle: { type: String, required: false },
        aspectRatio: { type: String, required: false },
        instructions: { type: String, required: false },
        aggressiveness: { type: Number, required: false },
        hookCreative: { type: Number, required: false },
        language: { type: String, required: false },
        adDescriptionText: { type: String, required: false },
        adDescription: { type: String, required: false },
        impacts: [],
        tone: { type: String, required: false }, // Added 'type' property here
        scrollStopper: {
            url: { type: String, required: false },
            additionalData: { type: Schema.Types.Mixed, required: false }
        },
        isDeleted: { type: Boolean, required: false, default: false },
        isolation: { type: String, required: false } // Added 'type' property here
    },
    {
        timestamps: true
    }
)

export default mongoose.model("CampaignAssetInput", CampaignAssetInputSchema)
