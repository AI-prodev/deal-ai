/* eslint-disable quotes */
/* eslint-disable indent */

import { AdditionalInputProperties, MarketingHooksInput } from "../types/query"
import { RateLimitModel } from "../models/RateLimit"
import { moderate } from "./moderation"

function generateEmailSequence(
    input: MarketingHooksInput & AdditionalInputProperties,
    articles: string
): string {
    const prompt = `
    I have a set of news headlines, with varying relevance to my business.

    Here is a description of my business or product:

    <START DESCRIPTION OF MY BUSINESS OR PRODUCT / SERVICE>
    ${input.businessDescription}
    <END DESCRIPTION OF MY BUSINESS OR PRODUCT / SERVICE>

    The headlines will be provided to you as an index number, followed by the headline.
            
    These are the criteria for picking relevant headlines:
    1. Ignore headlines that do not have any or much relevance to my business or product.
    2. Pick the headlines you feel my audience would be most interested in.
    3. Ignore headlines that seem like clickbait, or which are promotional.
    4. Ignore headlines that promote or reference other companies.

    <START HEADLINES>
    ${articles}
    <END HEADLINES>

    Reminder of instructions:

    I want to send an email broadcast to my readers bringing them up to date on this topic.
    
    These are the criteria for picking relevant headlines:
    1. Ignore headlines that do not have any or much relevance to my business or product.
    2. Pick the headlines you feel my audience would be most interested in.
    3. Ignore headlines that seem like clickbait, or which are promotional.
    4. Ignore headlines that promote or reference other companies.
                     
    - You MUST provide output according to the following specification:
     - Output the results in a valid JSON array of index numbers representing the articles having the most relevance to my business.
     - Only output the articles selected according to the criteria above.
     - Only output the JSON and nothing else (not even the markdown specifier showing it's JSON content i.e. backtick backtick backtick json...)
         Format:
            [number, number, number...]
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

export async function fetchChatCompletionRelevantArticles(
    model: string,
    input: MarketingHooksInput & AdditionalInputProperties,
    userId: string,
    articles: string,
    maxAttempts = 2,
    delay = 1000,
    factor = 2
): Promise<any> {
    const messages = [
        {
            role: "user",
            content: generateEmailSequence(input, articles)
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
            return fetchChatCompletionRelevantArticles(
                "gpt-4",
                input,
                userId,
                articles
            )
        } else {
            return null
        }
    }
}
