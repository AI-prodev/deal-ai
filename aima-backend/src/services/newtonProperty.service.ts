import mongoose from "mongoose"

import { PropertyInformationRequestInterface } from "../types/propertyInformationTypes"
import { PropertyInformationRequestModel } from "../models/propertyBiRequests"

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

export const getPropertyInformationRequestById = async (
    _id: mongoose.Types.ObjectId
) => {
    try {
        return await PropertyInformationRequestModel.findOne({ _id })
    } catch (error) {
        throw new Error(error)
    }
}

export const patchPropertyInformationRequestById = async (
    _id: mongoose.Types.ObjectId,
    update: object
) => {
    try {
        return await PropertyInformationRequestModel.findOneAndUpdate(
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

export const getPropertyInformationRequestsList = async (
    filter: object = {},
    options?: object
) => {
    try {
        return await PropertyInformationRequestModel.find(filter, options)
    } catch (error) {
        throw new Error(error)
    }
}

export const getAllPropertyInformationRequests = async (options?: object) => {
    try {
        return await PropertyInformationRequestModel.find({}, options)
    } catch (error) {
        throw new Error(error)
    }
}
