import { Request, Response } from "express"
import FunnelModel from "../models/funnel"
import PageModel from "../models/page"
import IntegrationModel from "../models/integration"
import ContactModel from "../models/contact"
import PageViewModel from "../models/pageView"
import { v4 as uuidv4 } from "uuid"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { FunnelType, IFunnel } from "../types/IFunnel"
import { setRedis } from "../services/redis.service"
import processCloneFunnel from "../utils/processCloneFunnel"
import { putObject } from "../services/files.service"
import * as fs from "fs"
import { randomUUID } from "crypto"
import { getRequestFunnelType } from "../utils/getRequestFunnelType"
import mongoose, { FilterQuery, Types } from "mongoose"
import { getFunnelAndPageFromUrl } from "../utils/funnelUtils"
import { OrderModel } from "../models/order"

export const createFunnel = async (req: IExtendedRequest, res: Response) => {
    try {
        const newFunnelParams: FilterQuery<typeof FunnelModel> = {
            user: req.user.id,
            title: req.body.title,
            numSteps: 0,
            ...getRequestFunnelType(req.body.type),
        }
        if (req.body.projectId && req.body.projectId !== "default") {
            newFunnelParams.project = req.body.projectId
        }

        const newFunnel: IFunnel = new FunnelModel(newFunnelParams)
        await newFunnel.save()

        res.status(200).json(newFunnel)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const createFunnelWithAI = async (req: IExtendedRequest, res: Response) => {
    try {
        const newFunnelParams: FilterQuery<typeof FunnelModel> = {
            user: req.user.id,
            title: req.body.title,
            numSteps: 0,
            prompt: req.body.prompt,
            ...getRequestFunnelType(req.body.type),
        } as any
        if (req.body.projectId && req.body.projectId !== "default") {
            newFunnelParams.project = req.body.projectId
        }

        const newFunnel: IFunnel = new FunnelModel(newFunnelParams)
        await newFunnel.save()

        res.status(200).json(newFunnel)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const cloneFunnel = async (req: IExtendedRequest, res: Response) => {
    try {
        if (!req.body.funnelId) {
            throw new Error("Funnel ID is required")
        }

        const funnel = await FunnelModel.findOne({
            _id: req.body.funnelId,
            user: req.user.id,
        })

        if (!funnel || funnel.archivedAt) {
            throw new Error("Invalid funnel")
        }

        const funnelPages = await PageModel.find({ funnel: funnel._id }).lean().exec()

        const newFunnelParams: FilterQuery<typeof FunnelModel> = {
            user: req.user.id,
            title: funnel.title + " (copy)",
            numSteps: funnel.numSteps,
            faviconUrl: funnel.faviconUrl,
            ...(funnel.type && { type: funnel.type })
        }
        if (funnel?.project) {
            newFunnelParams.project = funnel.project
        }
        const newFunnel: IFunnel = new FunnelModel(newFunnelParams)
        await newFunnel.save()


        const pages = []
        const token = `pending-request:${uuidv4()}`
        for (const existingPage of funnelPages) {
            const pageParams = {
                oldContentUrl: existingPage.contentUrl,
                oldJsonUrl: existingPage.jsonUrl,
                projectId: req.body.projectId ? req.body.projectId : undefined,
                title: existingPage.title,
                path: existingPage.path,
                funnelStep: existingPage.funnelStep,
                thumbnailUrl: existingPage.thumbnailUrl,
                extraHead: existingPage.extraHead,
                extraBody: existingPage.extraBody,
            }
            pages.push(pageParams)
        }

        await setRedis(token, JSON.stringify({
            status: "processing",
            input: req.body
        }))

        processCloneFunnel(pages, req.user.id, funnel._id, newFunnel._id, token).catch(async (err) => {
            console.error(err)
            setRedis(token, JSON.stringify({
                status: "error",
                error: err.message,
                input: req.body
            }))

            if (newFunnel) {
                await FunnelModel.deleteOne({ _id: newFunnel._id }).exec()
            }
        })

        res.status(200).json(token)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const importFunnel = async (req: IExtendedRequest, res: Response) => {
    try {
        if (!req.body.funnelId) {
            throw new Error("Funnel ID is required")
        }

        const funnel = await FunnelModel.findOne({
            _id: req.body.funnelId,
        })

        if (!funnel || funnel.archivedAt) {
            throw new Error("Invalid funnel")
        }

        const funnelPages = await PageModel.find({ funnel: funnel._id }).lean().exec()

        const newFunnelParams: FilterQuery<typeof FunnelModel> = {
            user: req.user.id,
            title: funnel.title,
            numSteps: funnel.numSteps,
            faviconUrl: funnel.faviconUrl,
            ...(funnel.type && { type: funnel.type })
        }

        if (req.body.projectId && req.body.projectId !== "default") {
            newFunnelParams.project = req.body.projectId
        }

        const newFunnel: IFunnel = new FunnelModel(newFunnelParams)
        await newFunnel.save()

        const pages = []
        const token = `pending-request:${uuidv4()}`
        for (const existingPage of funnelPages) {
            const page = {
                oldContentUrl: existingPage.contentUrl,
                oldJsonUrl: existingPage.jsonUrl,
                projectId: req.body.projectId ? req.body.projectId : undefined,
                title: existingPage.title,
                path: existingPage.path,
                funnelStep: existingPage.funnelStep,
                thumbnailUrl: existingPage.thumbnailUrl,
                extraHead: existingPage.extraHead,
                extraBody: existingPage.extraBody,
            }
            pages.push(page)
        }

        await setRedis(token, JSON.stringify({
            status: "processing",
            input: req.body
        }))

        processCloneFunnel(pages, req.user.id, funnel._id, newFunnel._id, token).catch(async (err) => {
            console.error(err)
            setRedis(token, JSON.stringify({
                status: "error",
                error: err.message,
                input: req.body
            }))

            if (newFunnel) {
                await FunnelModel.deleteOne({ _id: newFunnel._id }).exec()
            }
        })

        res.status(200).json(token)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getFunnel = async (req: IExtendedRequest, res: Response) => {
    try {
        const funnel = await FunnelModel.findOne({
            _id: req.params.funnelId,
        })
            .populate("project domain menu")
            .exec()

        if (!funnel || funnel.archivedAt) {
            throw new Error("Invalid funnel")
        }

        res.status(200).json(funnel)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getFunnelMenus = async (req: IExtendedRequest, res: Response) => {
    try {
        const funnel = await FunnelModel.findOne({
            _id: req.params.funnelId,
        })
            .select("menu")
            .populate("menu")
            .exec()

        if (!funnel || funnel.archivedAt) {
            return res.status(404).json({ error: "Funnel not found" })
        }

        res.status(200).json(funnel.menu)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getProjectFunnels = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const type = getRequestFunnelType(<string>req.query.type)
        const archivedAt = req.query.archived === "true" ? {
            // @ts-ignore
            $ne: null
        } : null

        if (req.params.projectId === "default") {
            const funnels = await FunnelModel.find({
                user: req.user.id,
                archivedAt,
                ...type,
            }).exec()

            return res.status(200).json(funnels)
        }

        const funnels = await FunnelModel.find({
            project: req.params.projectId,
            archivedAt,
            ...type,
        }).exec()
        res.status(200).json(funnels)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getUserFunnels = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const archivedAt = req.query.archived === "true" ? {
            // @ts-ignore
            $ne: null
        } : null

        const funnels = await FunnelModel.find({
            user: req.user.id,
            archivedAt,
            $and: [{
                type: { $ne: FunnelType.ULTRA_FAST_WEBSITE }
            }, {
                type: { $ne: FunnelType.EASY_WEBSITES }
            }, {
                type: { $ne: FunnelType.SMART_WEBSITES }
            }, {
                type: { $ne: FunnelType.SIMPLE_WEBSITES }
            }],
        }).limit(999).lean().exec()

        return res.status(200).json(funnels)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const deleteFunnel = async (req: IExtendedRequest, res: Response) => {
    try {
        if (!req.params.funnelId) {
            throw new Error("Funnel ID is required")
        }

        await FunnelModel.deleteOne({
            _id: req.params.funnelId,
            user: req.user.id,
        }).exec()

        res.status(200).json()
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const archiveFunnel = async (req: IExtendedRequest, res: Response) => {
    try {
        if (!req.params.funnelId) {
            throw new Error("Funnel ID is required")
        }

        await FunnelModel.updateOne(
            {
                _id: req.params.funnelId,
                user: req.user.id,
            },
            {
                archivedAt: new Date(),
            }
        ).exec()

        res.status(200).json()
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const restoreFunnel = async (req: IExtendedRequest, res: Response) => {
    try {
        if (!req.params.funnelId) {
            throw new Error("Funnel ID is required")
        }

        await FunnelModel.updateOne(
            {
                _id: req.params.funnelId,
                user: req.user.id,
            },
            {
                archivedAt: null,
            }
        ).exec()

        res.status(200).json()
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const updateFunnelDomain = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const funnelId = req.params.funnelId
        const domainId = req.body.domainId
        console.log("domainId=", domainId)

        const funnel = await FunnelModel.findOne({
            _id: funnelId,
            user: req.user.id,
        })

        if (!funnel || funnel.archivedAt) {
            return res
                .status(404)
                .json({ error: "Funnel not found or user not authorized" })
        }

        funnel.domain = domainId
        await funnel.save()

        res.status(200).json(funnel)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const updateFunnelWebhooks = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const funnelId = req.params.funnelId
        const webhooks = req.body.webhooks

        const funnel = await FunnelModel.findOne({
            _id: funnelId,
            user: req.user.id,
        })

        if (!funnel || funnel.archivedAt) {
            return res
                .status(404)
                .json({ error: "Funnel not found or user not authorized" })
        }

        funnel.webhooks = webhooks
        await funnel.save()

        res.status(200).json(funnel)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const updateFunnelSettings = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const funnelId = req.params.funnelId
        const updatedSettings = req.body

        updatedSettings && delete updatedSettings.type

        const funnel = await FunnelModel.findOne({
            _id: funnelId,
            user: req.user.id,
        })
        if (!funnel || funnel.archivedAt) {
            return res
                .status(404)
                .json({ error: "Funnel not found or user not authorized" })
        }

        funnel.settings = { ...funnel.settings, ...updatedSettings }
        await funnel.save()

        res.status(200).json(funnel)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const updateFunnelTitle = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const funnelId = req.params.funnelId
        const newTitle = req.body.title

        const funnel = await FunnelModel.findOne({
            _id: funnelId,
            user: req.user.id,
        })
        if (!funnel || funnel.archivedAt) {
            return res
                .status(404)
                .json({ error: "Funnel not found or user not authorized" })
        }

        funnel.title = newTitle
        await funnel.save()

        res.status(200).json(funnel)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const updateFunnelSteps = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const funnelId = req.params.funnelId
        const pageIDs = req.body
        const pages = []

        for (const [index, pageId] of pageIDs.entries()) {
            const page = await PageModel.findOneAndUpdate(
                {
                    funnel: funnelId,
                    user: req.user.id,
                    _id: pageId,
                },
                { funnelStep: index + 1 }
            )
            pages.push(page)
        }

        res.status(200).json(pages)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const updateFunnelMenu = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const funnelId = req.params.funnelId
        const { pageIds } = req.body

        const funnel = await FunnelModel.findOne({
            _id: funnelId,
            user: req.user.id,
        })

        if (!funnel || funnel.archivedAt) {
            return res
                .status(404)
                .json({ error: "Funnel not found or user not authorized" })
        }

        if (!pageIds?.length) {
            funnel.menu = []
            await funnel.save()

            return res.status(200).json(funnel)
        }

        // Check if all pages belong to the funnel
        const pages = await PageModel.find({
            funnel: funnelId,
            user: req.user.id,
            _id: { $in: pageIds },
        })

        if (pages.length !== pageIds.length) {
            return res
                .status(404)
                .json({ error: "Invalid page IDs" })
        }

        funnel.menu = pageIds.map((pageId: string) => new mongoose.Types.ObjectId(pageId))
        await funnel.save()

        res.status(200).json(funnel)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getNextPage = async (req: Request, res: Response) => {
    try {

        const url = req.body.url

        const { funnel, path } = await getFunnelAndPageFromUrl(url)
        if (!funnel) {
            res.status(404).json({ error: "No next page found" })
        }

        const pages = await PageModel.find({ funnel: funnel._id }).sort("funnelStep").lean().exec()
        const currentIndex = pages.findIndex(item => item.path === path)

        const nextPage = currentIndex !== -1 && currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null

        if (nextPage) {
            res.status(200).json(nextPage)
        } else {
            res.status(404).json({ error: "No next page found" })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const updateFunnelFavicon = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const funnelId = req.params.funnelId

        const funnel = await FunnelModel.findOne({
            _id: funnelId,
            user: req.user.id
        })

        if (!funnel || funnel.archivedAt) {
            return res
                .status(404)
                .json({ error: "Funnel not found or user not authorized" })
        }

        const favicon = req?.file

        if (!favicon) {
            return res.status(400).json({ error: "Missing favicon" })
        }

        const fileContent = fs.readFileSync(req.file.path)
        const fileKey = `${funnelId}_${randomUUID()}_${req.file.originalname}`
        await putObject({
            Bucket: process.env.S3_UPLOADS_BUCKET,
            Key: fileKey,
            Body: fileContent,
            ContentType: req.file.mimetype
        })

        funnel.faviconUrl = process.env.CLOUDFRONT_UPLOADS_PREFIX + `/${fileKey}`

        await funnel.save()

        res.status(200).json(funnel)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const deleteFunnelFavicon = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const funnelId = req.params.funnelId

        const funnel = await FunnelModel.findOne({
            _id: funnelId,
            user: req.user.id
        })

        if (!funnel || funnel.archivedAt) {
            return res
                .status(404)
                .json({ error: "Funnel not found or user not authorized" })
        }

        funnel.faviconUrl = null

        await funnel.save()

        res.status(200).json(funnel)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const addZapToFunnels = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const { funnel_id, zap: hook } = req.body
        const allFunnels = funnel_id === "All Funnels" ? true : false
        let query = {}

        if (allFunnels) {
            query = {
                user: req.user.id,
                type: "zapier",
                data: { funnelId: null, hook, allFunnels: true }
            }
        } else {
            query = {
                user: req.user.id,
                type: "zapier",
                data: { funnelId: new Types.ObjectId(funnel_id), hook }
            }
        }
        await IntegrationModel.create(query)
        
        res.status(200).json("")
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const deleteZapFromAllFunnels = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const hook = req.body.zap
        await IntegrationModel.deleteMany({ "data.hook": hook })

        res.status(200).json("Zap hook was deleted successfully from all funnels.")
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getFunnelViews = async (
    req: IExtendedRequest,
    res: Response) => {
    try {

        const funnelId = req.params.funnelId

        const { startDate, endDate, page = "1", limit, sort } = req.query

        if (!funnelId || !startDate || !endDate || !page) {
            return res.status(400).json({ error: "Missing funnelId, startDate or endDate" })
        }

        const pagesData = (await PageModel.aggregate([
            {
                $match: {
                    funnel: new mongoose.Types.ObjectId(funnelId.toString()),
                },
            },
            {
                $facet: {
                    pages: [
                        // { $sort: { funnelStep: 1 } },
                        // { $skip: (Number(page) - 1) * Number(limit) },
                        // { $limit: Number(limit) },
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                funnelStep: 1,
                            },
                        },
                    ],
                    totalCount: [{ $count: "value" }],
                },
            }
        ]))[0]

        if (!pagesData) {
            return res.status(404).json({ error: "No pages found" })
        }

        const totalPagesCount = pagesData.totalCount[0]?.value || 0

        const pageIds = pagesData.pages

        const pageIdsObject: Record<string, NonNullable<unknown>> = {}

        pageIds.forEach((pageId: { _id: string; title: any; funnelStep: any }) => {
            pageIdsObject[pageId._id] = {
                pageTitle: pageId.title,
                pageId: pageId._id,
                funnelStep: pageId.funnelStep
            }
        })

        // contact stats within date range
        const contactStatsAggregation = [
            {
                $match: {
                    funnel: new mongoose.Types.ObjectId(funnelId.toString()),
                    createdAt: {
                        $gte: new Date(startDate.toString()),
                        $lte: new Date(endDate.toString())
                    }
                }
            }, {
                $facet: {
                    totalContactsCount: [
                        {
                            $group: {
                                _id: "",
                                totalContactsCount: { $sum: 1 },
                                uniqueContactsCount: { $sum: 1 },
                            }
                        }, {
                            $project: {
                                _id: 0,
                                totalContactsCount: 1,
                                uniqueContactsCount: 1,
                            }
                        }
                    ],
                    contactFormSubmissions: [
                        {
                            $match: {
                                page: { $in: (Object.keys(pageIdsObject)).map((pageId) => new mongoose.Types.ObjectId(pageId)) },
                            }
                        },
                        {
                            $group: {
                                _id: "$page",
                                contactsCount: { $push: "$$ROOT" },
                                uniqueContacts: { $addToSet: "$email" }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                pageId: "$_id",
                                totalContacts: { $size: "$contactsCount" },
                                submissionRate: { $toString: { $round: [{ $multiply: [{ $divide: [{ $size: "$uniqueContacts" }, { $size: "$contactsCount" }] }, 100] }, 2] } },
                                statsOf: "contacts"
                            }
                        }
                    ]
                }
            }
        ]

        // page view stats within date range
        const pageViewStatsAggregation = [
            {
                $match: {
                    funnel: new mongoose.Types.ObjectId(funnelId.toString()),
                    createdAt: {
                        $gte: new Date(startDate.toString()),
                        $lte: new Date(endDate.toString())
                    }
                }
            },
            {
                $facet: {
                    totalPageViewsCount: [
                        {
                            $group: {
                                _id: "",
                                totalPageViewsCount: { $sum: 1 },
                                uniquePageViewsCount: { $addToSet: "$ipAddr" },
                            }
                        }, {
                            $project: {
                                _id: 0,
                                totalPageViewsCount: 1,
                                uniquePageViewsCount: { $size: "$uniquePageViewsCount" },
                            }
                        }
                    ],
                    pageViews: [
                        {
                            $group: {
                                _id: "$page",
                                pageViewsCount: { $push: "$$ROOT" },
                                uniquePageViews: { $addToSet: "$ipAddr" }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                pageId: "$_id",
                                totalViews: { $size: "$pageViewsCount" },
                                uniqueViews: { $size: "$uniquePageViews" },
                                statsOf: "pageViews"
                            }
                        }
                    ]
                }
            }
        ]

        // sales stats within date range
        const salesStatsAggregation = [
            {
                $match: {
                    funnel: new mongoose.Types.ObjectId(funnelId.toString()),
                    createdAt: {
                        $gte: new Date(startDate.toString()),
                        $lte: new Date(endDate.toString())
                    }
                }
            }, {
                $facet: {
                    totalSalesCount: [
                        {
                            $group: {
                                _id: "$funnel",
                                totalSalesCount: {
                                    $sum: 1,
                                },
                                uniqueSalesCount: {
                                    $addToSet: "$customer",
                                },
                                totalSalesAmount: {
                                    $sum: "$amount",
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                totalSalesCount: 1,
                                uniqueSalesCount: {
                                    $size: "$uniqueSalesCount",
                                },
                                totalSalesAmount: {
                                    $round: [
                                        {
                                            $divide: ["$totalSalesAmount", 100],
                                        },
                                        2,
                                    ],
                                },
                            },
                        },
                    ],
                    sales: [
                        {
                            $group: {
                                _id: "$page",
                                salesCount: { $push: "$$ROOT" },
                                uniqueSales: { $addToSet: "$customer" },
                                saleAmount: { $sum: "$amount" },
                                recurringSalesCount: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$type", "recurring"] },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                recurringSalesAmount: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$type", "recurring"] },
                                            "$amount",
                                            0
                                        ]
                                    }
                                },
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                pageId: "$_id",
                                totalSales: { $size: "$salesCount" },
                                uniqueSales: { $size: "$uniqueSales" },
                                saleRate: { $round: [{ $multiply: [{ $divide: [{ $size: "$uniqueSales" }, { $size: "$salesCount" }] }, 100] }, 2] },
                                saleAmount: { $round: [{ $divide: ["$saleAmount", 100] }, 2] },
                                recurringSalesCount: 1,
                                recurringSalesAmount: { $round: [{ $divide: ["$recurringSalesAmount", 100] }, 2] },
                                statsOf: "sales"
                            }
                        },
                    ]
                }
            }
        ]

        const contactStats = (await ContactModel.aggregate(contactStatsAggregation))[0]

        const pageViewStats = (await PageViewModel.aggregate(pageViewStatsAggregation))[0]

        const salesStats = (await OrderModel.aggregate(salesStatsAggregation))[0]

        let pageStats: any = {
            ...pageIdsObject
        }

        // loop over an array of arrays of objects and merge them into one object by pageId
        const stats = [contactStats.contactFormSubmissions, pageViewStats.pageViews, salesStats.sales]

        stats.forEach((stat) => {
            stat.forEach((item: { pageId: any; statsOf: any }) => {
                const pageId = item.pageId
                delete item.pageId
                pageStats[pageId] = {
                    ...pageStats[pageId],
                    [item.statsOf]: item,
                }
            })
        })

        pageStats = Object.values(pageStats)

        // sort by funnelStep
        pageStats.sort((a: { funnelStep: number }, b: { funnelStep: number }) => {
            return a.funnelStep - b.funnelStep
        })

        res.status(200).json({
            totalPagesCount,
            ...(contactStats.totalContactsCount[0]),
            ...(pageViewStats.totalPageViewsCount[0]),
            ...(salesStats.totalSalesCount[0]),
            pageStats
        })

    } catch (error) {
        console.log(" err :>>", error)
        res.status(500).json({ error: "Server error" })
    }
}
