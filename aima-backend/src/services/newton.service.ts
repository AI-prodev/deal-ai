import mongoose from "mongoose"
import { BusinessInformationRequestModel } from "../models/biRequests"
import { BusinessInformationRequestInterface } from "../types/businessInformationTypes"
import { PropertyInformationRequestModel } from "../models/propertyBiRequests"
import { PropertyInformationRequestInterface } from "../types/propertyInformationTypes"

export const createNewBusinessInformationRequest = async (
    biRequest: Partial<BusinessInformationRequestInterface>
): Promise<BusinessInformationRequestInterface> => {
    const request = new BusinessInformationRequestModel(biRequest)

    try {
        return await request.save()
    } catch (error) {
        throw new Error(error)
    }
}

export const createNewPropertyInformationRequest = async (
    biRequest: Partial<PropertyInformationRequestInterface>
): Promise<PropertyInformationRequestInterface> => {
    const request = new PropertyInformationRequestModel(biRequest)

    try {
        return await request.save()
    } catch (error) {
        throw new Error(error)
    }
}

export const getInformationRequestById = async (
    _id: mongoose.Types.ObjectId
) => {
    try {
        return await BusinessInformationRequestModel.findOne({ _id })
    } catch (error) {
        throw new Error(error)
    }
}

export const patchInformationRequestById = async (
    _id: mongoose.Types.ObjectId,
    update: object
) => {
    try {
        return await BusinessInformationRequestModel.findOneAndUpdate(
            { _id },
            update,
            {
                upsert: true,
                new: true
            }
        )
    } catch (error) {
        throw new Error(error)
    }
}

export const getBusinessInformationRequestsList = async (
    filter: object = {},
    options?: object
) => {
    try {
        return await BusinessInformationRequestModel.find(filter, options)
    } catch (error) {
        throw new Error(error)
    }
}

export const getAllBusinessInformationRequests = async (options?: object) => {
    try {
        return await BusinessInformationRequestModel.find({}, options)
    } catch (error) {
        throw new Error(error)
    }
}
