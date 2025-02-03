import mongoose, { Document, Schema } from "mongoose"
import { IUser } from "../types/IUser"
import { BusinessInformationRequestInterface } from "../types/businessInformationTypes"

export interface IBusinessSeller extends Partial<Document> {
    userId?: IUser["_id"]
    businessName?: string
    businessDescription?: string
    sector?: string
    listingPrice?: number
    country?: string
    state?: string
    zip?: string
    businessAge?: number
    entityName?: string
    entityType?: string
    ownershipStructure?: string
    liabilities?: string
    platformBusiness?: boolean
    purchaseType: "Entity" | "Asset" | "Both" | ""
    assetsIncluded?: string
    sellerContinuity?: boolean
    sellerFinancing?: boolean
    vectors?: number[]
    biRequests?: BusinessInformationRequestInterface[]
    imported?: boolean
    enabled?: boolean
}

export const BusinessSellerSchema = new Schema<IBusinessSeller>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        businessName: { type: String },
        businessDescription: { type: String },
        sector: { type: String },
        listingPrice: { type: Number },
        country: { type: String },
        state: { type: String },
        zip: { type: String },
        businessAge: { type: Number },
        entityName: { type: String },
        entityType: { type: String },
        ownershipStructure: { type: String },
        liabilities: { type: String },
        purchaseType: {
            type: String
        },
        assetsIncluded: { type: String },
        sellerContinuity: { type: Boolean, default: false },
        sellerFinancing: { type: Boolean, default: false },
        platformBusiness: { type: Boolean, default: false, index: true },
        vectors: { type: [Number] },
        biRequests: { type: [Object] },
        imported: { type: Boolean, default: false },
        enabled: { type: Boolean, default: true }
    },
    {
        timestamps: true
    }
)

export const BusinessSellerModel: mongoose.Model<IBusinessSeller> =
    mongoose.model("BusinessSeller", BusinessSellerSchema)
