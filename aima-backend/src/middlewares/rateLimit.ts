import { RateLimiterMongo, RateLimiterRedis } from "rate-limiter-flexible"
import mongoose from "mongoose"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { Response, NextFunction } from "express"
import dotenv from "dotenv"
import { RateLimitModel } from "../models/RateLimit"
import { Redis } from "ioredis"
dotenv.config()

const buyerFreeLimiter = new RateLimiterMongo({
    storeClient: mongoose.connection,
    keyPrefix: "ratelimit",
    points: process.env.FREE_REQUESTS_POINTS
        ? Number(process.env.FREE_REQUESTS_POINTS)
        : 100, // Number of points
    duration: process.env.FREE_REQUESTS_DURATION
        ? Number(process.env.FREE_REQUESTS_DURATION)
        : 86400 // Per day in seconds
})

export const rateLimitBuyerFreeRole = (
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    if (req.roles && req.roles.includes("buyerfree")) {
        const userId = req.user.id
        if (userId) {
            buyerFreeLimiter
                .get(userId.toString())
                .then((rateLimiterRes) => {
                    if (!rateLimiterRes) {
                        return buyerFreeLimiter.set(userId.toString(), 1, 3600)
                    }
                    return rateLimiterRes
                })
                .then(() => buyerFreeLimiter.consume(userId.toString()))
                .then((rateLimiterRes) => {
                    next()

                    RateLimitModel.findOneAndUpdate(
                        { userId },
                        {
                            currentUsage: rateLimiterRes.consumedPoints,
                            remaining: rateLimiterRes.remainingPoints,
                            lastUsageDate: new Date()
                        },
                        { upsert: true, new: true }
                    ).exec()
                })
                .catch((err) => {
                    res.status(429).json({
                        msg: "Rate limit exceeded, please upgrade your account."
                    })

                    RateLimitModel.findOne({ userId })
                        .then((rateLimitRecord) => {
                            const durationInSeconds = process.env
                                .FREE_REQUESTS_DURATION
                                ? Number(process.env.FREE_REQUESTS_DURATION)
                                : 86400

                            const timeSinceLastExceeded =
                                (Date.now() -
                                    new Date(
                                        rateLimitRecord.lastExceeded
                                    ).getTime()) /
                                1000

                            // Check whether rate limit record exists, or if lastExceeded is outside the duration
                            if (
                                !rateLimitRecord ||
                                !rateLimitRecord.lastExceeded ||
                                timeSinceLastExceeded > durationInSeconds
                            ) {
                                // Increment exceededCount and update lastExceeded only if not already incremented within duration
                                return RateLimitModel.findOneAndUpdate(
                                    { userId },
                                    {
                                        $inc: { exceededCount: 1 },
                                        lastExceeded: new Date()
                                    },
                                    { upsert: true, new: true }
                                ).exec()
                            }
                        })
                        .catch((err) => {
                            console.error(err)
                        })
                })
        }
    } else {
        next()
    }
}

const redisClient = new Redis(process.env.REDIS_URI)
// For Shopify
const publicApiRateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    points: 2000, // 2000 requests
    duration: 60, // per 60 seconds
    keyPrefix: "publicApi-ratelimit"
})

export const publicApiRateLimit = (points = 1) => {
    return (req: IExtendedRequest, res: Response, next: NextFunction) => {
        const userId = req.user.id

        publicApiRateLimiter
            .consume(userId, points)
            .then((rateLimiterRes) => {
                res.setHeader("X-RateLimit-Limit", "2000")
                res.setHeader(
                    "X-RateLimit-Remaining",
                    rateLimiterRes.remainingPoints.toString()
                )

                const resetTime = new Date(
                    Date.now() + rateLimiterRes.msBeforeNext
                ).toUTCString()
                res.setHeader("X-RateLimit-Reset", resetTime)

                next()
            })
            .catch((rateLimiterRes) => {
                const resetTimeString = new Date(
                    Date.now() + rateLimiterRes.msBeforeNext
                ).toUTCString()
                res.setHeader(
                    "Retry-After",
                    (rateLimiterRes.msBeforeNext / 1000).toString()
                )
                res.setHeader("X-RateLimit-Limit", "2000")
                res.setHeader(
                    "X-RateLimit-Remaining",
                    rateLimiterRes.remainingPoints.toString()
                )
                res.setHeader("X-RateLimit-Reset", resetTimeString)

                res.status(429).send("Too Many Requests")
            })
    }
}
