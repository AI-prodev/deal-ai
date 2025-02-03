/* eslint-disable quotes */
/* eslint-disable indent */
import { BonusStackInput } from "../types/query"
import { RateLimitModel } from "../models/RateLimit"
import { moderate } from "./moderation"
import { chooseOpenAiKey } from "./chooseOpenAiKey"

function generateBonusStack(input: BonusStackInput): string {
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

    const ratedHooks = (): string =>
        input.ratedHooks
            ? `The user has rated previous bonus stacks you created as follows, on a scale of 1 to 5. Take their personal preferences into account when generating this new set of bonuses. ${input.ratedHooks}`
            : ""

    input.language = input.language.replace(
        "(experimental, please send us feedback)",
        ""
    )

    const prompt = `
      <BEGIN BUSINESS OR PRODUCT DESCRIPTION>

      ${input.businessDescription}

      <END BUSINESS OR PRODUCT DESCRIPTION>

      <BEGIN BENEFIT STACK>

      ${input.benefitStack}

      <END BENEFIT STACK>

      The above is a list of customer needs that my business satisfies (dimensions of need), and how my business satisfies them. This is commonly known in the marketing world as a benefit stack.

      ${ratedHooks()}

      ${getTone()}.

      On a scale of 1 to 10 of using persuasive sales language with 10 being super salesy, generate bonuses that are ${
          input.aggressiveness
      }.

      Now based on the above information, I’d also like to offer a few additional Free Bonuses to my customers if they join Today. Can you think of at least 10 things I can offer to anyone who signs up today? Here’s some additional information to help you come up with these free bonuses:

      - These bonuses should satisfy one of the above dimensions of need described in the benefit stack input.
      - Best bonuses are additional products and services that are adjacent with my main product, meaning they go well together. Just as an example, a free bicycle helmet works really well if the main product is a bicycle.
      - These bonuses should be low cost to fulfill, but have a high perceived value by my user
      - These bonuses should not be repetitive of what is in my product already, as identified in the benefit stack above

      Give me at least 10 Free Bonus ideas. Rank them based on the perceived value by the customer. Also output the reason why a particular free bonus can compel a potential customer to act. Keep the length of each Free Bonus under 15 words in the language ${input.language.replace(
          "(experimental, please send us feedback)",
          ""
      )}. Keep the length of the reason for why a Free Bonus is compelling at around ${
        input.hookLength * 3
    } words (and no more than ${
        input.hookLength * 3
    } words) in the language ${input.language.replace(
        "(experimental, please send us feedback)",
        ""
    )}.
          
      - You MUST provide output according to the following specification:
        - Output the results in a valid JSON array of objects.
        - Use double quotes for keys and string values, and do not include percentage signs or brackets for the numbers.
        - Ensure numbers are not enclosed in quotes.
        - Only output the JSON and nothing else (not even the markdown specifier showing it's JSON content i.e. backtick backtick backtick json...)
      
      Format:
      [
        {"b": "The bonus in the language ${input.language.replace(
            "(experimental, please send us feedback)",
            ""
        )}", "r": "The reason in the language ${input.language.replace(
        "(experimental, please send us feedback)",
        ""
    )} of approximately ${input.hookLength * 3} words"},
        ...
      ]
      
      - The 'b' and 'r' values must be strings enclosed in double quotes, and any special characters like quotes within the string should be properly escaped using a backslash.
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

export async function fetchChatCompletionBonusStack(
    model: string,
    input: BonusStackInput,
    userId: string,
    maxAttempts = 2,
    delay = 1000,
    factor = 2
): Promise<any> {
    const messages = [
        {
            role: "user",
            content: generateBonusStack(input)
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
            return fetchChatCompletionBonusStack("gpt-4", input, userId, 1)
        } else {
            return null
        }
    }
}
