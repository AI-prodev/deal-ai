import { v2 as cloudinary } from "cloudinary"
import Replicate from "replicate"

import { ProductPlacementInput } from "../types/query"
import { RateLimitModel } from "../models/RateLimit"

import { setRedis } from "../services/redis.service"
import sharp from "sharp"
import { countImagesCreatedLastWeek } from "../services/imageCreation.service"
import { getUserById } from "../services/user.service"

export const processProductPlacementRequest = async (
    input: ProductPlacementInput,
    token: string,
    userId: string
): Promise<void> => {
    try {
        const response = await fetchProductPlacement(input, userId)
        await setRedis(
            token,
            JSON.stringify({
                status: "completed",
                progress: 100,
                response,
                input
            })
        )
    } catch (error) {
        console.error(error)
        await setRedis(
            token,
            JSON.stringify({
                status: "error",
                progress: 100,
                error: error.message,
                input
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

async function updateTokensUsed(userId: string) {
    const rateLimitData = await RateLimitModel.findOne({ userId: userId })

    if (!rateLimitData) {
        const newRateLimitData = new RateLimitModel({
            userId: userId,
            totalTokensUsed: 1000,
            lastTimeTotalTokensUsage: new Date()
        })
        await newRateLimitData.save()
    } else {
        rateLimitData.totalTokensUsed += 1000

        rateLimitData.lastTimeTotalTokensUsage = new Date()

        await rateLimitData.save()
    }
}

const fetchProductPlacement = async (
    input: ProductPlacementInput,
    userId: string
): Promise<any> => {
    const roles = (await getUserById(userId)).roles

    if (roles.includes("admin")) {
        console.log("Admin user, no rate limiting")
    } else {
        const rateLimitData = {
            weeklyLimit: 500,
            message:
                "Image generations are temporarily limited. Please try again later."
        }

        if (roles.includes("lite")) {
            rateLimitData.weeklyLimit = 70
            rateLimitData.message =
                "Image generations are temporarily limited. Please try again later."
        }

        if (roles.includes("3dayfreetrial")) {
            rateLimitData.weeklyLimit = 40
            rateLimitData.message =
                "Image generations are temporarily limited. Please try again later."
        }

        const imagesGenerated = await countImagesCreatedLastWeek(userId)
        const remainingGenerations = rateLimitData.weeklyLimit - imagesGenerated

        if (remainingGenerations <= 0) {
            console.log(
                `User ${userId} has exceeded their product placement generations of ${rateLimitData.weeklyLimit}.`
            )
            throw new Error(rateLimitData.message)
        } else {
            console.log(
                `User ${userId} has ${remainingGenerations} product placement generations remaining this week.`
            )
        }
    }

    if (
        !input.url.startsWith(
            "https://res.cloudinary.com/dlfly2wh4/image/upload/"
        )
    ) {
        throw new Error(
            "You can only create product placements from images uploaded to deal.ai"
        )
    }

    // const fetchCompletion = async () => {
    //     const replicate = new Replicate({
    //         auth: process.env.REPLICATE_API_TOKEN
    //     })

    //     const response: any = await replicate.run(
    //         "logerzhu/ad-inpaint:b1c17d148455c1fda435ababe9ab1e03bc0d917cc3cf4251916f22c45c83c7df",
    //         {
    //             input: {
    //                 pixel: "1024 * 1024",
    //                 scale: 1,
    //                 prompt: input.prompt,
    //                 api_key: chooseOpenAiKey(),
    //                 image_num: 1,
    //                 image_path: input.url,
    //                 manual_seed: -1,
    //                 product_size: "0.5 * width",
    //                 guidance_scale: 7.5,
    //                 negative_prompt:
    //                     "illustration, 3d, sepia, painting, cartoons, sketch, (worst quality:2), low quality, out of frame, watermark",
    //                 num_inference_steps: 20
    //             }
    //         }
    //     )

    //     cloudinary.config({
    //         cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    //         api_key: process.env.CLOUDINARY_API_KEY,
    //         api_secret: process.env.CLOUDINARY_API_SECRET
    //     })

    //     const cStatus = await cloudinary.uploader.upload(response[1], {
    //         folder: `product-placements/${userId}`
    //     })

    //     console.log(cStatus)

    //     await updateTokensUsed(userId)
    //     //await upsertImageCreation(userId)

    //     return JSON.stringify({
    //         url: cStatus.secure_url
    //     })
    // }
    const CLIPDROP_API_TOKEN = process.env.CLIPDROP_API_TOKEN
    const fetchCompletion = async () => {
        const imageResponse = await fetch(input.url)
        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image from URL: ${input.url}`)
        }

        let imageBlob = await imageResponse.blob()

        const buffer = await imageBlob.arrayBuffer()
        let urlImageBuffer = Buffer.from(buffer)

        const image = sharp(urlImageBuffer)
        const metadata = await image.metadata()

        if (metadata.width > 2048 || metadata.height > 2048) {
            urlImageBuffer = await image
                .resize(2048, 2048, { fit: "inside" })
                .toBuffer()

            imageBlob = new Blob([urlImageBuffer], { type: "image/jpeg" })
        }

        const form = new FormData()

        form.append("image_file", imageBlob, "image.jpeg")

        form.append("prompt", input.prompt)

        const response = await fetch(
            "https://clipdrop-api.co/replace-background/v1",
            {
                method: "POST",
                headers: {
                    "x-api-key": CLIPDROP_API_TOKEN
                },
                body: form
            }
        )

        if (!response.ok) {
            console.log(await response.json())
            throw new Error(
                //show error messsage
                `API call failed with status: ${response.status}`
            )
        }

        const arrayBuffer = await response.arrayBuffer()
        const imageBuffer = Buffer.from(arrayBuffer)

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        })

        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: `product-placements/${userId}`
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            )
            stream.end(imageBuffer)
        })

        await updateTokensUsed(userId)

        return JSON.stringify({
            url: (uploadResult as any).secure_url
        })
    }

    return await retryWithExponentialBackoff(fetchCompletion)
}
