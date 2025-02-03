import * as fs from "fs"
import { Request, Response } from "express"
import { randomUUID } from "crypto"
import { v4 as uuidv4 } from "uuid"
import UserModel from "../models/user"
import PageModel from "../models/page"
import PageViewModel from "../models/pageView"
import FunnelModel from "../models/funnel"
import ListModel from "../models/list"
import { putObject } from "../services/files.service"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { IPage } from "../types/IPage"
import processCrawlUrl from "../utils/processCrawlUrl"
import { takeScreenshot } from "../utils/screenshot"
import { generateRandomPath } from "../utils/processRequestPageGenerator"
import Stripe from "stripe"
import IntegrationModel from "../models/integration"
import { setRedis, getRedis, deleteRedis } from "../services/redis.service"
import { getFunnelAndPageFromUrl } from "../utils/funnelUtils"
import { sendWebhook } from "./webhookController"
import { renderBlogPost } from "./blogPostController"

interface ExtendedPrice extends Stripe.Price {
    accountId?: string;
}
const ALLOWED_PAGE_ROLES = [
    "admin",
    "user",
    "lite"
]

const INACTIVE_SITE_REDIRECT = "https://deal.ai/activate-site"

function prepareContent({
    content,
    title,
    extraHead,
    extraBody,
    faviconUrl,
    funnelMenu = [],
}: {
    content: string,
    title: string,
    extraHead?: string,
    extraBody?: string,
    faviconUrl?: string,
    funnelMenu?: { title: string, path: string }[]
}) {
    return content
        .replace(/<img /g, "<img alt=\"image\" crossorigin=\"anonymous\" ")
        .replace(/<link /g, "<link crossorigin=\"anonymous\" ")
        .replace(/<iframe /g, "<iframe credentialless title=\"frame\" ")
        .replace(/src="https:\/\/www.youtube.com/g, "src=\"https://www.youtube-nocookie.com")
        .replace("<html>", "<!DOCTYPE html><html lang=\"en\">")
        .replace("<head>", `<head><title>${title}</title><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${title}"><script>var public_stripe_key = '${process.env.STRIPE2_PUBLIC_KEY}';</script>`)
        .replace("</head>", (faviconUrl && faviconUrl != "undefined") ? `<link rel="shortcut icon" href="${faviconUrl}"></head>` : "</head>")
        .replace("</head>", (extraHead && extraHead != "undefined") ? `${extraHead}</head>` : "</head>")
        .replace("</body>", (extraBody && extraBody != "undefined") ? `${extraBody}</body>` : "</body>")
        .replace(/const menu = \[\];/g, `const menu = ${JSON.stringify(funnelMenu)}`)
}


