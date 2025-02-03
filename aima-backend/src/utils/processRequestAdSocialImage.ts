/* eslint-disable indent */
import { AdSocialImageInput } from "../types/query"
import { RateLimitModel } from "../models/RateLimit"
import OpenAI from "openai"
import { v2 as cloudinary } from "cloudinary"
import { ImageGenerateParams } from "openai/resources"
import { upsertImageCreation } from "../services/imageCreation.service"
import { countImagesCreatedLastWeek } from "../services/imageCreation.service"
import { getUserById } from "../services/user.service"
import { moderate } from "./moderation"
import { setRedis } from "../services/redis.service"
import { chooseOpenAiKey } from "./chooseOpenAiKey"

function generateAdSocialImagePrompt(input: AdSocialImageInput): string {
    const getIntendedUse = (): string => {
        if (input.aspectRatio.includes("Portrait")) {
            return "An advertising image suitable for Facebook, Instagram (stories / reels), and other social media platforms [these are just examples, do not reference the platforms in the image]"
        }

        if (input.aspectRatio.includes("Landscape")) {
            return "An advertising image suitable for platforms like YouTube cover images [these are just examples, do not reference the platforms in the image]"
        }

        if (input.aspectRatio.includes("Square")) {
            return "An advertising image suitable for platforms like Instagram (feed) [these are just examples, do not reference the platforms in the image]"
        }

        return "An advertising image suitable for Facebook, Instagram (stories / reels), and other social media platforms [these are just examples, do not reference the platforms in the image]"
    }

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
      Create ${getIntendedUse()} for :::DESCRIPTION:::

      Instructions: 

      ${
          getImpactValue("Vivid Colors and Contrasts")
              ? "Vivid Colors and Contrasts: Bold, contrasting colors attract attention and make subjects stand out against their background."
              : ""
      }
      ${
          getImpactValue("Focus on Composition")
              ? "Focus on Composition: Use composition techniques like the rule of thirds and leading lines to highlight the image's main elements."
              : ""
      }
      ${
          getImpactValue("Incorporate Movement or Action")
              ? "Incorporate Movement or Action: Suggest motion in images for greater engagement, using dynamic poses or lines."
              : ""
      }
      ${
          getImpactValue("Clarity and Simplicity")
              ? "Clarity and Simplicity: Opt for a clear, simple design with a focused message, avoiding too many elements."
              : ""
      }
      ${
          getImpactValue("Use of Scale and Perspective")
              ? "Use of Scale and Perspective: Utilize unusual scales or perspectives to create intriguing and memorable images."
              : ""
      }
      ${
          getImpactValue("Emotional Appeal")
              ? "Emotional Appeal: Choose imagery that evokes emotions like happiness or surprise to connect with viewers."
              : ""
      }
      ${
          getImpactValue("Innovative or Unexpected Elements")
              ? "Innovative or Unexpected Elements: Make images stand out with surprising elements or unique visual twists."
              : ""
      }
      ${
          getImpactValue("Use Negative Space")
              ? "Use Negative Space: Employ negative space to enhance visual impact and composition balance."
              : ""
      }
      ${
          getImpactValue("Texture and Patterns")
              ? "Texture and Patterns: Add depth to images with subtle or prominent textures and patterns."
              : ""
      }
      ${
          getImpactValue("Psychological Triggers")
              ? "Psychological Triggers: Use colors and shapes that evoke specific psychological responses, like excitement or unity."
              : ""
      }
      ${
          getImpactValue("Sensory Appeal")
              ? "Sensory Appeal: Create images that appeal to multiple senses, suggesting texture, taste, or sound."
              : ""
      }

      Further Instructions:
      
      1) Do not show anything around the advertising image (e.g. mockup of how it would appear on a website, a laptop, a designer drawing the image, etc.)
      2) YOU MUST NOT ADD TEXT! The image will be rejected if it contains text.
      3) The type of the image should be ${input.imageType} ${
        input.imageType && input.imageType == "Photograph"
            ? "Award-Winning, photo, photograph, raw photo, analog photo, 4k"
            : ""
    }.
      4) The style of the image should be ${input.imageStyle}.
      5) The target audience of the image is ${input.targetAudience}.
      ${
          input.colours
              ? "6) The preferred color palette for the image is " +
                input.colours
              : ""
      }.
      Also, ${input.instructions}

      ${getIsolation()}

      REMEMBER - IMPORTANT: Include in the output prompt:
      1) Do not show anything around the advertising image (e.g. mockup of how it would appear on a website, a laptop, a designer drawing the image, etc.)
      2) YOU MUST NOT ADD TEXT! The image will be rejected if it contains text.
      3) The customer is NOT woke. Produce image accordingly.
    `

    const remainingChars = 3900 - templatedPrompt.length
    const truncatedBusinessDescription = input.adDescription.substring(
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

export const processAdSocialImageRequest = async (
    input: AdSocialImageInput,
    token: string,
    userId: string
): Promise<void> => {
    try {
        const response = await fetchAdSocialImage(input, userId)
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
        setRedis(
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

export const fetchAdSocialImage = async (
    input: AdSocialImageInput,
    userId: string
): Promise<any> => {
    await moderate(
        `${input.adDescription} ${input.colours} ${input.instructions} ${input.targetAudience}`,
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
            prompt: generateAdSocialImagePrompt(input),
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
                url = url.replace(
                    "/upload/",
                    "/upload/c_fill,w_1080,h_1920,ar_9:16,g_auto/"
                )
                break
            case "1792x1024":
                url = url.replace(
                    "/upload/",
                    "/upload/c_fill,w_1920,h_1080,ar_16:9,g_auto/"
                )
                break
        }

        return JSON.stringify({
            url,
            prompt: response.data[0].revised_prompt
        })
    }

    return await retryWithExponentialBackoff(fetchCompletion)
}
