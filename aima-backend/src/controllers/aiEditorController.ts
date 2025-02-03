import { Request, Response } from "express"
import AIEditorModel from "../models/aieditor"
import { v2 as cloudinary } from "cloudinary"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { UserActivityModel } from "../services/userActivity"

export const uploadOriginalImages = async (
    req: IExtendedRequest,
    res: Response
) => {
    await new UserActivityModel({
        userId: req.user.id,
        feature: "aiImageEditor"
    }).save()

    const files: Express.Multer.File[] = req.files as Express.Multer.File[]

    const fileSize = files.reduce((acc, file) => acc + file.size, 0)
    if (fileSize > 10 * 1024 * 1024) {
        return res
            .status(400)
            .send({ message: "File size should be less than 10MB" })
    }

    if (!files || files.length === 0) {
        return res.status(400).send("No image files provided.")
    }

    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        })

        const userId = req.user.id

        const uploads = files.map(async (file) => {
            const uploadResponse = await cloudinary.uploader.upload(
                `data:${file.mimetype};base64,${file.buffer.toString(
                    "base64"
                )}`,
                {
                    folder: `aiEditor/originals/${userId}`,
                    resource_type: "image"
                }
            )

            const aiEditorEntry = new AIEditorModel({
                originalUrl: uploadResponse.secure_url,
                userId: userId,

                editedUrl: ""
            })

            return aiEditorEntry.save()
        })

        const results = await Promise.all(uploads)
        res.json({ entries: results })
    } catch (error) {
        console.error("Error uploading original images:", error)
        res.status(500).send("Error processing files")
    }
}

export const updateEditedImage = async (
    req: IExtendedRequest,
    res: Response
) => {
    await new UserActivityModel({
        userId: req.user.id,
        feature: "aiImageEditor"
    }).save()

    const { id } = req.params
    const file: Express.Multer.File = req.file

    if (!file) {
        return res.status(400).send("No image file provided.")
    }

    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        })

        const uploadResponse = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
            {
                folder: `aiEditor/edited/${req.user.id}`,
                resource_type: "image"
            }
        )

        const updatedEntry = await AIEditorModel.findByIdAndUpdate(
            id,
            { editedUrl: uploadResponse.secure_url },
            { new: true }
        )

        if (!updatedEntry) {
            return res.status(404).send("Entry not found.")
        }

        res.json({ updatedEntry })
    } catch (error) {
        console.error("Error updating edited image:", error)
        res.status(500).send("Error updating entry")
    }
}
export const listAIEditorEntries = async (
    req: IExtendedRequest,
    res: Response
) => {
    const userId = req.user.id

    try {
        const entries = await AIEditorModel.find({ userId }).exec()
        res.json(entries)
    } catch (error) {
        res.status(500).send("Error retrieving entries")
    }
}

export const deleteUserAIEditorEntry = async (
    req: IExtendedRequest,
    res: Response
) => {
    await new UserActivityModel({
        userId: req.user.id,
        feature: "aiImageEditor"
    }).save()

    const { id } = req.params
    const userId = req.user.id

    try {
        const entry = await AIEditorModel.findOne({ _id: id, userId })

        if (!entry) {
            return res.status(404).send("Entry not found or access denied.")
        }

        await AIEditorModel.findByIdAndDelete(id)
        res.status(200).json({ message: "Image deleted successfully" })
    } catch (error) {
        res.status(500).send("Error deleting entry")
    }
}
