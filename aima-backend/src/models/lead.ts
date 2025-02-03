import mongoose, { Schema } from "mongoose"
import { Document } from "mongoose"

export interface IInputLead {
  businessName: string,
  businessWebsite: string,
  businessDescription: string,
  monthlyMarketingBudget: string,
  location: string,
  workingWithAgency: string,
  currentChallenges: string,
  businessEmail: string,
  howSoonGrowth: string,
}

export interface ILeadStatus {
  isModerated: boolean,
  flags?: Schema.Types.Mixed,
  isDuplicate: boolean,
}

export interface ILead extends IInputLead, ILeadStatus, Document {
}

const LeadSchema: Schema = new Schema(
    {
        businessName: {
            type: String,
            required: true
        },
        businessWebsite: {
            type: String,
            required: true
        },
        businessDescription: {
            type: String,
            required: true
        },
        monthlyMarketingBudget: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        workingWithAgency: {
            type: String,
            required: true
        },
        currentChallenges: {
            type: String,
            required: true
        },
        businessEmail: {
            type: String,
            required: true
        },
        howSoonGrowth: {
            type: String,
            required: true
        },
        isModerated: {
            type: Boolean,
            required: true,
            default: false
        },
        flags: {
            type: Schema.Types.Mixed,
            required: false
        },
        isDuplicate: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<ILead>("lead", LeadSchema, "leads")
