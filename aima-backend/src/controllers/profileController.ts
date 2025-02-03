import express, { Request, Response, NextFunction } from "express"
import multer from "multer"
import ProfileModel from "../models/profile"
import UserModel from "../models/user"
import AppModel from "../models/app"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { IProfile, IProfileResponse } from "../types/IProfile"
import { isJSON } from "../utils/isJSON"
import crypto from "crypto"

const isUserDefined = (
    req: IExtendedRequest
): req is IExtendedRequest & { user: { id: string } } => {
    return !!req.user
}

function bufferToDataURL(buffer: Buffer, contentType: string): string {
    const base64 = buffer.toString("base64")
    return `data:${contentType};base64,${base64}`
}
export const getProfile = async (req: IExtendedRequest, res: Response) => {
    if (!isUserDefined(req)) {
        return res.status(401).json({ error: "User not found" })
    }
    try {
        const profile = await ProfileModel.findOne({
            user: req.user.id
        }).populate("user", ["firstName", "lastName", "email", "roles"])

        if (!profile) {
            return res.status(404).json({ error: "Profile not found" })
        }

        const profileData: IProfileResponse = profile.toObject({
            versionKey: false
        })

        // Convert the profileImage Buffer to a Base64 encoded data URL
        if (profile.profileImage) {
            profileData.profileImage = bufferToDataURL(
                profile.profileImage,
                "image/png"
            )
        }

        if (typeof profileData.fields === "string") {
            profileData.fields = JSON.parse(profileData.fields)
        } else if (!profileData.fields) {
            profileData.fields = {}
        }

        if (
            !profileData.fields.firstName &&
            (profileData.user as any).firstName
        ) {
            profileData.fields.firstName = (profileData.user as any).firstName
        }
        if (
            !profileData.fields.lastName &&
            (profileData.user as any).lastName
        ) {
            profileData.fields.lastName = (profileData.user as any).lastName
        }

        res.status(200).json(profileData)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const createOrUpdateProfile = [
    async (req: Request, res: Response) => {
        if (!isUserDefined(req)) {
            return res.status(401).json({ error: "User not found" })
        }

        let fields = isJSON(req.body.fields)
            ? JSON.parse(req.body.fields)
            : req.body.fields

        if (!fields) {
            console.error("Invalid JSON string:", req.body.fields)
            fields = req.body.fields
        }

        const profileFields: Partial<IProfile> = {
            user: req.user.id as any,
            fields: fields ? fields : {}
        }

        for (const key in fields) {
            if (
                Object.prototype.hasOwnProperty.call(fields, key) &&
                fields[key] !== undefined
            ) {
                profileFields.fields[key] = fields[key]
            }
        }

        if (req.file) {
            profileFields.profileImage = req.file.buffer
        }

        try {
            let profile = await ProfileModel.findOne({ user: req.user.id })

            if (profile) {
                profile = await ProfileModel.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                )

                // Update user's first and last name if changed in profile
                const user = await UserModel.findById(req.user.id)

                if (user) {
                    if (
                        profileFields.fields.firstName &&
                        (profileFields.fields.firstName as string).trim() !== ""
                    ) {
                        user.firstName = profileFields.fields
                            .firstName as string
                    }
                    if (
                        profileFields.fields.lastName &&
                        (profileFields.fields.lastName as string).trim() !== ""
                    ) {
                        user.lastName = profileFields.fields.lastName as string
                    }
                    await user.save()
                }

                return res.status(200).json(profile)
            }

            profile = new ProfileModel(profileFields)
            await profile.save()
            res.status(201).json(profile)
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: "Server error" })
        }
    }
]

