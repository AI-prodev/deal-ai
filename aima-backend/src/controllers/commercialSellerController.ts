import { Request, Response } from "express"
import { validationResult } from "express-validator"

import {
    createCommercialSellerService,
    getAllCommercialSellersService,
    getCommercialSellerByIdService,
    updateCommercialSellerService,
    deleteCommercialSellerService,
    getAllAdminCommercialSellersService,
    deleteAdminCommercialSellerService,
    toggleEnableCommercialSellerService
} from "../services/commercialSellerService"

import { ICommercialSeller } from "../models/commercialSeller"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { validateCommercialSeller } from "../config/validation"

export const createCommercialSeller = [
    ...validateCommercialSeller,
    async (req: IExtendedRequest, res: Response) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        if (!req.user.id) {
            return res.status(400).json({ errors: "Something Went Wrong" })
        }

        try {
            const createdSeller = await createCommercialSellerService(
                req.body as ICommercialSeller,
                req.user.id
            )
            return res.status(201).json({ createdSeller })
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    }
]

export const getAllCommercialSellers = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const userId = req?.user.id

        const paginatedResults = (req as any).paginatedResults

        return res.status(200).json(paginatedResults)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message })
    }
}

export const getCommercialSellerById = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const sellers = await getCommercialSellerByIdService(req.params.id)
        return res.status(200).json({ sellers })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export const updateCommercialSeller = [
    ...validateCommercialSeller,
    async (req: IExtendedRequest, res: Response) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const userId = req?.user.id
        try {
            const updatedSeller = await updateCommercialSellerService(
                req.params.id,
                userId,
                req.body as ICommercialSeller
            )
            return res.status(200).json({ updatedSeller })
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    }
]

export const deleteCommercialSeller = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const userId = req?.user.id
        await deleteCommercialSellerService(req.params.id, userId)
        return res.status(200).json({ message: "Seller deleted" })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export const getAllAdminCommercialSellers = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        // const sellers = await getAllAdminCommercialSellersService()
        const paginatedResults = (req as any).paginatedResults
        return res.status(200).json(paginatedResults)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export const deleteAdminCommercialSeller = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        await deleteAdminCommercialSellerService(req.params.id)
        return res.status(200).json({ message: "Seller deleted" })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export const toggleEnableCommercialSeller = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        await toggleEnableCommercialSellerService(req.params.id)
        return res
            .status(200)
            .json({ message: "Seller enabled status toggled" })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}
