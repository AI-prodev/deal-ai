/* eslint-disable @typescript-eslint/ban-ts-comment */
import { v2 as cloudinary } from "cloudinary"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { Response } from "express"
import * as fs from "fs"
import { UserActivityModel } from "../services/userActivity"
import Creation from "../models/creation"

export const uploadEditedImage = async (
    req: IExtendedRequest,
    res: Response
) => {
    await new UserActivityModel({
        userId: req.user.id,
        feature: "imageEditor"
    }).save()

    const userId = req.user.id
    const { creationId } = req.body

    if (!req.file) {
        return res.status(400).send("No image file provided.")
    }

    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        })

        const fileBuffer = req.file.buffer

        const uploadResponse = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${fileBuffer.toString("base64")}`,
            {
                folder: `edits/${userId}`,
                resource_type: "image"
            }
        )

        const creation = await Creation.findOne({
            _id: creationId,
            user: userId
        })

        if (!creation) {
            return res.status(404).send("Creation not found ")
        }

        creation.output = {
            ...creation.output,
            //@ts-ignore
            editedUrl: {
                url: uploadResponse.secure_url
            }
        }
        await creation.save()

        // Keep the original response structure
        res.json({ url: uploadResponse.secure_url })
    } catch (error) {
        console.error("Error uploading edited image:", error)
        res.status(500).send("Error uploading image.")
    }
}
