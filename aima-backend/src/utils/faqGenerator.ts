/* eslint-disable quotes */
/* eslint-disable indent */
import { AdditionalInputProperties, FaqInput } from "../types/query"
import { RateLimitModel } from "../models/RateLimit"
import { moderate } from "./moderation"
import { chooseOpenAiKey } from "./chooseOpenAiKey"

function generateFaq(input: FaqInput & AdditionalInputProperties): string {
    input.language = input.language.replace("(experimental, please send us feedback)", "")

    const n = input.n || 10

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
            ? `The user has rated previous FAQs you created as follows, on a scale of 1 to 5. Take their personal preferences into account when generating this new set of FAQs. ${input.ratedHooks}`
            : ""

    const prompt = `
      <BEGIN BUSINESS OR PRODUCT DESCRIPTION>

      ${input.businessDescription}

      <END BUSINESS OR PRODUCT DESCRIPTION>

      <BEGIN BENEFIT STACK>

      ${input.benefitStack}

      <END BENEFIT STACK>

      ${ratedHooks()}

      ${getTone()}.
      
      The above is a list of customer needs that my business satisfies (dimensions of need), and how my business satisfies them. This is commonly known in the marketing world as a benefit stack.
     
      On a scale of 1 to 10 of using persuasive sales language with 10 being super salesy, generate FAQs that are ${
        input.aggressiveness
        }.

      Based on the above information, think of the top ${n} main objections that people might have that prevents them from purchasing my product. Rank order them based on how likely they are to actually prevent people from purchasing my product. Then create ${n} FAQs that overcome these objections. Each FAQ item should consist of:

      - A question in the language ${input.language}: Take the objection and turn it into a question from the user to us
      - An answer in the language ${input.language}: Provide a convincing answer that overcomes that objection and puts the user's mind at ease to continue and purchase our product. The answer should be approximately ${input.hookLength * 3} words, and definitely at most ${input.hookLength * 3} words long.

      - You MUST provide output according to the following specification:
        - Output the results in a valid JSON array of objects.
        - Use double quotes for keys and string values, and do not include percentage signs or brackets for the numbers.
        - Ensure numbers are not enclosed in quotes.
        - Only output the JSON and nothing else (not even the markdown specifier showing it's JSON content i.e. backtick backtick backtick json...)
      
      Format:
      [
        {"q": "The question in the language ${input.language}", "a": "The answer in the language ${input.language} of approximately ${input.hookLength * 3} words"},
        ...
      ]
      
      - The 'q' and 'a' values must be strings enclosed in double quotes, and any special characters like quotes within the string should be properly escaped using a backslash.
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

export async function fetchChatCompletionFaq(
    model: string,
    input: FaqInput & AdditionalInputProperties,
    userId: string,
    maxAttempts = 2,
    delay = 1000,
    factor = 2
): Promise<any> {
    const messages = [
        {
            role: "user",
            content: generateFaq(input)
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
            return fetchChatCompletionFaq("gpt-4", input, userId, 1)
        } else {
            return null
        }
    }
}
