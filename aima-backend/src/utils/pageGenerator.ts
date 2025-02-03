/* eslint-disable quotes */
/* eslint-disable indent */
import { PageGeneratorInput } from "../types/query"
import { RateLimitModel } from "../models/RateLimit"
import { moderate } from "./moderation"
import { chooseOpenAiKey } from "./chooseOpenAiKey"

function generagePage(input: PageGeneratorInput): string {
    const prompt = `My goal is to generate a landing page for my business. A good landing page has very persuasive text on it. In the following, I will provide all pertinent information about my business in several segments. At the end, I will prompt you with further instructions on how to generate the page data for me.

        Description: ${input.businessDescription}
        
        Instructions:
        - Generate a JSON object with these 2 fields:
          -- hero_text: An eye-catching above-the-fold sentence that captures the visitor's attention
          -- follow_up: A nice follow up sentence that will go just below the fold, to give a further explanation
        
        - You MUST provide output according to the following specification:
          - Output the result as a valid JSON object.
          - Use double quotes for keys and string values.
          - Ensure numbers are not enclosed in quotes.
          - Only output the JSON object and nothing else (not even the markdown specifier showing it's JSON content i.e. backtick backtick backtick json...)
        
        Format:
        {"hero_text": "Hero text", "follow_up": "Follow up text"},
        
        - Make sure that any special characters like quotes within the string should be properly escaped using a backslash.
        `

    return prompt
}

// Example usage:

// const input: PageGeneratorInput = {
//     businessDescription:
//         "We provide cutting-edge AI solutions for small businesses.",
// }
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

// Fetch chat completion function
export async function fetchChatCompletionPageGenerator(
    model: string,
    input: PageGeneratorInput,
    userId: string,
    maxAttempts = 2,
    delay = 1000,
    factor = 2
): Promise<any> {
    const messages = [
        {
            role: "user",
            content: generagePage(input)
        }
    ]
    console.log("input", input)
    console.log("messages", messages)
    const url = "https://api.openai.com/v1/chat/completions"
    const apiKey = chooseOpenAiKey()
    const timeoutInMilliseconds = 3 * 60 * 1000 // 3 minutes

    const payload = {
        model,
        messages,
    }

    await moderate(`${input.businessDescription}`, userId)

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

        content = JSON.parse(content)
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
            return fetchChatCompletionPageGenerator("gpt-4", input, userId, 1)
        } else {
            return null
        }
    }
}
