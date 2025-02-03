import OpenAI from "openai"
import { v2 as cloudinary } from "cloudinary"
import { ImageGenerateParams } from "openai/resources"

import { upsertImageCreation } from "../services/imageCreation.service"
import { countImagesCreatedLastWeek } from "../services/imageCreation.service"
import { getUserById } from "../services/user.service"
import { setRedis } from "../services/redis.service"
import { HeroInput } from "../types/query"
import { RateLimitModel } from "../models/RateLimit"
import { moderate } from "./moderation"
import { chooseOpenAiKey } from "./chooseOpenAiKey"

function generateHeroPrompt(input: HeroInput): string {
    const impacts = input.impacts.reduce((acc, impact) => {
        return { ...acc, ...impact }
    }, {})

    function getImpactValue(key: string): boolean {
        return impacts[key] ?? false
    }

    function getIsolation(): string {
        if (!input.isolation || input.isolation === "None") {
            return ""
        }

        if (input.isolation === "Color") {
            return "Artistic direction: The subject of the image should be isolated against a solid color background - choose the most appropriate color to match the aesthetic."
        }

        return `Artistic direction: The subject of the image should be isolated against a solid ${input.isolation} background`
    }

    const templatedPrompt = `
      Create an image for the landing page of the product or business described below.

      <START BUSINESS OR PRODUCT DESCRIPTION>
      :::DESCRIPTION:::
      <END BUSINESS OR PRODUCT DESCRIPTION>

      Use the following levers to evoke the following emotion(s) with this image: ${input.emotions}

      ${getImpactValue("Color Palette")
        ? "Warm colors evoke warmth and excitement; cool colors, calm or sadness."
        : ""}
      ${getImpactValue("Lighting")
        ? "Bright lighting creates cheerfulness; dim lighting, mystery or sadness."
        : ""}
      ${getImpactValue("Composition")
        ? "Balanced compositions convey stability; asymmetrical ones, tension or excitement."
        : ""}
      ${getImpactValue("Perspective and Angle")
        ? "Low angles show power or inspiration; high angles, vulnerability."
        : ""}
      ${getImpactValue("Facial Expressions and Body Language")
        ? "Expressions and poses in images express a range of emotions."
        : ""}
      ${getImpactValue("Textures and Patterns")
        ? "Rough textures imply hardship; smooth ones, comfort or elegance."
        : ""}
      ${getImpactValue("Symbolism")
        ? "Symbolic elements add meaning, like doves for peace or stormy seas for turmoil."
        : ""}
      ${getImpactValue("Contrast and Saturation")
        ? "High contrast for drama; low contrast for softness. Saturated colors are lively."
        : ""}
      ${getImpactValue("Context and Setting")
        ? "The setting influences emotions, from energetic cityscapes to peaceful landscapes."
        : ""}
      ${getImpactValue("Narrative Elements")
        ? "Storytelling in images engages viewers emotionally and intellectually."
        : ""}

      ${getIsolation()}
      
      REMEMBER - IMPORTANT: Include in the output prompt:
      1) Do not show anything around the image (e.g. mockup of how it would appear on a website, a laptop, a designer drawing the image, etc.)
      2) YOU MUST NOT ADD TEXT! The image will be rejected if it contains text.
      3) The type of the image should be ${input.imageType} ${input.imageType && input.imageType == "Photograph"
    ? "Award-Winning, photo, photograph, raw photo, analog photo, 4k"
    : ""}.
      4) The style of the image should be ${input.imageStyle}.
      5) The target audience of the image is ${input.targetAudience}.
      ${input.colours
        ? "6) The preferred color palette for the image is " +
        input.colours
        : ""}.

      Remember, you're evoking the following emotions in the viewers of this image by applying the above levers: ${input.emotions}.

      The image must also relate to the product or business described at the beginning of this prompt.
    `

    const remainingChars = 3900 - templatedPrompt.length
    const truncatedBusinessDescription = input.heroDescription.substring(
        0,
        remainingChars
    )

    const prompt = templatedPrompt.replace(
        ":::DESCRIPTION:::",
        truncatedBusinessDescription
    )

    console.log(prompt)

    return prompt
}

