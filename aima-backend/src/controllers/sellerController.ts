import { Response } from "express"
import { validationResult } from "express-validator"
import { IBusinessSeller } from "../models/seller"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { BusinessSellerModel } from "../models/seller"
import { sellerGetEmbeddings } from "../utils/getEmbeddings"
import { validateBusinessSeller } from "../config/validation"
import { toggleEnableBusinessSeller } from "../services/business.service"

export const createBusinessSeller = [
    ...validateBusinessSeller,
    async (req: IExtendedRequest, res: Response) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        try {
            const {
                businessName,
                businessDescription,
                sector,
                listingPrice,
                country,
                state,
                zip,
                businessAge,
                entityName,
                entityType,
                ownershipStructure,
                liabilities,
                sellerFinancing,
                assetsIncluded,
                sellerContinuity
            }: Partial<IBusinessSeller> = req.body
            const vectors = await sellerGetEmbeddings(req.body)
            const userId = req.user.id
            let purchaseType

            if (!userId) {
                return res.status(400).json({ errors: "Something Went Wrong" })
            }

            if (
                assetsIncluded &&
                assetsIncluded !== "" &&
                (entityName || entityType) &&
                (entityName !== "" || entityType !== "")
            ) {
                purchaseType = "Both"
            } else if (assetsIncluded && assetsIncluded !== "") {
                purchaseType = "Asset"
            } else if (
                entityName ||
                (entityType && (entityName !== "" || entityType !== ""))
            ) {
                purchaseType = "Entity"
            } else if (!assetsIncluded && !entityType && !entityName) {
                purchaseType = ""
            }
            const businessSeller = new BusinessSellerModel({
                userId,
                businessName,
                businessDescription,
                sector,
                listingPrice,
                country,
                state,
                zip,
                businessAge,
                entityName,
                entityType,
                ownershipStructure,
                liabilities,
                purchaseType,
                assetsIncluded,
                sellerContinuity,
                sellerFinancing,
                vectors
            })

            await businessSeller.save()
            const createdSeller = await BusinessSellerModel.findById(
                businessSeller._id
            ).select("-vectors")
            return res.status(201).json({ createdSeller })
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    }
]

export const getAllBusinessSellers = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const userId = req?.user.id

        const paginatedResults = (req as any).paginatedResults

        return res.status(200).json(paginatedResults)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export const getBusinessSellerById = async (
    req: IExtendedRequest,
    res: Response
) => {
    const { id } = req.params
    const userId = req?.user.id
    try {
        const businessSellers = await BusinessSellerModel.findOne({
            _id: id
            // userId: userId
        })
            .populate("userId", "firstName lastName email roles")
            .select("-vectors")
        if (!businessSellers) {
            return res.status(404).json({ error: "Business Seller not found" })
        }

        return res.status(200).json({ businessSellers })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export const updateBusinessSeller = [
    ...validateBusinessSeller,
    async (req: IExtendedRequest, res: Response) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const userId = req?.user.id
        const { id } = req.params
        try {
            const {
                businessName,
                businessDescription,
                sector,
                listingPrice,
                country,
                state,
                zip,
                businessAge,
                entityName,
                entityType,
                ownershipStructure,
                liabilities,
                assetsIncluded,
                sellerContinuity,
                sellerFinancing
            }: Partial<IBusinessSeller> = req.body
            const vectors = await sellerGetEmbeddings(req.body)

            let purchaseType

            if (
                assetsIncluded &&
                assetsIncluded !== "" &&
                (entityName || entityType) &&
                (entityName !== "" || entityType !== "")
            ) {
                purchaseType = "Both"
            } else if (assetsIncluded && assetsIncluded !== "") {
                purchaseType = "Asset"
            } else if (
                entityName ||
                (entityType && (entityName !== "" || entityType !== ""))
            ) {
                purchaseType = "Entity"
            } else if (!assetsIncluded && !entityType && !entityName) {
                purchaseType = ""
            }
            const updatedBusinessSeller =
                await BusinessSellerModel.findOneAndUpdate(
                    { _id: id, userId: userId },
                    {
                        businessName,
                        businessDescription,
                        sector,
                        listingPrice,
                        country,
                        state,
                        zip,
                        businessAge,
                        entityName,
                        entityType,
                        ownershipStructure,
                        liabilities,
                        purchaseType,
                        assetsIncluded,
                        sellerContinuity,
                        sellerFinancing,
                        vectors
                    },
                    { new: true }
                ).select("-vectors")
            if (!updatedBusinessSeller) {
                return res
                    .status(404)
                    .json({ error: "Business Seller not found" })
            }
            return res.status(200).json({ updatedBusinessSeller })
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    }
]

export const deleteBusinessSeller = async (
    req: IExtendedRequest,
    res: Response
) => {
    const { id } = req.params
    const userId = req?.user.id
    try {
        const deletedBusinessSeller =
            await BusinessSellerModel.findOneAndDelete({
                _id: id,
                userId
            }).select("-vectors")
        if (!deletedBusinessSeller) {
            return res.status(404).json({ error: "Business Seller not found" })
        }
        return res.status(200).json({ deletedBusinessSeller })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export const getAllAdminBusinessSellers = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const userId = req?.user.id

        const paginatedResults = (req as any).paginatedResults
        // const businessSellers = await BusinessSellerModel.find({})
        //     .populate("userId", "firstName lastName email roles")
        //     .select("-vectors")
        return res.status(200).json(paginatedResults)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}
export const deleteAdminBusinessSeller = async (
    req: IExtendedRequest,
    res: Response
) => {
    const { id } = req.params
    const userId = req?.user.id
    try {
        const deletedBusinessSeller =
            await BusinessSellerModel.findOneAndDelete({
                _id: id
            }).select("-vectors")
        if (!deletedBusinessSeller) {
            return res.status(404).json({ error: "Business Seller not found" })
        }
        return res.status(200).json({ deletedBusinessSeller })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export const toggleBusinessSellerStatus = async (
    req: IExtendedRequest,
    res: Response
) => {
    const { id } = req.params
    try {
        await toggleEnableBusinessSeller(id)
        return res
            .status(200)
            .json({ message: "Business Seller status toggled successfully" })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}
