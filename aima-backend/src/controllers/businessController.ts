import express, { Request, Response } from "express"
import { IExtendedRequest } from "../types/IExtendedRequest"
import BusinessModel from "../models/business"
import mongoose from "mongoose"



export const updateBusinessStatus = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {

        const updatedBusiness = await BusinessModel.findByIdAndUpdate(
            req.params.businessId,
            {
                isActive:req.body?.isActive
            },
            { new: true }

        )

        if (!updatedBusiness) {
            return res.status(404).json({ error: "Business not found" })
        }
        res.status(200).json(updatedBusiness)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}