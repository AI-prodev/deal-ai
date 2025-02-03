/* eslint-disable quotes */
/* eslint-disable indent */
import { AdditionalInputProperties, SeoInput } from "../types/query"
import { RateLimitModel } from "../models/RateLimit"
import { moderate } from "./moderation"
import { chooseOpenAiKey } from "./chooseOpenAiKey"

function generateSeo(input: SeoInput & AdditionalInputProperties): string {
    input.language = input.language.replace("(experimental, please send us feedback)", "")

    const n = input.n || 10

    if (!input.targeting) input.targeting = 4

    const prompt = input.type !== "business" ? `
      I'll give you a product description. Then I'll give you specific instructions on how to generate 12 SEO Tags.

      <BEGIN BUSINESS OR PRODUCT DESCRIPTION>

      ${input.businessDescription}

      <END BUSINESS OR PRODUCT DESCRIPTION>

      Specific Instructions to generate 12 SEO Tags: Generate 3 branded keywords, 3 unbranded commercial long tail keywords, 3 unbranded commercial longer tail keywords, and 3 unbranded transaction long tail keywords to the following instructions:
      - Branded keywords: Generate 3 branded SEO keywords for my product in the language ${input.language}. Put the attributes that are the most important to the user closer to the start. 
      - Unbranded Long Tail Commercial Keywords: Generate 3 Unbranded Long Tail Commercial Keywords for my product in the language ${input.language}. Put the attributes that are the most important to the user closer to the start. Commercial Keywords are those that target searchers who want to investigate brands, products, or services. Length should be ${input.targeting} words. Do Not include any brand terms in these.
      - Unbranded Longer Tail Commercial Keywords: Generate 3 Unbranded Longer Tail Commercial Keywords for my product in the language ${input.language}. Put the attributes that are the most important to the user closer to the start. Commercial Keywords are those that target searchers who want to investigate brands or products. Length should be ${input.targeting + 1} words. Do Not include any brand terms in these.
      - Unbranded Long Tail Transactional Keywords: Generate 3 Unbranded Long Tail Transactional Keywords for my product in the language ${input.language}. Start with a high-volume transaction term that indicates immediate intent to purchase such as "Buy" or "order". Commercial Keywords are those that target searchers who want to make a purchase. Length should be ${input.targeting + 1} words. Do Not include any brand terms in these.

      - You MUST provide output according to the following specification:
        - Output the results in a valid JSON array of objects.
        - Use double quotes for keys and string values, and do not include percentage signs or brackets for the numbers.
        - Ensure numbers are not enclosed in quotes.
        - Only output the JSON and nothing else (not even the markdown specifier showing it's JSON content i.e. backtick backtick backtick json...)
      
      Format:
      [
        {"tag": "Branded keywords 1 in the language ${input.language}", "type": "branded_keyword"},
        {"tag": "Branded keywords 2 in the language ${input.language}", "type": "branded_keyword"},
        {"tag": "Branded keywords 3 in the language ${input.language}", "type": "branded_keyword"},
        {"tag": "Unbranded Long Tail Commercial Keywords 1 in the language ${input.language}", "type": "unbranded_long_tail_commercial_keyword"},
        {"tag": "Unbranded Long Tail Commercial Keywords 2 in the language ${input.language}", "type": "unbranded_long_tail_commercial_keyword"},
        {"tag": "Unbranded Long Tail Commercial Keywords 3 in the language ${input.language}", "type": "unbranded_long_tail_commercial_keyword"},
        {"tag": "Unbranded Longer Tail Commercial Keywords 1 in the language ${input.language}", "type": "unbranded_longer_tail_commercial_keyword"},
        {"tag": "Unbranded Longer Tail Commercial Keywords 2 in the language ${input.language}", "type": "unbranded_longer_tail_commercial_keyword"},
        {"tag": "Unbranded Longer Tail Commercial Keywords 3 in the language ${input.language}", "type": "unbranded_longer_tail_commercial_keyword"},
        {"tag": "Unbranded Long Tail Transactional Keywords 1 in the language ${input.language}", "type": "unbranded_long_tail_transactional_keyword"},
        {"tag": "Unbranded Long Tail Transactional Keywords 2 in the language ${input.language}", "type": "unbranded_long_tail_transactional_keyword"},
        {"tag": "Unbranded Long Tail Transactional Keywords 3 in the language ${input.language}", "type": "unbranded_long_tail_transactional_keyword"},
        ...
      ]
      
      - The 'tag' value and 'type' value must be strings enclosed in double quotes, and any special characters like quotes within the string should be properly escaped using a backslash.
    ` :
    `
      I'll give you a business description. Then I'll give you specific instructions on how to generate 6 SEO Tags.

      <BEGIN BUSINESS DESCRIPTION>

      ${input.businessDescription}

      <END BUSINESS DESCRIPTION>

      Specific Instructions to generate 6 SEO Tags: Generate 3 unbranded commercial long tail keywords, 2 unbranded commercial longer tail keywords, and 1 unbranded transaction long tail keywords to the following instructions:
      - Unbranded Long Tail Commercial Keywords: Generate 3 Unbranded Long Tail Commercial Keywords for my business in the language ${input.language}. Put the attributes that are the most important to the user closer to the start. Commercial Keywords are those that target searchers who want to investigate brands, products, or services. Length should be ${input.targeting} words. Do Not include any brand terms in these.
      - Unbranded Longer Tail Commercial Keywords: Generate 2 Unbranded Longer Tail Commercial Keywords for my business in the language ${input.language}. Put the attributes that are the most important to the user closer to the start. Commercial Keywords are those that target searchers who want to investigate brands or products. Length should be ${input.targeting + 1} words. Do Not include any brand terms in these.
      - Unbranded Long Tail Transactional Keywords: Generate 1 Unbranded Long Tail Transactional Keywords for my business in the language ${input.language}. Start with a high-volume transaction term that indicates immediate intent to purchase such as "Buy" or "order". Commercial Keywords are those that target searchers who want to make a purchase. Length should be ${input.targeting + 1} words. Do Not include any brand terms in these.

      - You MUST provide output according to the following specification:
        - Output the results in a valid JSON array of objects.
        - Use double quotes for keys and string values, and do not include percentage signs or brackets for the numbers.
        - Ensure numbers are not enclosed in quotes.
        - Only output the JSON and nothing else (not even the markdown specifier showing it's JSON content i.e. backtick backtick backtick json...)
      
      Format:
      [
        {"tag": "Unbranded Long Tail Commercial Keywords 1 in the language ${input.language}", "type": "unbranded_long_tail_commercial_keyword"},
        {"tag": "Unbranded Long Tail Commercial Keywords 2 in the language ${input.language}", "type": "unbranded_long_tail_commercial_keyword"},
        {"tag": "Unbranded Long Tail Commercial Keywords 3 in the language ${input.language}", "type": "unbranded_long_tail_commercial_keyword"},
        {"tag": "Unbranded Longer Tail Commercial Keywords 1 in the language ${input.language}", "type": "unbranded_longer_tail_commercial_keyword"},
        {"tag": "Unbranded Longer Tail Commercial Keywords 2 in the language ${input.language}", "type": "unbranded_longer_tail_commercial_keyword"},
        {"tag": "Unbranded Long Tail Transactional Keywords 1 in the language ${input.language}", "type": "unbranded_long_tail_transactional_keyword"},
        ...
      ]
      
      - The 'tag' value and 'type' value must be strings enclosed in double quotes, and any special characters like quotes within the string should be properly escaped using a backslash.
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

export async function fetchChatCompletionSeo(
    model: string,
    input: SeoInput & AdditionalInputProperties,
    userId: string,
    maxAttempts = 2,
    delay = 1000,
    factor = 2
): Promise<any> {
    const messages = [
        {
            role: "user",
            content: generateSeo(input)
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

    await moderate(`${input.businessDescription} ${input.toneAdditionalInfo} ${input.targetAudience}`, userId)

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
            return fetchChatCompletionSeo("gpt-4", input, userId, 1)
        } else {
            return null
        }
    }
}