export const processHeroRequest = async (
    input: HeroInput,
    token: string,
    userId: string
): Promise<void> => {
    try {
        const response = await fetchHero(input, userId)
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
            totalTokensUsed: 7500,
            lastTimeTotalTokensUsage: new Date()
        })
        await newRateLimitData.save()
    } else {
        rateLimitData.totalTokensUsed += 7500

        rateLimitData.lastTimeTotalTokensUsage = new Date()

        await rateLimitData.save()
    }
}

const fetchHero = async (input: HeroInput, userId: string): Promise<any> => {
    await moderate(
        `${input.heroDescription} ${input.colours} ${input.instructions} ${input.targetAudience}`,
        userId
    )

    const user = await getUserById(userId)
    const roles = user.roles

    if (roles.includes("admin")) {
        console.log("Admin user, no rate limiting")
    } else {
        const rateLimitData = {
            weeklyLimit: 300,
            message:
                "Image generations are temporarily limited. Please try again later."
        }

        if (roles.includes("lite")) {
            rateLimitData.weeklyLimit = 50
            rateLimitData.message =
                "Image generations are temporarily limited. Please try again later, or upgrade from the Lite plan to increase your limit. Contact support@deal.ai for more information."
        }

        if (roles.includes("3dayfreetrial")) {
            rateLimitData.weeklyLimit = 20
            rateLimitData.message =
                "Image generations are temporarily limited. After your free trial, this will be increased."
        }

        if (user.email && user.email.toLowerCase().includes("@deal.ai")) {
            console.log("Deal AI user, expanded rate limit to 1000: ", user.email)
            rateLimitData.weeklyLimit = 1000
            rateLimitData.message =
                "Image generations are temporarily limited."
        }

        const imagesGenerated = await countImagesCreatedLastWeek(userId)
        const remainingGenerations = rateLimitData.weeklyLimit - imagesGenerated

        if (remainingGenerations <= 0) {
            console.log(
                `User ${user.email} has exceeded their image generations of ${rateLimitData.weeklyLimit}.`
            )
            throw new Error(rateLimitData.message)
        } else {
            console.log(
                `User ${user.email} has ${remainingGenerations} image generations remaining this week.`
            )
        }
    }

    const openai = new OpenAI({
        apiKey: chooseOpenAiKey()
    })

    const getAspectRatio = (): ImageGenerateParams["size"] => {
        if (input.aspectRatio.includes("Portrait")) {
            return "1024x1792"
        }

        if (input.aspectRatio.includes("Landscape")) {
            return "1792x1024"
        }

        if (input.aspectRatio.includes("Square")) {
            return "1024x1024"
        }

        return "1792x1024"
    }

    const aspectRatio = getAspectRatio()

    const fetchCompletion = async () => {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: generateHeroPrompt(input),
            n: 1,
            size: aspectRatio,
            quality: "hd"
        })

        console.log(response)

        const imageUrl = response.data[0].url

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        })

        const cStatus = await cloudinary.uploader.upload(imageUrl, {
            folder: userId
        })

        console.log(cStatus)

        await updateTokensUsed(userId)
        await upsertImageCreation(userId)

        let url = cStatus.secure_url

        switch (aspectRatio) {
            case "1024x1792":
                url = url.replace("/upload/", "/upload/c_fill,w_1080,h_1920,ar_9:16,g_auto/")
                break
            case "1792x1024":
                url = url.replace("/upload/", "/upload/c_fill,w_1920,h_1080,ar_16:9,g_auto/")
                break
        }

        return JSON.stringify({
            url,
            prompt: response.data[0].revised_prompt
        })
    }

    return await retryWithExponentialBackoff(fetchCompletion)
}
