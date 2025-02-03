import mongoose, { Document, Schema } from "mongoose"
import { IUser } from "../types/IUser"
import { BusinessInformationRequestInterface } from "../types/businessInformationTypes"
import { PropertyInformationRequestSchema } from "./propertyBiRequests"

export interface ICommercialSeller extends Partial<Document> {
    userId?: IUser["_id"]
    propertyName?: string
    propertyDescription?: string
    propertyType?: string
    listingPrice?: number
    country?: string
    state?: string
    zip?: string
    location?: string
    acres?: number
    vectors?: number[]
    biRequests?: BusinessInformationRequestInterface[]
    enabled?: boolean
    imported?: boolean
}

export const CommercialSellerSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        propertyName: { type: String },
        propertyDescription: { type: String },
        propertyType: { type: String },
        listingPrice: { type: Number },
        country: { type: String },
        location: { type: String },
        acres: { type: Number },
        state: { type: String },
        zip: { type: String },
        vectors: { type: [Number] },
        biRequests: { type: [PropertyInformationRequestSchema], default: [] },
        enabled: { type: Boolean, default: false },
        imported: { type: Boolean, default: false }
    },
    {
        timestamps: true
    }
)

export const CommercialSellerModel: mongoose.Model<ICommercialSeller> =
    mongoose.model<ICommercialSeller>(
        "CommericialSeller",
        CommercialSellerSchema
    )
