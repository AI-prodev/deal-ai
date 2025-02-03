import { QuestionGeneratorInput } from "../types/query"
import { RateLimitModel } from "../models/RateLimit"
import { moderate } from "./moderation"
import { chooseOpenAiKey } from "./chooseOpenAiKey"

function generageQuestion(input: QuestionGeneratorInput): string {
    const prompt = `My goal is to generate a upbeat exclamation about the answer of customer, I will provide all pertinent information in several segments. At the end, I will prompt you with further instructions. When I asked, “${input.question}” and the response was “${input.prompt}”. Generate an upbeat exclamation based on the customer's response.

        
        Instructions:
        - Generate a JSON object with this field:
          -- recommendText: A further explanation with the upbeat exclamation.
          -- replyText: A further explanation about ${input.prompt}.
        
        - You MUST provide output according to the following specification:
          - Output the result as a valid JSON object.
          - Use double quotes for keys and string values.
          - Ensure numbers are not enclosed in quotes.
          - Ensure the result does not exceed 60 characters.
          - Only output the JSON object and nothing else (not even the markdown specifier showing it's JSON content i.e. backtick backtick backtick json...)
        
        Format:
        {"recommendText": "Fantastic! 'My Car Wash Website' not only stands out as a brand name but also instantly", "replyText": "Unleash the Shine and Experience Car Wash Excellence"}

        
        - Make sure that any special characters like quotes within the string should be properly escaped using a backslash.
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

// Fetch chat completion function
export async function fetchChatCompletionQuestionGenerator(
    model: string,
    input: QuestionGeneratorInput,
    userId: string,
    maxAttempts = 2,
    delay = 1000,
    factor = 2
): Promise<any> {
    const messages = [
        {
            role: "user",
            content: generageQuestion(input)
        }
    ]
    const url = "https://api.openai.com/v1/chat/completions"
    const apiKey = chooseOpenAiKey()
    const timeoutInMilliseconds = 3 * 60 * 1000 // 3 minutes

    const payload = {
        model,
        messages,
    }

    await moderate(`${input.prompt}`, userId)

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
        if (model !== "gpt-4") {
            return fetchChatCompletionQuestionGenerator("gpt-4", input, userId, 1)
        } else {
            return null
        }
    }
}
