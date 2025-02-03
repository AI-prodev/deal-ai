import mongoose, { ObjectId } from "mongoose"
import {
    CommercialSellerModel,
    ICommercialSeller
} from "../models//commercialSeller"
import { propertyGetEmbeddings } from "../utils/getEmbeddings"

export const createNewProperty = async (
    property: Partial<ICommercialSeller>
) => {
    const {
        propertyName,
        propertyDescription,
        propertyType,
        listingPrice,
        country,
        state,
        zip,
        location,
        acres,
        userId,
        imported,
        enabled
    } = property

    const vectors = await propertyGetEmbeddings({
        propertyName,
        propertyDescription,
        propertyType,
        listingPrice,
        country,
        state,
        zip,
        location,
        acres
    })

    const propertySeller = new CommercialSellerModel({
        propertyName,
        propertyDescription,
        propertyType,
        listingPrice,
        country,
        state,
        zip,
        location,
        acres,
        userId,
        imported,
        enabled,
        vectors
    })

    try {
        return (await propertySeller.save()).toObject()
    } catch (error) {
        throw new Error(error)
    }
}

export const updateProperty = async ({
    property,
    userId,
    _id
}: {
    property: Partial<ICommercialSeller>
    userId: ObjectId
    _id: ObjectId
}) => {
    try {
        return await CommercialSellerModel.findOneAndUpdate(
            { _id, userId },
            property
        )
    } catch (error) {
        throw new Error(error)
    }
}

export const getProperty = async (
    query: object,
    options?: object
): Promise<ICommercialSeller> => {
    try {
        return await CommercialSellerModel.findOne(query, options).lean()
    } catch (error) {
        throw new Error(error)
    }
}

export const getPropertyListByUserId = async (
    userId?: mongoose.Types.ObjectId,
    _id?: mongoose.Types.ObjectId,
    options?: object
): Promise<ICommercialSeller[]> => {
    try {
        if (userId && !_id) {
            return await CommercialSellerModel.find({ userId }, options).lean()
        } else if (_id && !userId) {
            return await CommercialSellerModel.find({ _id }).lean()
        } else return await CommercialSellerModel.find({ _id, userId }).lean()
    } catch (error) {
        throw new Error(error)
    }
}

export const getPropertyByPropertyName = async (propertyName: string) => {
    try {
        return await CommercialSellerModel.findOne({ propertyName }).lean()
    } catch (error) {
        throw new Error(error)
    }
}

export const getPropertyByMultipleQueryMetadata = async (property: object) => {
    try {
        return await CommercialSellerModel.findOne({ ...property }).lean()
    } catch (error) {
        throw new Error(error)
    }
}

export async function toggleEnablePropertySeller(
    sellerId: string
): Promise<void> {
    try {
        const seller = await CommercialSellerModel.findById(sellerId)

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
