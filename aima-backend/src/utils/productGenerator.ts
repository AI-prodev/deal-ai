/* eslint-disable quotes */
/* eslint-disable indent */
import { AdditionalInputProperties, ProductInput } from "../types/query"
import { RateLimitModel } from "../models/RateLimit"
import { moderate } from "./moderation"
import { chooseOpenAiKey } from "./chooseOpenAiKey"

function generateProduct(
    input: ProductInput & AdditionalInputProperties
): string {
    input.language = input.language.replace(
        "(experimental, please send us feedback)",
        ""
    )

    const getTone = (): string => {
        switch (input.tone) {
            case "Inspirational":
                return "Use an inspirational tonality"
            case "Factual":
                return "Use a factual tonality"
            case "Fun":
                return "Use a fun tonality"
            case "Urgent":
                return `Use an urgent tonality${
                    input.toneAdditionalInfo
                        ? " to convey the urgency by " +
                          input.toneAdditionalInfo
                        : ""
                }`
            case "Fear-Based":
                return `Use a tonality that positions my business as a solution to ${
                    input.toneAdditionalInfo
                        ? "the fear of: " + input.toneAdditionalInfo
                        : "fear"
                }`
            default:
                return ""
        }
    }

    const getLengthSentence = () => {
        if (input.hookLength === 4) {
            return "Keep the business description reasonably short, around 12-25 words / 1-2 sentences."
        } else if (input.hookLength === 5) {
            return "Keep the business description at around 25-50 words / 2-3 sentences."
        } else {
            return "Keep the product description at around 50-100 words / 4-6 sentences."
        }
    }

    const prompt =
        input.type !== "business"
            ? `
      <BEGIN BUSINESS OR PRODUCT DESCRIPTION>

      ${input.businessDescription}

      <END BUSINESS OR PRODUCT DESCRIPTION>

      ${getTone()}.
           
      On a scale of 1 to 10 of using persuasive sales language with 10 being super salesy, generate a product description suitable for use on an ecommerce platform that is ${
          input.aggressiveness
      }.

      Based on the above information, think of the best, most persuasive product description for an ecommerce store in the language ${
          input.language
      } that you would use to best describe the business or product.
      The SEO tags that the product is being promoted under are ${input?.seoTags?.join(
          ", "
      )}. You must optimize your product description to target these SEO tags.

      Keep in mind that the product description should be written in a way that is suitable for an ecommerce store, and not a blog post or article.
      Keep the product description reasonably short, around 75-150 words / 3-4 sentences.

      - You MUST provide output according to the following specification:
        - Output the results in a valid JSON array of objects, containing a single object.
        - Use double quotes for keys and string values, and do not include percentage signs or brackets for the numbers.
        - Ensure numbers are not enclosed in quotes.
        - Only output the JSON and nothing else (not even the markdown specifier showing it's JSON content i.e. backtick backtick backtick json...)
        - Keep the product description reasonably short, around 75-150 words / 3-4 sentences.
      
      Format:
      [
        {"product": "The product description in ${input.language}"},
        ...
      ]
      
      - The 'product' value must be a string enclosed in double quotes, and any special characters like quotes within the string should be properly escaped using a backslash.
    `
            : `
    <BEGIN BUSINESS DESCRIPTION>

    ${input.businessDescription}

    <END BUSINESS DESCRIPTION>

    ${getTone()}.
         
    On a scale of 1 to 10 of using persuasive sales language with 10 being super salesy, generate a business description suitable for use at the top of a funnel or website that is ${
        input.aggressiveness
    }.

    Based on the above information, think of the best, most persuasive business description for use at the top of a funnel or website in the language ${
        input.language
    } that you would use to best describe the business.
    The SEO tags that the business is being promoted under are ${input?.seoTags?.join(
        ", "
    )}. You must optimize your business description to target these SEO tags.

    Keep in mind that the business description should be written in a way that is suitable for a funnel or website.
    ${getLengthSentence()}

    - You MUST provide output according to the following specification:
      - Output the results in a valid JSON array of objects, containing a single object.
      - Use double quotes for keys and string values, and do not include percentage signs or brackets for the numbers.
      - Ensure numbers are not enclosed in quotes.
      - Only output the JSON and nothing else (not even the markdown specifier showing it's JSON content i.e. backtick backtick backtick json...)
      - ${getLengthSentence()}
    
    Format:
    [
      {"product": "The business description in ${input.language}"},
      ...
    ]
    
    - The 'product' value must be a string enclosed in double quotes, and any special characters like quotes within the string should be properly escaped using a backslash.
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

export async function fetchChatCompletionProduct(
    model: string,
    input: ProductInput & AdditionalInputProperties,
    userId: string,
    maxAttempts = 2,
    delay = 1000,
    factor = 2
): Promise<any> {
    const messages = [
        {
            role: "user",
            content: generateProduct(input)
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

    await moderate(
        `${input.businessDescription} ${input.toneAdditionalInfo} ${input.targetAudience}`,
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
            return fetchChatCompletionProduct("gpt-4", input, userId, 1)
        } else {
            return null
        }
    }
}
