/* eslint-disable indent */
import { Response, NextFunction } from "express"
import { IExtendedRequest } from "../types/IExtendedRequest"
import DomainModel from "../models/domain"

const sharedBlogDomain = (process.env.BLOG_APP_DOMAIN || "").toLowerCase()

function splitDomain(domain: string) {
    const port = process.env.PORT || "3000"
    if (domain.includes(`.localhost:${port}`)) {
        const hostname = domain.replace(`.localhost:${port}`, "")
        return {
            subdomain: hostname,
            mainDomain: `localhost:${port}`
        }
    }
    if (domain.includes(`localhost:${port}`)) {
        return {
            subdomain: "",
            mainDomain: `localhost:${port}`
        }
    }

    const parts = domain.replace("www.", "").split(".")
    const subdomain = parts.slice(0, parts.length - 2).join(".")
    const mainDomain = parts.slice(parts.length - 2).join(".")
    return { subdomain, mainDomain }
}

export const domainRequest = async (
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    let host = req.headers["x-forwarded-host"] || req.headers["host"]
    if (!host) {
        return next()
    }
    host = (host as string).toLowerCase()

    const existingDomain = await DomainModel.findOne({ domain: host })
        .lean()
        .exec()

    if (existingDomain) {
        req.domain = existingDomain
        return next()
    }

    const { subdomain, mainDomain } = splitDomain(host)

    req.customSubdomain = subdomain

    if (mainDomain === sharedBlogDomain) {
        req.sharedBlogDomain = true
    }
    next()
}
