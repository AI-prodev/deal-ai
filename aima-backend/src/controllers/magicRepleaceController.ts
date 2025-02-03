// controllers/inpaintController.ts
import { Request, Response } from "express"
import MagicReplaceModel from "../models/magicReplace"
import MagicRemoveModel from "../models/magicRemove"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { RateLimitModel } from "../models/RateLimit"
import mongoose from "mongoose"
import { getUserById } from "../services/user.service"
import MagicBackgroundReplece from "../models/magicBackgroundReplece"

const imageToDataURL = (imageFile: Express.Multer.File): string => {
    const contentsBase64 = imageFile.buffer.toString("base64")
    return `data:${imageFile.mimetype};base64,${contentsBase64}`
}

export const startInpaint = async (
    req: IExtendedRequest,
    res: Response
): Promise<void> => {
    const user = await getUserById(req.user.id)
    const roles = user.roles

    // NB daily limit not weekly
    if (roles.includes("admin")) {
        console.log("Admin user, no rate limiting")
    } else {
        const rateLimitData = {
            weeklyLimit: 100,
            message:
                "Image generations are temporarily limited. Please try again later."
        }

        if (user.email && user.email.toLowerCase().includes("@deal.ai")) {
            console.log(
                "Deal AI user, expanded rate limit to 100: ",
                user.email
            )
            rateLimitData.weeklyLimit = 200
            rateLimitData.message = "Image generations are temporarily limited."
        }

        const oneDayAgo = new Date(
            new Date().getTime() - 1 * 24 * 60 * 60 * 1000
        )
        let imagesGenerated

        try {
            const result = await MagicReplaceModel.aggregate([
                {
                    $match: { userId: new mongoose.Types.ObjectId(req.user.id) }
                },
                { $unwind: "$creationTimes" },
                { $match: { creationTimes: { $gte: oneDayAgo } } },
                { $count: "numberOfCreations" }
            ])

            imagesGenerated =
                result.length > 0 ? result[0].numberOfCreations : 0
        } catch (error) {
            console.error("Error counting Magic Replace last day: ", error)
            throw error
        }

        const remainingGenerations = rateLimitData.weeklyLimit - imagesGenerated

        if (remainingGenerations <= 0) {
            console.log(
                `User ${user.email} has exceeded their Magic Replace limit of ${rateLimitData.weeklyLimit}.`
            )
            res.status(429).json({ error: "Rate limit exceeded" })
            return
        } else {
            console.log(
                `User ${user.email} has ${remainingGenerations} Magic Replace remaining this week.`
            )
        }
    }

    try {
        const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN
        const REPLICATE_INPAINT_MODEL =
            "c11bac58203367db93a3c552bd49a25a5418458ddffb7e90dae55780765e26d6"
        const userId = req.user.id
        const imageFile = (
            req.files as { [fieldname: string]: Express.Multer.File[] }
        )["image"][0]
        const maskFile = (
            req.files as { [fieldname: string]: Express.Multer.File[] }
        )["mask"][0]

        const input = {
            prompt: req.body.prompt,
            num_outputs: parseInt(req.body.outputs || "1", 10),
            image: imageToDataURL(imageFile),
            mask: imageToDataURL(maskFile)
        }

        const response = await fetch(
            "https://api.replicate.com/v1/predictions",
            {
                headers: {
                    Authorization: `Token ${REPLICATE_API_TOKEN}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    version: REPLICATE_INPAINT_MODEL,
                    input
                })
            }
        )

        const body = (await response.json()) as any

        if (response.status !== 201) {
            console.error("Prediction failed to run", body)
            res.status(500).send("Failed to run")
        }
        await MagicReplaceModel.updateOne(
            { userId: new mongoose.Types.ObjectId(userId) },
            { $push: { creationTimes: new Date() } },
            { upsert: true }
        )

        // await magicReplaceEntry.save()
        await updateTokensUsed(userId)

        res.status(201).send({
            id: body.id,
            status: body.status
        })
    } catch (error) {
        console.error("Error in startInpaint:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

export const getInpaintStatus = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN
        const predictionId = req.params.id

        const response = await fetch(
            `https://api.replicate.com/v1/predictions/${predictionId}`,
            {
                headers: {
                    Authorization: `Token ${REPLICATE_API_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        )

        const body = (await response.json()) as any

        if (body.error) {
            console.error("Prediction status", predictionId, body)
            res.status(500).send()
        }

        res.status(200).send({
            id: body.id,
            status: body.status,
            output: body.output
        })
    } catch (error) {
        console.error("Error in getInpaintStatus:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

export const cleanImage = async (
    req: IExtendedRequest,
    res: Response
): Promise<void> => {
    const user = await getUserById(req.user.id)
    const roles = user.roles

    // NB daily limit not weekly
    if (roles.includes("admin")) {
        console.log("Admin user, no rate limiting")
    } else {
        const rateLimitData = {
            weeklyLimit: 50,
            message:
                "Image generations are temporarily limited. Please try again later."
        }

        if (user.email && user.email.toLowerCase().includes("@deal.ai")) {
            console.log(
                "Deal AI user, expanded rate limit to 100: ",
                user.email
            )
            rateLimitData.weeklyLimit = 100
            rateLimitData.message = "Image generations are temporarily limited."
        }

        const oneDayAgo = new Date(
            new Date().getTime() - 1 * 24 * 60 * 60 * 1000
        )
        let imagesGenerated

        try {
            const result = await MagicRemoveModel.aggregate([
                {
                    $match: { userId: new mongoose.Types.ObjectId(req.user.id) }
                },
                { $unwind: "$creationTimes" },
                { $match: { creationTimes: { $gte: oneDayAgo } } },
                { $count: "numberOfCreations" }
            ])

            imagesGenerated =
                result.length > 0 ? result[0].numberOfCreations : 0
        } catch (error) {
            console.error("Error counting Magic Remove used last day: ", error)
            throw error
        }

        const remainingGenerations = rateLimitData.weeklyLimit - imagesGenerated

        if (remainingGenerations <= 0) {
            console.log(
                `User ${user.email} has exceeded their Magic Remove limit of ${rateLimitData.weeklyLimit}.`
            )
            res.status(429).json({ error: "Rate limit exceeded" })
            return
        } else {
            console.log(
                `User ${user.email} has ${remainingGenerations} Magic Replace remaining this week.`
            )
        }
    }

    const CLIPDROP_API_TOKEN = process.env.CLIPDROP_API_TOKEN
    try {
        const userId = req.user.id
        if (
            !req.files ||
            !(req.files as { [fieldname: string]: Express.Multer.File[] })[
                "image"
            ] ||
            !(req.files as { [fieldname: string]: Express.Multer.File[] })[
                "mask"
            ]
        ) {
            res.status(400).send("Image and mask files are required")
        }

        const imageFile = (
            req.files as { [fieldname: string]: Express.Multer.File[] }
        )["image"][0]
        const maskFile = (
            req.files as { [fieldname: string]: Express.Multer.File[] }
        )["mask"][0]

        const form = new FormData()

        form.append("image_file", new Blob([imageFile.buffer]), "image.jpeg")

        form.append("mask_file", new Blob([maskFile.buffer]), "mask.png")

        const response = await fetch("https://clipdrop-api.co/cleanup/v1", {
            headers: {
                "x-api-key": CLIPDROP_API_TOKEN
            },
            method: "POST",
            body: form
        })

        if (response.status !== 200) {
            res.sendStatus(response.status)
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        await MagicRemoveModel.updateOne(
            { userId: new mongoose.Types.ObjectId(userId) },
            { $push: { creationTimes: new Date() } },
            { upsert: true }
        )
        await updateTokensUsed(userId)

        res.send(buffer)
    } catch (error) {
        console.error("Error in cleanImage:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

export const replaceBackground = async (
    req: IExtendedRequest,
    res: Response
): Promise<void> => {
    const user = await getUserById(req.user.id)
    const roles = user.roles

    // NB daily limit not weekly
    if (roles.includes("admin")) {
        console.log("Admin user, no rate limiting")
    } else {
        const rateLimitData = {
            weeklyLimit: 50,
            message:
                "Image generations are temporarily limited. Please try again later."
        }

        if (user.email && user.email.toLowerCase().includes("@deal.ai")) {
            console.log(
                "Deal AI user, expanded rate limit to 100: ",
                user.email
            )
            rateLimitData.weeklyLimit = 100
            rateLimitData.message = "Image generations are temporarily limited."
        }

        const oneDayAgo = new Date(
            new Date().getTime() - 1 * 24 * 60 * 60 * 1000
        )
        let imagesGenerated

        try {
            const result = await MagicBackgroundReplece.aggregate([
                {
                    $match: { userId: new mongoose.Types.ObjectId(req.user.id) }
                },
                { $unwind: "$creationTimes" },
                { $match: { creationTimes: { $gte: oneDayAgo } } },
                { $count: "numberOfCreations" }
            ])

            imagesGenerated =
                result.length > 0 ? result[0].numberOfCreations : 0
        } catch (error) {
            console.error("Error counting Magic Remove used last day: ", error)
            throw error
        }

        const remainingGenerations = rateLimitData.weeklyLimit - imagesGenerated

        if (remainingGenerations <= 0) {
            console.log(
                `User ${user.email} has exceeded their Magic Remove limit of ${rateLimitData.weeklyLimit}.`
            )
            res.status(429).json({ error: "Rate limit exceeded" })
            return
        } else {
            console.log(
                `User ${user.email} has ${remainingGenerations} Magic Replace remaining this week.`
            )
        }
    }

    const CLIPDROP_API_TOKEN = process.env.CLIPDROP_API_TOKEN
    try {
        const userId = req.user.id
        if (
            !req.files ||
            !(req.files as { [fieldname: string]: Express.Multer.File[] })[
                "image"
            ]
        ) {
            res.status(400).send("Image file is required")
        }

        const imageFile = (
            req.files as { [fieldname: string]: Express.Multer.File[] }
        )["image"][0]
        const prompt = req.body.prompt

        const form = new FormData()
        form.append("image_file", new Blob([imageFile.buffer]), "image.jpeg")
        form.append("prompt", prompt)

        const response = await fetch(
            "https://clipdrop-api.co/replace-background/v1",
            {
                method: "POST",
                headers: {
                    "x-api-key": CLIPDROP_API_TOKEN
                },
                body: form
            }
        )

        if (response.status !== 200) {
            const errorBody = await response.text()
            res.status(response.status).send(errorBody)
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        await MagicBackgroundReplece.updateOne(
            { userId: new mongoose.Types.ObjectId(userId) },
            { $push: { creationTimes: new Date() } },
            { upsert: true }
        )
        await updateTokensUsed(userId)

        res.send(buffer)
    } catch (error) {
        console.error("Error in replaceBackground:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}
async function updateTokensUsed(userId: string) {
    const rateLimitData = await RateLimitModel.findOne({ userId: userId })

    if (!rateLimitData) {
        const newRateLimitData = new RateLimitModel({
            userId: userId,
            totalTokensUsed: 1500,
            lastTimeTotalTokensUsage: new Date()
        })
        await newRateLimitData.save()
    } else {
        rateLimitData.totalTokensUsed += 1500

        rateLimitData.lastTimeTotalTokensUsage = new Date()

        await rateLimitData.save()
    }
}
