import mongoose, { Schema } from "mongoose"
import { FunnelType, IFunnel } from "../types/IFunnel"

const FunnelSchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project"
        },
        domain: {
            type: Schema.Types.ObjectId,
            ref: "Domain"
        },
        webhooks: { type: [String], default: [] },
        title: String,
        numSteps: Number,
        settings: {
            tone: String,
            toneAdditionalInfo: String,
            aggressiveness: Number,
            hookCreative: Number,
            targetAudience: String
        },
        faviconUrl: String,
        prompt: {
            type: {
                input: {
                    businessName: String,
                    businessDescription: String,
                },
                magic: [String],
                benefitStack: [{ a: String, n: String }],
                faq: [{ a: String, q: String }],
                hero: [{ prompt: String, url: String }],
                bonus: [{ b: String, r: String }],
                businessDesc: [String],
            },
            default: undefined
        },
        type: {
            type: String,
            enum: Object.keys(FunnelType),
            default: FunnelType.ULTRA_FAST_FUNNEL
        },
        archivedAt: {
            type: Date,
            default: null
        },
        menu: [
            {
                type: Schema.Types.ObjectId,
                ref: "Page",
                required: false
            }
        ],
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IFunnel>("Funnel", FunnelSchema)
