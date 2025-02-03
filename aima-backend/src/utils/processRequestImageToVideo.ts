import { v2 as cloudinary } from "cloudinary"
import Replicate from "replicate"

import { ImageToVideoInput } from "../types/query"
import { RateLimitModel } from "../models/RateLimit"
import { upsertVideoCreation } from "../services/videoCreation.service"
import { countVideosCreatedLastWeek } from "../services/videoCreation.service"
import { getUserById } from "../services/user.service"
import { setRedis } from "../services/redis.service"

export const processImageToVideoRequest = async (
    input: ImageToVideoInput,
    token: string,
    userId: string
): Promise<void> => {
    try {
        const response = await fetchImageToVideo(input, userId)
        await setRedis(token, JSON.stringify({
            status: "completed",
            progress: 100,
            response,
            input
        }))
    } catch (error) {
        console.error(error)
        await setRedis(token, JSON.stringify({
            status: "error",
            progress: 100,
            error: error.message,
            input
        }))
    }
}

const retryWithExponentialBackoff = async <T>(
    fn: () => Promise<T>,
    maxAttempts = 3,
    initialDelay = 500
): Promise<T> => {
    let attempts = 0
    let delay = initialDelay

    while (attempts < maxAttempts) {
        try {
            return await fn()
        } catch (error) {
            attempts++
            if (attempts >= maxAttempts) throw error
            await new Promise((resolve) => setTimeout(resolve, delay))
            delay *= 2 // double the delay for the next attempt
        }
    }

    throw new Error("All attempts failed")
}

async function updateTokensUsed(userId: string) {
    const rateLimitData = await RateLimitModel.findOne({ userId: userId })

    if (!rateLimitData) {
        const newRateLimitData = new RateLimitModel({
            userId: userId,
            totalTokensUsed: 10000,
            lastTimeTotalTokensUsage: new Date()
        })
        await newRateLimitData.save()
    } else {
        rateLimitData.totalTokensUsed += 10000

        rateLimitData.lastTimeTotalTokensUsage = new Date()

        await rateLimitData.save()
    }
}

const fetchImageToVideo = async (
    input: ImageToVideoInput,
    userId: string
): Promise<any> => {
    const roles = (await getUserById(userId)).roles

    if (roles.includes("admin")) {
        console.log("Admin user, no rate limiting")
    } else {
        const rateLimitData = {
            weeklyLimit: 50,
            message:
                "Video generations are temporarily limited. Please try again later."
        }

        if (roles.includes("lite")) {
            rateLimitData.weeklyLimit = 10
            rateLimitData.message =
                "Video generations are temporarily limited. Please try again later, or upgrade from the Lite plan to increase your limit. Contact support@deal.ai for more information."
        }

        if (roles.includes("3dayfreetrial")) {
            rateLimitData.weeklyLimit = 5
            rateLimitData.message =
                "Video generations are temporarily limited. After your free trial, this will be increased."
        }

        const imagesGenerated = await countVideosCreatedLastWeek(userId)
        const remainingGenerations = rateLimitData.weeklyLimit - imagesGenerated

        if (remainingGenerations <= 0) {
            console.log(
                `User ${userId} has exceeded their image2video generations of ${rateLimitData.weeklyLimit}.`
            )
            throw new Error(rateLimitData.message)
        } else {
            console.log(
                `User ${userId} has ${remainingGenerations} image2video generations remaining this week.`
            )
        }
    }

    if (
        !input.url.startsWith(
            "https://res.cloudinary.com/dlfly2wh4/image/upload/"
        )
    ) {
        throw new Error(
            "You can only create videos from images created by deal.ai"
        )
    }

    const fetchCompletion = async () => {
        const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN
        })

        const response: any = await replicate.run(
            "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
            {
                input: {
                    cond_aug: parseFloat((Math.random() * 1.0).toFixed(2)),
                    decoding_t: 7,
                    input_image: input.url.replace("/upload/c_fill,w_1920,h_1080,ar_16:9,g_auto/", "/upload/"),
                    video_length: "25_frames_with_svd_xt",
                    sizing_strategy: "crop_to_16_9",
                    motion_bucket_id: Math.floor(Math.random() * (255 - 127 + 1)) + 127,
                    frames_per_second: 12
                }
            }
        )

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        })

        const cStatus = await cloudinary.uploader.upload(response, {
            folder: `videos/${userId}`,
            resource_type: "video"
        })

        console.log(cStatus)

        await updateTokensUsed(userId)
        await upsertVideoCreation(userId)

        return JSON.stringify({
            url: cStatus.secure_url
        })
    }

    return await retryWithExponentialBackoff(fetchCompletion)
}
