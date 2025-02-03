import express, { Request, Response } from "express"
import { ISection } from "../types/ISection"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { deleteObject, putObject } from "../services/files.service"
import SectionModel from "../models/section"
import { randomUUID } from "crypto"

export const saveSection = async (req: IExtendedRequest, res: Response): Promise<void> => {
    try {
        const newSection: ISection = new SectionModel({
            user: req.user.id,
            title: req.body.title
        })
        await newSection.save()
        let jsonUrl = undefined
        if (req.body.section) {
            const jsonKey = `${newSection._id}_${randomUUID()}.json`
            await putObject({
                Bucket: process.env.S3_PAGES_BUCKET,
                ContentType: "application/json",
                Key: jsonKey,
                Body: JSON.stringify(req.body.section)
            })
            jsonUrl = process.env.CLOUDFRONT_PAGES_PREFIX + "/" + jsonKey
            newSection.jsonUrl = jsonUrl
            await newSection.save()
        }

        res.status(200).json({ newSection })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


export const getSections = async (req: IExtendedRequest, res: Response): Promise<void> => {
    try {
        const sections: ISection[] = await SectionModel.find({ user: req.user.id }).lean().exec()
        res.status(200).json({ sections })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const deleteSection = async (req: IExtendedRequest, res: Response) => {
    try {
        const section = await SectionModel.findOne({ _id: req.params.id, user: req.user.id }).lean().exec()

        if (section) {
            const bucketKey = section.jsonUrl.split("cloudfront.net/")[1]
            await SectionModel.deleteOne({ _id: req.params.id, user: req.user.id }).exec()
            deleteObject({
                Bucket: process.env.S3_PAGES_BUCKET,
                Key: bucketKey
            })
            return res.status(200).json({ success: true })
        }
        return res.status(200).json({ success: false })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}
