/* eslint-disable indent */
import { Response, NextFunction } from "express"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { IPayload } from "../types/IUser"
import InvalidatedTokenModel from "../models/invalidatedToken"
import UserModel from "../models/user"
import jwt from "jsonwebtoken"
import { UserActivityModel } from "../services/userActivity"

export const hasRoles =
    (roles: string[]) =>
    async (req: IExtendedRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.roles) {
            return res
                .status(401)
                .json({ error: "User not found or roles not set" })
        }

        const hasRole = req.roles.some((role) => roles.includes(role))

        if (!hasRole) {
            return res
                .status(403)
                .json({ error: "Access denied, insufficient privileges" })
        }

        next()
    }

export const authenticate = async (
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.header("Authorization")?.split(" ")[1]

    if (!token) {
        return res.status(401).json({ error: "No token, authorization denied" })
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as IPayload

        const user = await UserModel.findById(decoded.id).select("roles status")
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        if (user.status === "suspended") {
            return res.status(403).json({ error: "User is suspended" })
        }

        user.lastLoginDate = new Date()

        try {
            const userSavePromise = user.save()
            const userActivityPromise = new UserActivityModel({
                userId: user._id
            }).save()

            await Promise.allSettled([userSavePromise, userActivityPromise])
        } catch (error) {
            console.log("auth db update", error)
        }

        req.roles = user.roles
        req.user = { id: decoded.id }
        next()
    } catch (error) {
        console.log("auth", error)

        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                error: "Token expired",
                expiredAt: error.expiredAt
            })
        } else if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: "Invalid token" })
        } else {
            res.status(500).json({ error: "Server error" })
        }
    }
}

export const publicApiAuthenticate = async (
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    const apiKey = req.header("Deal-AI-API-Key")

    if (!apiKey) {
        return res.status(401).json({ error: "Missing API key" })
    }

    try {
        const user = await UserModel.findOne({ apiKey: apiKey })

        if (!user) {
            return res.status(401).json({ error: "Invalid API key" })
        }

        if (user.status === "suspended") {
            return res.status(403).json({ error: "User is suspended" })
        }

        await new UserActivityModel({
            userId: user._id,
            feature: "publicApi"
        }).save()

        req.user = { id: user._id }
        next()
    } catch (error) {
        console.error("Authentication error:", error)
        res.status(500).json({ error: "Server error" })
    }
}

export const pubUserAuth = async (
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    const { token } = req.params

    try {
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string)

            const { shareId }: any = decoded

            const compareShareIdInTokenInURL = () => {
                return shareId === req.params.shareId
            }

            if (!compareShareIdInTokenInURL()) {
                throw new Error("Share ID in token does not match with URL")
            }

            req.shareId = shareId

            next()
        } else {
            res.status(200).json({ authRequired: true })
        }
    } catch (error) {
        console.error("[pubUserAuth] Authentication error:", error)
        res.status(401).json({ error: "Authentication failed" })
    }
}
