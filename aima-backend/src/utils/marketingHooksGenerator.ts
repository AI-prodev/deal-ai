/* eslint-disable quotes */
/* eslint-disable indent */
// src/utils/marketingHooksGenerator.ts
import { AdditionalInputProperties, MarketingHooksInput } from "../types/query"
import { RateLimitModel } from "../models/RateLimit"
import { moderate } from "./moderation"
import { chooseOpenAiKey } from "./chooseOpenAiKey"

function generateMarketingHooks(
    input: MarketingHooksInput & AdditionalInputProperties
): string {
    input.language = input.language.replace(
        "(experimental, please send us feedback)",
        ""
    )

    const n = input.n || 30

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

    const getHooks = (): string => {
        return input.goodHooks
            ? `Here are some examples of good hooks I’ve thought of: ${input.goodHooks}. But don’t limit your results to these examples.`
            : ""
    }

    const getTriggerWords = (): string => {
        return input.triggerWords
            ? `Try to use these words in some of the hooks (not mandatory though): ${input.triggerWords}.`
            : ""
    }

    const getInstructions = (): string => {
        return input.instructions ? `Also, ${input.instructions}.` : ""
    }

    const valenceSentence =
        input.valence === false
            ? "Only use a positive tonality"
            : "Start with something that a potential customer shouldn't do, then contrast and provide an alternative. For example, 'Don't do this, do that instead'."

    const priceSentence = input.priceDrivenCheck
        ? `Use ${input.priceDriven} in your hooks.`
        : ""

    const ratedHooks = (): string =>
        input.ratedHooks
            ? `The user has rated previous hooks you created as follows, on a scale of 1 to 5. Take their personal preferences into account when generating this new set of hooks. ${input.ratedHooks}`
            : ""

    const prompt = `My goal is to generate several marketing hooks for my business. A good marketing hook is short and very persuasive and stands out in online marketing ads and gets a lot of clicks. In the following, I will provide all pertinent information about my business in several segments. At the end, I will prompt you with further instructions on how to generate hooks for me.

        Description: ${input.businessDescription}.
        
        The hook should be approximately ${
            input.hookLength * 3
        } words, and definitely at most ${input.hookLength * 3} words long.
        
        ${valenceSentence}
        
        ${getTone()}.
        
        On a scale of 1 to 10 of using persuasive sales language with 10 being super salesy, generate hooks that are ${
            input.aggressiveness
        }.
        
        ${priceSentence}
        
        Target Audience for this product is ${input.targetAudience}.
        
        ${getHooks()}
        
        ${getTriggerWords()}

        ${
            input.emoji
                ? "At the end of each hook, add a single space and a single emoji relevant to the hook."
                : "Do not add emojis to the hooks."
        }

        ${ratedHooks()}
        
        ${getInstructions()}

        Final instructions:
        - Generate ${n} hooks in the language ${
            input.language
        } based on the above inputs. For each hook, calculate 3 percentages from 0 to 100 based on:
          -- Clickability: How effective the hook is at attracting clicks.
          -- Likeability: The potential of the hook to get likes in an online advertisement.
          -- Cognitive Availability: How quickly a busy person can understand the hook at a glance.
        
        - Sort the ${n} hooks based on the sum of the above 3 factors, from the highest to the lowest combined score.
        
        - You MUST provide output according to the following specification:
          - Output the results in a valid JSON array of objects.
          - Use double quotes for keys and string values, and do not include percentage signs or brackets for the numbers.
          - Ensure numbers are not enclosed in quotes.
          - Only output the JSON and nothing else (not even the markdown specifier showing it's JSON content i.e. backtick backtick backtick json...)
        
        Format:
        [
          {"h": "Hook text in language ${
              input.language
          }", "c": Clickability, "l": Likeability, "a": CognitiveAvailability},
          ...
        ]
        
        - Make sure that 'c', 'l', and 'a' values are provided as raw numbers without any symbols or punctuation. For example, use 95 instead of '95' or 95%.
        - The 'h' value must be a string enclosed in double quotes, and any special characters like quotes within the string should be properly escaped using a backslash.
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

export async function fetchChatCompletionMarketingHooks(
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
            content: generateMarketingHooks(input)
        }
    ]

    const url = "https://api.openai.com/v1/chat/completions"
    const apiKey = chooseOpenAiKey()
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

        try {
            JSON.parse(content)
        } catch (e) {
            console.log("Could not parse JSON from OpenAI.")
            console.log(content)
        }

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
            return fetchChatCompletionMarketingHooks("gpt-4", input, userId, 1)
        } else {
            return null
        }
    }
}
