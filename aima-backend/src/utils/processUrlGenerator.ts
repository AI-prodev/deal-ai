import { RateLimitModel } from "../models/RateLimit"
import { chooseOpenAiKey } from "./chooseOpenAiKey"
import { moderate } from "./moderation"

function generateSummaryRequest(input: string) {
    if (typeof input !== "string" || !input.trim()) {
        throw new Error("Invalid input: Input must be a non-empty string.")
    }
    return `Summarize the following content in a few sentences: ${input.trim()}`
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

export async function fetchChatCompletionSummary(
    model: string,
    input: any,
    userId: string,
    maxAttempts = 2,
    delay = 1000,
    factor = 2
): Promise<any> {
    const messages = [
        {
            role: "user",
            content: generateSummaryRequest(input)
        }
    ]
    console.log("input", input)

    const url = "https://api.openai.com/v1/chat/completions"
    const apiKey = chooseOpenAiKey()
    const timeoutInMilliseconds = 3 * 60 * 1000 // 3 minutes

    const payload = {
        model,
        messages,
        temperature: 0.7
    }

    await moderate(input, userId)
    const fetchSummary = async (): Promise<any> => {
        const response = await Promise.race([
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
        ])

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

        const content = data.choices[0].message.content

        // try {
        //     content = JSON.parse(content)
        // } catch (e) {
        //     console.log("Could not parse JSON from OpenAI.")
        //     console.log(content)
        //     throw new Error("JSON parsing error")
        // }

        return content
    }

    try {
        return await retryWithExponentialBackoff(
            fetchSummary,
            maxAttempts,
            delay,
            factor
        )
    } catch (error) {
        console.error(`All ${maxAttempts} attempts failed:`, error)

        if (model !== "gpt-4-0125-preview") {
            console.log("Retrying with gpt-4 model.")
            return fetchChatCompletionSummary(
                "gpt-4-0125-preview",
                input,
                userId,
                1
            )
        } else {
            throw error
        }
    }
}
