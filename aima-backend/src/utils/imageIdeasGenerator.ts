/* eslint-disable quotes */
/* eslint-disable indent */
import { ImageIdeasInput } from "../types/query"
import { RateLimitModel } from "../models/RateLimit"
import { moderate } from "./moderation"
import { chooseOpenAiKey } from "./chooseOpenAiKey"

function generateImageIdeas(input: ImageIdeasInput): string {
    const prompt = `
      I want to run an image ad on social media to get new clients for my business. At the end of this prompt I'll give you a description of my business. Come up with 20 different ideas for what the image should show. Avoid abstract ideas and focus on specific, simple image ideas that can grab attention and evoke a positive feeling.  I'll give you a few examples: 

      Example 1: For a business that provides marketing services to help doctors grow their revenue, a good image ad idea is "Amazing lifestyle: A doctor living a life of luxury".
      
      Example 2: For a carwash business, a good image ad idea is "Sparkling Wheels: Close-up of wheels shining brightly after a wash."
      
      Example 3: For a real estate brokerage, a good image ad idea is "Sunrise Over Sold Properties: A beautiful sunrise scene with silhouettes of homes marked 'Sold'."
      
      Example 4: For a marketing agency focusing on helping restaurants grow their revenue, a good image ad idea is “Chef Recognition: A local chef receiving media attention.”
      
      Be creative. Focus on the positive feeling that my business creates for its customers. The more specific the ad the better. For example, simple specific objects or things that shows success for my customers do well in marketing.
      
      <BEGIN BUSINESS OR PRODUCT DESCRIPTION>
      ${input.businessDescription}
      <END BUSINESS OR PRODUCT DESCRIPTION>

      The image idea you provide will be used as a prompt for an AI image generator (DALL-E 3). Therefore, each image idea should have a sentence before it describing the business relevant to the idea to enable the image generator to produce a relevant image.
      Unless it is a well-known brand, the image generator will most likely not know the business enough to produce a relevant image without a description of the business. So instead of using brand names, write a sentence describing the business. For example, instead of writing "My Care Home Brand in Reading, Berkshire", write "a care home for the elderly in the south of England".

      - You MUST provide output according to the following specification:
        - Output the results in a valid JSON array of strings.
        - Use double quotes for keys and string values.
        - Only output the JSON and nothing else (not even the markdown specifier showing it's JSON content i.e. backtick backtick backtick json...)
      
      Format:
      [
        "A brief description of the business. The first image idea",
        ...
        "A brief description of the business. The last image idea"
      ]
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

export async function fetchChatCompletionImageIdeas(
    model: string,
    input: ImageIdeasInput,
    userId: string,
    maxAttempts = 2,
    delay = 1000,
    factor = 2
): Promise<any> {
    const messages = [
        {
            role: "user",
            content: generateImageIdeas(input)
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
        temperature: 1.0
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
            return fetchChatCompletionImageIdeas("gpt-4", input, userId, 1)
        } else {
            return null
        }
    }
}
