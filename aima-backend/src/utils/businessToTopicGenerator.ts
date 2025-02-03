/* eslint-disable quotes */
/* eslint-disable indent */

import { AdditionalInputProperties, MarketingHooksInput } from "../types/query"
import { RateLimitModel } from "../models/RateLimit"
import { moderate } from "./moderation"

function generateEmailSequence(
    input: MarketingHooksInput & AdditionalInputProperties
): string {
    const prompt = `
    Here is a description of my business or product:

    START DESCRIPTION

    ${input.businessDescription}  

    END DESCRIPTION
    
    I would like to use a News API service to find news articles relevant to my business or product. However, searching with the full description would not work, as it's too specific. Please generate a short search string of a few words, which would be suitable as a topic search and relevant to my business.
    
    If there are multiple topics that match my business or product, you can combine them together with the OR operator. The topics should be high-level, so do not mention specific towns or details that would prevent news results from matching.
    
    EXAMPLE:
    
    EXAMPLE INPUT:
    
    The Movement Barn in the Berkshire countryside near Reading offers personalized fitness training. With coaches Harry and Dexter, clients can engage in one-on-one personal training sessions or participate in small group fitness classes capped at 10 people, based on the principles of Build, Breathe & Move. The studio emphasizes individualized support and a tailored approach to help members achieve their health and fitness goals. New clients can start with a free group session to experience the coaching style and training environment.
    
    EXAMPLE OUTPUT: 
    
    ["fitness", "workout", "personal training"]

    Output the topics in ${input.language}.
    
    RESPONSE FORMAT SPECIFICATION:
    
    - You MUST provide output according to the following specification:
    - Output the results in a valid JSON array of strings representing the topics having the most relevance to my business.
    - Only output the articles selected according to the criteria above.
    - Only output the JSON and nothing else (not even the markdown specifier showing it's JSON content i.e. backtick backtick backtick json...)
        Format:
           ["topic in ${input.language}", "topic in ${input.language}", "topic in ${input.language}"...]
    `

    return prompt
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

async function retryWithExponentialBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts: number,
    delay: number,
    factor: number
): Promise<T> {
    let attempts = 0
    while (attempts < maxAttempts) {
        try {
            return await fn()
        } catch (error) {
            attempts++
            if (attempts >= maxAttempts) throw error
            await new Promise((resolve) => setTimeout(resolve, delay))
            delay *= factor
        }
    }
    throw new Error("All attempts failed")
}

export async function fetchChatCompletionBusinessToTopic(
    model: string,
    input: MarketingHooksInput & AdditionalInputProperties,
    userId: string,
    maxAttempts = 2,
    delay = 1000,
    factor = 2
): Promise<any> {
    const messages = [
        {
            role: "user",
            content: generateEmailSequence(input)
        }
    ]
    console.log("input", input)
    console.log("messages", messages)
    const url = "https://api.openai.com/v1/chat/completions"
    const apiKey = process.env.OPENAI_API_KEY || ""
    const timeoutInMilliseconds = 3 * 60 * 1000 // 3 minutes

    const payload = {
        model,
        messages,
        temperature: input.hookCreative / 10
    }

    await moderate(
        `${input.businessDescription} ${input.fear} ${input.goodHooks} ${input.instructions} ${input.priceDriven} ${input.targetAudience} ${input.toneAdditionalInfo} ${input.triggerWords} ${input.urgency}`,
        userId
    )

    const fetchCompletion = async (): Promise<any> => {
        const response = (await Promise.race([
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload)
            }),
            new Promise<Response>((_, reject) =>
                setTimeout(
                    () => reject(new Error("Request timed out")),
                    timeoutInMilliseconds
                )
            )
        ])) as Response

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        if (!data.choices || !data.choices.length || !data.choices[0].message) {
            throw new Error("Unexpected response structure")
        }

        if (data.usage && data.usage.total_tokens) {
            await updateTokensUsed(userId, data.usage.total_tokens)
        }
        let content = data.choices[0].message.content

        return content
    }

    try {
        return await retryWithExponentialBackoff(
            fetchCompletion,
            maxAttempts,
            delay,
            factor
        )
    } catch (error) {
        console.error(`All ${maxAttempts} attempts failed:`, error)

        if (model !== "gpt-4") {
            console.log("Retrying with gpt-4 model.")
            return fetchChatCompletionBusinessToTopic("gpt-4", input, userId, 1)
        } else {
            return null
        }
    }
}
