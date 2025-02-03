import mongoose, { ObjectId } from "mongoose"
import { BusinessSellerModel, IBusinessSeller } from "../models/seller"
import { sellerGetEmbeddings } from "../utils/getEmbeddings"

export const createNewBusiness = async (business: Partial<IBusinessSeller>) => {
    const {
        businessName,
        businessDescription,
        entityName,
        entityType,
        assetsIncluded,
        liabilities,
        country,
        ownershipStructure,
        purchaseType,
        listingPrice,
        userId,
        businessAge,
        sector,
        state,
        zip,
        sellerContinuity,
        imported,
        enabled
    } = business

    const vectors = await sellerGetEmbeddings({
        businessName,
        businessDescription,
        country,
        state,
        zip,
        entityName,
        entityType,
        ownershipStructure,
        liabilities,
        purchaseType,
        assetsIncluded
    })

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
        vectors,
        imported,
        enabled
    })

    try {
        return (await businessSeller.save()).toObject()
    } catch (error) {
        throw new Error(error)
    }
}

export const updateBusiness = async ({
    business,
    userId,
    _id
}: {
    business: Partial<IBusinessSeller>
    userId: ObjectId
    _id: ObjectId
}) => {
    try {
        return await BusinessSellerModel.findOneAndUpdate(
            { _id, userId },
            business
        )
    } catch (error) {
        throw new Error(error)
    }
}

export const getBusiness = async (
    query: object,
    options?: object
): Promise<IBusinessSeller> => {
    try {
        return await BusinessSellerModel.findOne(query, options).lean()
    } catch (error) {
        throw new Error(error)
    }
}

export const getBusinessListByUserId = async (
    userId?: mongoose.Types.ObjectId,
    _id?: mongoose.Types.ObjectId,
    options?: object
): Promise<IBusinessSeller[]> => {
    try {
        if (userId && !_id) {
            return await BusinessSellerModel.find({ userId }, options).lean()
        } else if (_id && !userId) {
            return await BusinessSellerModel.find({ _id }).lean()
        } else return await BusinessSellerModel.find({ _id, userId }).lean()
    } catch (error) {
        throw new Error(error)
    }
}

export const getBusinessByBusinessName = async (businessName: string) => {
    try {
        return await BusinessSellerModel.findOne({ businessName }).lean()
    } catch (error) {
        throw new Error(error)
    }
}

export const getBusinessByMultipleQueryMetadata = async (business: object) => {
    try {
        return await BusinessSellerModel.findOne({ ...business }).lean()
    } catch (error) {
        throw new Error(error)
    }
}

export async function toggleEnableBusinessSeller(
    sellerId: string
): Promise<void> {
    try {
        const seller = await BusinessSellerModel.findById(sellerId)

        if (!seller) {
            throw new Error("Seller not found")
        }

        seller.enabled = !seller.enabled

        await seller.save()
    } catch (error) {
        console.error(
            `An error occurred while toggling the enabled property for seller ${sellerId}: ${error.message}`
        )
        throw error
    }
}
