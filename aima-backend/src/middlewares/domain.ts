/* eslint-disable indent */
import { Response, NextFunction } from "express"
import { IExtendedRequest } from "../types/IExtendedRequest"
import DomainModel from "../models/domain"
import BlogModel from "../models/Blog"

export const checkDomain = async (
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    let domain = req.query.domain as string

    if (!domain) {
        return next()
    }

    domain = domain.toLowerCase()

    if (domain === process.env.BLOG_APP_DOMAIN) {
        return res.json()
    }

    if (domain.endsWith(process.env.BLOG_APP_DOMAIN)) {
        const domainTokens = domain.split(".")
        if (domainTokens.length === 3) {
            const blog = await BlogModel.findOne({ subdomain: domainTokens[0] }).lean().exec()
            if (blog) {
                return res.json()
            }
        }
    }

    const existingDomain = await DomainModel.findOne({ domain }).lean().exec()
    if (!existingDomain) {
        return res.status(404).json({ error: "Domain not found" })
    }

    return res.json()
}