export const clonePage = async (req: IExtendedRequest, res: Response) => {
    try {
        const existingPage = await PageModel.findOne({ _id: req.body.pageId, user: req.user.id }).lean().exec()
        if (!existingPage) {
            throw new Error("Invalid page")
        }

        const funnel = await FunnelModel.findOne({ _id: existingPage.funnel })
        if (!funnel) {
            throw new Error("Invalid funnel")
        }

        let numSteps = funnel.numSteps

        const funnelPages = await PageModel.find({ funnel: funnel._id }).lean().exec()

        if (numSteps === undefined) {
            numSteps = funnelPages.length
        }

        if (numSteps > 100) {
            throw new Error("Too many funnel steps")
        }

        const randomPath = await generateRandomPath(funnel._id)

        if (!randomPath) {
            throw new Error("Unable to create page path")
        }

        funnel.numSteps = numSteps + 1
        await funnel.save()

        const newPage: IPage = new PageModel({
            user: req.user.id,
            project: existingPage.project,
            funnel: existingPage.funnel,
            funnelStep: numSteps + 1,
            title: existingPage.title + " (copy)",
            path: randomPath,
            contentUrl: existingPage.contentUrl,
            jsonUrl: existingPage.jsonUrl,
            thumbnailUrl: existingPage.thumbnailUrl,
            faviconUrl: funnel.faviconUrl,
            extraHead: existingPage.extraHead,
            extraBody: existingPage.extraBody,
            versions: []
        })
        await newPage.save()

        res.status(200).json(newPage)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const renderPage = async (req: IExtendedRequest, res: Response) => {
    try {
        const path = req.params.path || ""
        const domain = req.domain

        if(req.sharedBlogDomain) {
            return renderBlogPost(req, res)
        }

        if (!domain) {
            return res.status(404).send("Domain not found")
        }
        const funnels = await FunnelModel.find({
            domain: domain._id
        }).populate("menu").lean().exec()

        if (!funnels || funnels.length === 0) {
            return renderBlogPost(req, res)
        }

        const funnelIds = funnels.map(funnel => funnel._id)

        const page = await PageModel.findOne({
            path,
            funnel: { $in: funnelIds }
        }).lean().exec()

        if (!page || !page.user) {
            return res.status(404).send("Page not found")
        }

        const user = await UserModel.findOne({ _id: page.user }).lean().exec()
        if (!user || !user.roles || (!user.roles.find(role => ALLOWED_PAGE_ROLES.includes(role)))) {
            return res.redirect(INACTIVE_SITE_REDIRECT)
        }

        const selectedFunnel = funnels.find(funnel => funnel._id.toString() === page.funnel.toString())

        let content = await (await fetch(page.contentUrl)).text()
        content = prepareContent({
            content,
            title: page.title,
            extraHead: page.extraHead,
            extraBody: page.extraBody,
            faviconUrl: selectedFunnel.faviconUrl,
            funnelMenu: selectedFunnel.menu?.map((fn: any) => ({ title: fn.title, path: fn.path }))
        })

        // create a page view record for analytics
        await PageViewModel.create({
            user: selectedFunnel.user,
            project: selectedFunnel.project,
            funnel: selectedFunnel._id,
            page: page._id,
            ipAddr: req?.ip
        })

        res
            .set("Content-Security-Policy", "script-src 'self' 'unsafe-inline' *")
            .set("Cross-Origin-Embedder-Policy", "unsafe-none")
            .status(200)
            .type("text/html")
            .send(content)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}


export const renderPreview = async (req: IExtendedRequest, res: Response) => {
    try {
        const path = req.params.path || ""
        const funnelId = req.params.funnelId
        const funnel = await FunnelModel.findById(funnelId).populate("menu").lean().exec()
        if (!funnel || funnel.archivedAt) {
            return res.status(404).send("Page not found")
        }

        let page = await PageModel.findOne({
            path,
            funnel: funnel._id
        }).lean().exec()
        if (!page) {
            page = await PageModel.findOne({
                funnel: funnel._id
            }).lean().exec()
        }

        if (!page || !page.user) {
            return res.status(404).send("Page not found")
        }

        const user = await UserModel.findOne({ _id: page.user }).lean().exec()
        if (!user || !user.roles || (!user.roles.find(role => ALLOWED_PAGE_ROLES.includes(role)))) {
            return res.redirect(INACTIVE_SITE_REDIRECT)
        }

        let content = await (await fetch(page.contentUrl)).text()
        content = prepareContent({
            content,
            title: page.title,
            extraHead: page.extraHead,
            extraBody: page.extraBody,
            faviconUrl: funnel.faviconUrl,
            funnelMenu: funnel.menu?.map((fn: any) => ({ title: fn.title, path: fn.path }))
        })

        // create a page view record for analytics
        await PageViewModel.create({
            user: funnel.user,
            project: funnel.project,
            funnel: funnel._id,
            page: page._id,
            ipAddr: req?.ip
        })
        res
            .set("Content-Security-Policy", "script-src 'self' 'unsafe-inline' *")
            .set("Cross-Origin-Embedder-Policy", "unsafe-none")
            .status(200)
            .type("text/html")
            .send(content)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}


export const renderVersion = async (req: IExtendedRequest, res: Response) => {
    try {
        const path = req.params.path || ""
        const funnelId = req.params.funnelId
        const versionId = req.params.versionId
        const funnel = await FunnelModel.findById(funnelId).populate("menu").lean().exec()
        if (!funnel || funnel.archivedAt) {
            return res.status(404).send("Page not found")
        }

        let page = await PageModel.findOne({
            path,
            funnel: funnel._id
        }).lean().exec()
        if (!page) {
            page = await PageModel.findOne({
                funnel: funnel._id
            }).lean().exec()
        }

        if (!page || !page.user) {
            return res.status(404).send("Page not found")
        }

        const user = await UserModel.findOne({ _id: page.user }).lean().exec()
        if (!user || !user.roles || (!user.roles.find(role => ALLOWED_PAGE_ROLES.includes(role)))) {
            return res.redirect(INACTIVE_SITE_REDIRECT)
        }

        const version = page.versions?.find(v => v._id.toString() === versionId)
        if (!version) {
            return res.status(404).send("Version not found")
        }

        let content = await (await fetch(version.contentUrl)).text()
        content = prepareContent({
            content,
            title: page.title,
            extraHead: version.extraHead,
            extraBody: version.extraBody,
            faviconUrl: funnel.faviconUrl,
            funnelMenu: funnel.menu?.map((fn: any) => ({ title: fn.title, path: fn.path }))
        })

        res
            .set("Content-Security-Policy", "script-src 'self' 'unsafe-inline' *")
            .set("Cross-Origin-Embedder-Policy", "unsafe-none")
            .status(200)
            .type("text/html")
            .send(content)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}


export const proxyContent = async (req: IExtendedRequest, res: Response) => {
    try {
        const url = req.params.url
        console.log("url=", url)

        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Error fetching the proxied URL: ${response.statusText}`)
        }

        res.setHeader("Content-Type", response.headers.get("content-type"))

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        res.send(buffer)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}


export const proxyFont = async (req: IExtendedRequest, res: Response) => {
    try {
        const fontFile = req.params.fontFile
        console.log("url=", fontFile)

        const url = `https://use.fontawesome.com/releases/v5.9.0/webfonts/${fontFile}`

        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Error fetching the proxied URL: ${response.statusText}`)
        }

        res.setHeader("Content-Type", response.headers.get("content-type"))

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        res.send(buffer)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}


export const getContent = async (req: IExtendedRequest, res: Response) => {
    try {
        const fileName = req.params.fileName

        const content = fs
            .readFileSync(`${__dirname}/../../data/pages/${fileName}`, "utf-8")

        res
            .set("Content-Security-Policy", "script-src 'self' 'unsafe-inline' *")
            .status(200)
            .type("text/html")
            .send(content)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getPage = async (req: IExtendedRequest, res: Response) => {
    try {
        const page = await PageModel.findOne({
            _id: req.params.id,
            user: req.user.id
        })

        if (!page) {
            return res.status(404).json({ error: "Page not found" })
        }

        const pageData: IPage = page.toObject({
            versionKey: false
        })

        res.status(200).json(pageData)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}


export const savePage = async (req: IExtendedRequest, res: Response) => {
    try {
        const page = await PageModel.findOne({
            _id: req.params.id,
            user: req.user.id
        }).exec()

        if (!page) {
            return res.status(404).json({ error: "Page not found" })
        }

        const html = req.body.html
        const json = req.body.json

        const pageKey = `${page._id}_${randomUUID()}.html`
        await putObject({
            Bucket: process.env.S3_PAGES_BUCKET,
            ContentType: "text/html",
            Key: pageKey,
            Body: html
        })
        const contentUrl = process.env.CLOUDFRONT_PAGES_PREFIX + "/" + pageKey

        const jsonKey = `${page._id}_${randomUUID()}.json`
        await putObject({
            Bucket: process.env.S3_PAGES_BUCKET,
            ContentType: "application/json",
            Key: jsonKey,
            Body: JSON.stringify(json)
        })
        const jsonUrl = process.env.CLOUDFRONT_PAGES_PREFIX + "/" + jsonKey

        takeScreenshot(contentUrl).then(async (screenshotUrl: string) => {
            const response = await fetch(screenshotUrl)

            if (!response.ok) {
                throw new Error(`Failed to fetch ${screenshotUrl}: ${response.statusText}`)
            }

            const arrayBuffer = await response.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            const screenshotKey = `${page._id}_${randomUUID()}.png`
            await putObject({
                Bucket: process.env.S3_PAGES_BUCKET,
                ContentType: "image/png",
                Key: screenshotKey,
                Body: buffer
            })
            const thumbnailUrl = process.env.CLOUDFRONT_PAGES_PREFIX + "/" + screenshotKey

            page.thumbnailUrl = thumbnailUrl
            await page.save()
        })

        const oldVersion = {
            contentUrl: page.contentUrl,
            thumbnailUrl: page.thumbnailUrl,
            jsonUrl: page.jsonUrl,
            extraHead: page.extraHead,
            extraBody: page.extraBody,
            updatedAt: page.updatedAt
        }

        page.extraHead = req.body.extraHead
        page.extraBody = req.body.extraBody
        page.contentUrl = contentUrl
        page.jsonUrl = jsonUrl

        // save up to 30 previous revisions
        if (page.versions) {
            page.versions.unshift(oldVersion)
        } else {
            page.versions = [oldVersion]
        }
        if (page.versions.length > 30) {
            page.versions.pop()
        }

        await page.save()

        res.status(200).json()
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}


export const restorePageVersion = async (req: IExtendedRequest, res: Response) => {
    try {
        const page = await PageModel.findOne({
            _id: req.params.id,
            user: req.user.id
        }).exec()

        if (!page) {
            return res.status(404).json({ error: "Page not found" })
        }

        const version = page.versions?.find(v => v._id.toString() === req.body.versionId)
        if (!version) {
            return res.status(404).json({ error: "Version not found" })
        }

        const oldVersion = {
            contentUrl: page.contentUrl,
            thumbnailUrl: page.thumbnailUrl,
            jsonUrl: page.jsonUrl,
            extraHead: page.extraHead,
            extraBody: page.extraBody,
            updatedAt: page.updatedAt
        }

        page.extraHead = version.extraHead
        page.extraBody = version.extraBody
        page.contentUrl = version.contentUrl
        page.jsonUrl = version.jsonUrl
        page.thumbnailUrl = version.thumbnailUrl

        // save up to 30 previous revisions
        if (page.versions) {
            page.versions.unshift(oldVersion)
        } else {
            page.versions = [oldVersion]
        }
        if (page.versions.length > 30) {
            page.versions.pop()
        }

        await page.save()

        res.status(200).json()
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}


export const updatePageSettings = async (req: IExtendedRequest, res: Response) => {
    try {
        const page = await PageModel.findOne({
            _id: req.params.id,
            user: req.user.id
        }).exec()

        if (!page) {
            return res.status(404).json({ error: "Page not found" })
        }

        const funnel = await FunnelModel.findOne({ _id: page.funnel, user: req.user.id }).lean().exec()
        if (!funnel) {
            throw new Error("Invalid funnel")
        }

        const existingPages = await PageModel.find({ funnel: funnel._id, _id: { $ne: req.params.id } }).lean().exec()
        if (existingPages.find(p => p.path === (req.body.path || ""))) {
            throw new Error("Page with same path already exists for this funnel")
        }

        const listName = funnel.title + " - " + page.title

        page.title = req.body.title
        page.path = req.body.path
        await page.save()

        // Update list name if exist
        const contactList = await ListModel.findOne({
            title: listName,
        })

        if (contactList) {
            contactList.title = funnel.title + " - " + page.title
            await contactList.save()
        }

        res.status(200).json()
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getFunnelPages = async (req: IExtendedRequest, res: Response) => {
    try {
        const pages = await PageModel.find({
            funnel: req.params.funnelId
        }, null, { sort: { funnelStep: 1 } })
        res.status(200).json(pages)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const deletePage = async (req: IExtendedRequest, res: Response) => {
    try {
        const funnel = await FunnelModel.findOne({ _id: req.body.funnelId, user: req.user.id })
        if (!funnel) {
            throw new Error("Invalid funnel")
        }

        // reorder funnelStep & update numSteps
        let pages = await PageModel.find({
            funnel: req.body.funnelId,
            user: req.user.id
        }, null, { sort: { funnelStep: 1 } }).exec()

        await PageModel.deleteOne({ _id: req.params.id, user: req.user.id }).exec()

        pages = pages.filter(p => p._id.toString() != req.params.id)

        funnel.numSteps = pages.length
        await funnel.save()

        let index = 1
        for (const page of pages) {
            page.funnelStep = index
            await page.save()
            index++
        }

        res.status(200).json()
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const startCreatePageRequest = async (req: IExtendedRequest, res: Response): Promise<void> => {
    try {
        const templateContentUrl = req.body.templateContentUrl
        if (!templateContentUrl) {
            res.status(400).send("Missing input.")
            return
        }

        const token = `pending-request:${uuidv4()}`
        await setRedis(token, JSON.stringify({
            status: "processing",
            input: req.body
        }))

        processCrawlUrl(token, req.body, req.user.id).catch((err) => {
            console.error(err)
            setRedis(token, JSON.stringify({
                status: "error",
                error: err.message,
                input: req.body
            }))
        })

        res.json({ token })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const endCreatePageRequest = async (
    req: IExtendedRequest,
    res: Response
): Promise<void> => {
    const token = req.params.token
    const request = JSON.parse(await getRedis(token))

    if (!request) {
        res.status(404).send("Request not found.")
        return
    }

    if (request.status === "completed") {
        res.json({
            response: "created successfully"
        })

        await deleteRedis(token)
    } else if (request.status === "error") {
        res.status(500).json({ error: request.error })
        await deleteRedis(token)
    } else {
        res.status(202).json({ status: "Still processing" })
    }
}

export const queryCreatePageRequest = async (req: Request, res: Response) => {
    const token = req.params.token
    const request = JSON.parse(await getRedis(token))

    if (!request) {
        res.status(404).send("Request not found.")
        return
    }

    res.json({
        status: request.status,
        error: request.error
    })
}

export const uploadFile = async (req: IExtendedRequest, res: Response) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.")
    }

    const pageId = req.header("pageId")

    if (!pageId) {
        return res.status(404).json({ error: "Page not found" })
    }

    const page = await PageModel.findOne({
        _id: pageId,
        user: req.user.id
    }).exec()

    if (!page) {
        return res.status(404).json({ error: "Page not found" })
    }

    try {
        const fileContent = fs.readFileSync(req.file.path)
        const fileKey = `${pageId}_${randomUUID()}_${req.file.originalname}`
        await putObject({
            Bucket: process.env.S3_UPLOADS_BUCKET,
            Key: fileKey,
            Body: fileContent,
            ContentType: req.file.mimetype
        })

        res.send({
            src: process.env.CLOUDFRONT_UPLOADS_PREFIX + `/${fileKey}`
        })
    } catch (error) {
        console.error("Error uploading file:", error)
        res.status(500).send("Error uploading file")
    } finally {
        fs.unlinkSync(req.file.path) // Delete the file from local storage
    }
}

export const addProduct = async (req: IExtendedRequest, res: Response) => {
    try {
        const { pageId, accountId } = req.query
        const { productIds } = req.body

        // Validate productIds
        if (!Array.isArray(productIds) || !productIds.every(item =>
            typeof item === "object" &&
            typeof item.productId === "string" &&
            typeof item.type === "string" &&
            typeof item.priceId === "string")) {
            return res.status(400).json({ error: "Invalid productIds format" })
        }

        const page = await PageModel.findOne({ _id: pageId })
        if (!page) {
            return res.status(404).json({ error: "Page not found" })
        }

        const productsToAdd = productIds
            .filter(item => !page.products.some(p =>
                p.type === item.type &&
                p.productId === item.productId &&
                p.accountId === accountId &&
                p.priceId === item.priceId))
            .map(({ productId, priceId, type }) => ({ productId, accountId, priceId, type }))

        if (productsToAdd.length === 0) {
            return res.status(400).json({ error: "Products already added" })
        }

        const updateResult = await PageModel.updateOne(
            { _id: pageId },
            { $addToSet: { products: { $each: productsToAdd } } },
            { new: true }
        )

        return res.send({ message: "Products added successfully", updateResult })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Internal server error" })
    }
}

export const getProducts = async (req: IExtendedRequest, res: Response) => {
    try {
        const result = []

        let page: IPage | null = null
        if (req.query.pageId) {
            page = await PageModel.findOne({ _id: req.query.pageId }).lean().exec()
        } else if (req.query.url) {
            const funnelAndPage = await getFunnelAndPageFromUrl(req.query.url as string)
            page = funnelAndPage.page
        }

        if (!page || !page.products) {
            return res.send({ message: "GET", result: [] })
        }

        for (const item of page.products) {
            const { accountId, priceId } = item
            const account = await IntegrationModel.findOne({ "data.accountId": accountId })
            if (!account) {
                return res.status(404).json({ error: "Account not found" })
            }
            const accountStripe = new Stripe(account?.data?.accessToken)
            const productPriceData = await accountStripe.prices.list({
                expand: ["data.product"]
            })
            for (const item of productPriceData.data) {
                if (priceId === item.id) {
                    const extendedPrice: ExtendedPrice = { ...item, accountId }
                    result.push(extendedPrice)
                }
            }
        }
        return res.send({ message: "GET", result })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: `Internal server error : ${error}` })
    }
}

export const deleteProduct = async (req: IExtendedRequest, res: Response) => {
    try {
        const { id: pageId } = req.params
        const { priceId } = req.query

        const page = await PageModel.findOne({ _id: pageId })

        if (!page) {
            res.status(400).json({ error: "Page not found" })
        }

        const productExists = page.products.some(p => p.priceId.toString() === priceId)
        if (!productExists) {
            return res.status(404).json({ error: "Product not found in page" })
        }

        page.products = page.products.filter(p => p.priceId.toString() !== priceId)
        const updatedPage = await page.save()

        return res.send({ message: "Product deleted successfully", updatedPage })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Internal server error" })
    }
}


export const proxyWebhook = async (req: IExtendedRequest, res: Response) => {
    try {
        const url = req.body.url
        const hook = req.body.hook
        const payload = req.body.payload

        const { funnel, page, path } = await getFunnelAndPageFromUrl(url)

        // if (!funnel || path === null) {
        //     throw new Error("Invalid funnel or path")
        // }

        // if (!page) {
        //     throw new Error("Invalid page")
        // }

        sendWebhook({
            url: hook,
            payload,
            funnel,
            page
        })

        return res.status(200).json({ success: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Server error" })
    }
}