export const deleteProfile = async (req: Request, res: Response) => {
    if (!isUserDefined(req)) {
        return res.status(401).json({ error: "User not found" })
    }

    try {
        await ProfileModel.findOneAndRemove({ user: req.user.id })
        await UserModel.findByIdAndRemove(req.user.id)
        res.status(200).json({ message: "User and profile deleted" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getMyFileSize = async (req: IExtendedRequest, res: Response) => {
    try {
        const user = await UserModel.findById(req.user.id).lean().exec()
        if (!user) {
            return res.status(200).json({ fileSize: 0 })
        }

        return res.status(200).json({ fileSize: user.fileSize || 0 })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getMyApps = async (req: IExtendedRequest, res: Response) => {
    try {
        const populatedUser = await UserModel.findById(req.user.id)
            .populate("apps")
            .lean()
            .exec()
        if (!populatedUser) {
            return res.status(200).json([])
        }

        const defaultApps = await AppModel.find({ isDefault: true })
            .sort("ordering")
            .lean()
            .exec()

        const myApps = populatedUser.apps || []
        if (myApps.length === 0) {
            await UserModel.updateOne(
                { _id: req.user.id },
                { $set: { apps: defaultApps } }
            ).exec()
        }

        const forcedApps = await AppModel.find({ isForced: true }).lean().exec()

        return res
            .status(200)
            .json([
                ...(myApps.length === 0 ? defaultApps : myApps),
                ...forcedApps
            ])
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const addApp = async (req: IExtendedRequest, res: Response) => {
    try {
        const appId = req.body.appId
        const existingApp = await AppModel.findOne({ _id: appId }).lean().exec()
        if (!existingApp) {
            return res.status(404).json({ error: "App not found" })
        }
        await UserModel.updateOne(
            { _id: req.user.id },
            { $addToSet: { apps: appId } }
        ).exec()

        res.status(200).json({ result: "success" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const removeApp = async (req: IExtendedRequest, res: Response) => {
    try {
        const appId = req.body.appId
        await UserModel.updateOne(
            { _id: req.user.id },
            { $pull: { apps: appId } }
        ).exec()

        res.status(200).json({ result: "success" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const reorderApps = async (req: IExtendedRequest, res: Response) => {
    try {
        const appIds = req.body.appIds
        await UserModel.updateOne(
            { _id: req.user.id },
            { $set: { apps: appIds } }
        ).exec()

        res.status(200).json({ result: "success" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getApiKey = async (req: IExtendedRequest, res: Response) => {
    if (!isUserDefined(req)) {
        return res.status(401).json({ error: "User not authenticated" })
    }

    try {
        const user = await UserModel.findById(req.user.id)

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        if (!user.apiKey) {
            user.apiKey = crypto.randomBytes(32).toString("hex")
            await user.save()
        }

        res.status(200).json({ apiKey: user.apiKey })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const changeApiKey = async (req: IExtendedRequest, res: Response) => {
    if (!isUserDefined(req)) {
        return res.status(401).json({ error: "User not authenticated" })
    }

    try {
        const user = await UserModel.findById(req.user.id)

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        user.apiKey = crypto.randomBytes(32).toString("hex")
        await user.save()

        res.status(200).json({ apiKey: user.apiKey })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getBusinessDetails = async (
    req: IExtendedRequest,
    res: Response
) => {
    if (!isUserDefined(req)) {
        return res.status(401).json({ error: "User not authenticated" })
    }

    try {
        const user = await UserModel.findById(req.user.id)

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        res.status(200).json({
            businessName: user.businessName || "",
            businessAddress: user.businessAddress
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const changeBusinessDetails = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const user = await UserModel.findById(req.user.id)

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        if (
            ["businessName", "businessAddress"].some(
                (key) => req.body[key] === undefined
            )
        ) {
            return res
                .status(400)
                .json({ error: "Missing businessName or businessAddress" })
        }

        user.businessName = req.body.businessName
        user.businessAddress = req.body.businessAddress
        await user.save()

        res.status(200).json({
            businessName: user.businessName,
            businessAddress: user.businessAddress
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const addStoreToUser = async (
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    if (!isUserDefined(req)) {
        return res.status(401).json({ error: "User not authenticated" })
    }
    try {
        const user = await UserModel.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        const storeId = req.body.storeId
        const domain = req.body.domain

        if (!storeId || !domain) {
            return res.status(400).json({ error: "Missing storeId or domain" })
        }

        const store = {
            storeId,
            domain
        }

        user.store.push(store)

        await user.save()
        res.status(200).json({ store })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}
