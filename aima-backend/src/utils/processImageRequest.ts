import OpenAI from "openai"
import { RateLimitModel } from "../models/RateLimit"
import { v2 as cloudinary } from "cloudinary"
import { setRedis } from "../services/redis.service"
import { chooseOpenAiKey } from "./chooseOpenAiKey"

interface ImageProcessingRequest {
    base64Image: string
    format: string
}

export const processImageRequest = async (
    file: Express.Multer.File,
    token: string,
    userId: string
): Promise<void> => {
    const base64Image = file.buffer.toString("base64")
    const format = file.mimetype
    const imageRequest: ImageProcessingRequest = { base64Image, format }

    try {
        const parsedContent = await fetchImageDescription(imageRequest, userId)

        if (parsedContent) {
            await setRedis(
                token,
                JSON.stringify({
                    status: "completed",
                    progress: 100,
                    response: JSON.stringify(parsedContent)
                })
            )
        }
    } catch (error) {
        console.error(error)
        await setRedis(
            token,
            JSON.stringify({
                status: "error",
                progress: 100,
                error: error.message
            })
        )
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
async function updateTokensUsed(userId: string, tokens: number) {
    const rateLimitData = await RateLimitModel.findOne({ userId: userId })

    if (!rateLimitData) {
        const newRateLimitData = new RateLimitModel({
            userId: userId,
            totalTokensUsed: tokens,
            lastTimeTotalTokensUsage: new Date()
        })
        await newRateLimitData.save()
    } else {
        rateLimitData.totalTokensUsed += tokens

        rateLimitData.lastTimeTotalTokensUsage = new Date()

        await rateLimitData.save()
    }
}

const fetchImageDescription = async (
    imageRequest: ImageProcessingRequest,
    userId: string
): Promise<any> => {
    let cStatus: any
    const openai = new OpenAI({
        apiKey: chooseOpenAiKey()
    })

    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        })

        cStatus = await cloudinary.uploader.upload(
            `data:${imageRequest.format};base64,${imageRequest.base64Image}`,
            { folder: `vision/${userId}` }
        )
    } catch (e) {
        console.log("Error uploading vision to cloudinary", e)
    }

    const fetchCompletion = async () => {
        const response = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Describe what you see in this image in detail. Be sure to output any text you read in the image."
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${imageRequest.format};base64,${imageRequest.base64Image}`,
                                detail: "high"
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1024
        })

        if (response.usage && response.usage.total_tokens) {
            await updateTokensUsed(userId, response.usage.total_tokens)
        }
        return {
            response: response.choices[0].message.content,
            imgUrl: cStatus.secure_url
        }
    }

    return await retryWithExponentialBackoff(fetchCompletion)
}
