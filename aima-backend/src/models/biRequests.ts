import mongoose, { Schema } from "mongoose"
import { BusinessInformationRequestInterface } from "../types/businessInformationTypes"

const BusinessInformationRequestSchema: Schema = new Schema(
    {
        business: {
            type: new Schema(
                {
                    id: { type: Schema.Types.ObjectId },
                    userId: { type: Schema.Types.ObjectId },
                    businessName: { type: String },
                    businessDescription: { type: String },
                    listingPrice: { type: Number }
                },
                { strict: false, _id: false }
            )
        },
        buyer: {
            type: new Schema(
                {
                    firstName: { type: String },
                    lastName: { type: String },
                    email: { type: String },
                    status: { type: String, default: "active" }
                },
                { strict: false, _id: false }
            )
        },
        seller: {
            type: new Schema(
                {
                    firstName: { type: String },
                    lastName: { type: String },
                    email: { type: String },
                    status: { type: String, default: "active" }
                },
                { strict: false }
            )
        },
        checklist: { type: String },
        responses: {
            type: [
                new Schema(
                    {
                        isTitle: { type: Boolean },
                        text: { type: String },
                        response: { type: String },
                        replies: {
                            type: [
                                new Schema(
                                    {
                                        actor: { type: String },
                                        text: { type: String }
                                    },
                                    {
                                        _id: false,
                                        strict: true,
                                        timestamps: true
                                    }
                                )
                            ],
                            default: []
                        },
                        section: { type: Number },
                        isSentToSeller: { type: Boolean },
                        files: {
                            type: [
                                new Schema(
                                    {
                                        fileName: { type: String },
                                        fileUrl: { type: String }
                                    },
                                    { string: false, _id: false }
                                )
                            ],
                            default: []
                        }
                    },
                    { strict: false, _id: false }
                )
            ],
            default: []
        },
        status: { type: String, default: "pending" }
    },
    {
        timestamps: true
    }
)

export const BusinessInformationRequestModel: mongoose.Model<BusinessInformationRequestInterface> =
    mongoose.model<BusinessInformationRequestInterface>(
        "BusinessInformationRequest",
        BusinessInformationRequestSchema
    )
