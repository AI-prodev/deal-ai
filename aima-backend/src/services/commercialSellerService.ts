import { propertyGetEmbeddings } from "../utils/getEmbeddings"
import {
    ICommercialSeller,
    CommercialSellerModel
} from "../models/commercialSeller"

export const createCommercialSellerService = async (
    body: ICommercialSeller,
    userId: string
) => {
    const vectors = await propertyGetEmbeddings(body)

    const commercialSeller = new CommercialSellerModel({
        ...body,
        userId,
        vectors
    })

    try {
        await commercialSeller.save()
        const createdSeller = await CommercialSellerModel.findById(
            commercialSeller._id
        ).select("-vectors")

        return createdSeller
    } catch (error) {
        throw new Error(`Failed to create Commercial Seller: ${error.message}`)
    }
}

export const updateCommercialSellerService = async (
    sellerId: string,
    userId: string,
    body: ICommercialSeller
) => {
    const vectors = await propertyGetEmbeddings(body)

    try {
        const updatedCommercialSeller =
            await CommercialSellerModel.findOneAndUpdate(
                { _id: sellerId, userId },
                { ...body, vectors },
                { new: true }
            ).select("-vectors")

        if (!updatedCommercialSeller)
            throw new Error("Commercial Seller not found")
        return updatedCommercialSeller
    } catch (error) {
        throw new Error(`Failed to update Commercial Seller: ${error.message}`)
    }
}

export const getAllCommercialSellersService = async (userId: string) => {
    const commercialSellers = await CommercialSellerModel.find({
        userId: userId
    }).select("-vectors")
    return commercialSellers
}

export const getCommercialSellerByIdService = async (sellerId: string) => {
    const commercialSeller = await CommercialSellerModel.findOne({
        _id: sellerId
    })
        .populate("userId", "firstName lastName email roles")
        .select("-vectors")
    if (!commercialSeller) throw new Error("Commercial Seller not found")
    return commercialSeller
}

export const deleteCommercialSellerService = async (
    sellerId: string,
    userId: string
) => {
    const deletedCommercialSeller =
        await CommercialSellerModel.findOneAndDelete({
            _id: sellerId,
            userId: userId
        }).select("-vectors")
    if (!deletedCommercialSeller) throw new Error("Commercial Seller not found")
    return deletedCommercialSeller
}

export const getAllAdminCommercialSellersService = async () => {
    const commercialSellers = await CommercialSellerModel.find()
        .populate("userId", "firstName lastName email roles")
        .select("-vectors")
    return commercialSellers
}

export const deleteAdminCommercialSellerService = async (sellerId: string) => {
    const deletedCommercialSeller =
        await CommercialSellerModel.findByIdAndDelete(sellerId).select(
            "-vectors"
        )
    if (!deletedCommercialSeller) throw new Error("Commercial Seller not found")
    return deletedCommercialSeller
}

export const toggleEnableCommercialSellerService = async (sellerId: string) => {
    const commercialSeller = await CommercialSellerModel.findById(sellerId)
    if (!commercialSeller) throw new Error("Commercial Seller not found")
    commercialSeller.enabled = !commercialSeller.enabled
    await commercialSeller.save()
    return commercialSeller
}
