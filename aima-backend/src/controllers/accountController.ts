import express, { Request, Response } from "express"
import { IExtendedRequest } from "../types/IExtendedRequest"
import AccountModel from "../models/account"
import UserModel from "../models/user"
import mongoose from "mongoose"
import BusinessModel from "../models/business"
import { getBusinessesFromMeta } from "../utils/integrations/facebook"
import { generateCSRFToken } from "../utils/csrfGenerator"

export const getLinkedAccounts = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const accounts = await AccountModel.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(req.user.id),
                    isDeleted: { $ne: true }
                }
            },
            {
                $lookup: {
                    from: "businessmodels",
                    localField: "_id",
                    foreignField: "accountId",
                    as: "businesses"
                }
            }
        ]).exec()

        res.status(200).json(accounts)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const createAccount = async (req: IExtendedRequest, res: Response) => {
    try {
        const existingAccount = await AccountModel.findOne({
            facebookId: req.body.facebookId,
            user: new mongoose.Types.ObjectId(req.user.id)
        })

        const existingUser = await UserModel.findOne({
            csrfToken: req.body.csrfToken
        })

        if (existingUser) {
            const existingAccount = await AccountModel.findOne({
                facebookId: req.body.facebookId,
                user: new mongoose.Types.ObjectId(req.user.id)
            })

            if (!existingAccount) {
                const businessObjectId = new mongoose.Types.ObjectId()

                const newAccount = new AccountModel({
                    _id: businessObjectId.toString(),
                    user: new mongoose.Types.ObjectId(req.user.id),
                    accessToken: req.body.accessToken,
                    name: req.body.name,
                    facebookId: req.body.facebookId,
                    expiresIn: req.body.expiresIn
                })

                const businesses = await getBusinessesFromMeta(
                    req.body.accessToken
                )

                if (businesses.success) {
                    const transformedData = businesses._data?.map(
                        (data: any) => {
                            return {
                                businessId: data?.id,
                                name: data?.name,
                                accountId: businessObjectId.toString()
                            }
                        }
                    )

                    const result = await BusinessModel.insertMany(
                        transformedData
                    )

                    if (result.length > 0) {
                        await newAccount.save()
                        res.status(201).json(newAccount)
                    } else {
                        res.status(401).json({
                            error: "No business found for this account"
                        })
                    }
                }
            } else if (existingAccount) {
                await AccountModel.updateOne(
                    { _id: existingAccount?._id },
                    {
                        $set: {
                            isDeleted: false,
                            accessToken: req.body.accessToken,
                            expiresIn: req.body.expiresIn
                        }
                    }
                )
                await BusinessModel.updateMany(
                    { accountId: existingAccount?._id },
                    { $set: { isActive: true } }
                )
                res.status(201).json(existingAccount)
            } else {
                res.status(400).json({
                    error: "This url has already been used"
                })
            }
        } else if (existingAccount) {
            await AccountModel.updateOne(
                { _id: existingAccount?._id },
                {
                    $set: {
                        isDeleted: false,
                        accessToken: req.body.accessToken,
                        expiresIn: req.body.expiresIn
                    }
                }
            )
            await BusinessModel.updateMany(
                { accountId: existingAccount?._id },
                { $set: { isActive: true } }
            )
            res.status(201).json(existingAccount)
        } else {
            res.status(400).json({
                error: "The CSRF token isn't valid one"
            })
        }
    } catch (error) {
        console.log("===========error=========>", error)
        res.status(500).json({ error: "Server error" })
    }
}

export const deleteAccount = async (req: IExtendedRequest, res: Response) => {
    try {
        const updateAccount = await AccountModel.findByIdAndUpdate(
            req.params.accountId,
            {
                isDeleted: true
            },
            { new: true }
        )

        await BusinessModel.updateMany(
            { accountId: req.params.accountId },
            {
                isActive: false
            },
            {
                new: true
            }
        )

        if (!updateAccount) {
            return res.status(404).json({ error: "Account not found" })
        }

        res.status(200).json({ success: "Account is deleted" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const createCSRF = async (req: IExtendedRequest, res: Response) => {
    try {
        const csrfToken: string = generateCSRFToken()

        const user = await UserModel.findOneAndUpdate(
            {
                _id: new mongoose.Types.ObjectId(req.user.id)
            },
            {
                csrfToken: csrfToken
            },
            { new: true }
        )

        if (user) {
            res.status(200).json(user)
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}
