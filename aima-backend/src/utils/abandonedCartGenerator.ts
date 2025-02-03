/* eslint-disable quotes */
/* eslint-disable indent */

import { AdditionalInputProperties, MarketingHooksInput } from "../types/query"
import { RateLimitModel } from "../models/RateLimit"
import { moderate } from "./moderation"
import { chooseOpenAiKey } from "./chooseOpenAiKey"

function generateEmailSequence(
    input: MarketingHooksInput & AdditionalInputProperties
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

    const getTriggerWords = (): string => {
        return input.triggerWords
            ? `Try to use these words in some of the hooks (not mandatory though): ${input.triggerWords}.`
            : ""
    }

    const getInstructions = (): string => {
        return input.instructions ? `Also, ${input.instructions}.` : ""
    }

    const priceSentence = input.priceDrivenCheck
        ? `Make sure to mention the price of the product - ${input.priceDriven} - in the emails.`
        : ""

    const ratedHooks = (): string =>
        input.ratedHooks
            ? `The user has rated previous emails you created as follows, on a scale of 1 to 5. Take their personal preferences into account when generating this new set of emails. ${input.ratedHooks}`
            : ""

    const prompt = `
            <START DESCRIPTION OF MY BUSINESS OR PRODUCT / SERVICE>
            ${input.businessDescription}
            <END DESCRIPTION OF MY BUSINESS OR PRODUCT / SERVICE>

            After customers visit my website or sales funnel, they sign up to my email list. Most then go on to purchase my product or services, but for those who don't or who abandon their cart, I want to send them a sequence of four emails to encourage them to buy my product or service.
            
            Generate the sequence of four emails, with each email corresponding to a specific time interval after an initial action - one an hour later, one a day later, one three days later, and one five days later.
            
            These emails should be engaging, persuasive, and suitable for digital marketing.
            
            Each email should be ${
                input.hookLength
            } sentences in length.
            
            ${getTone()}.
            
            The level of persuasive language should be around ${
                input.aggressiveness
            } on a scale of 1 to 10.
            
            ${priceSentence}
            
            The target audience is ${input.targetAudience}. My customers speak the language ${input.language} so the generated emails must be in ${input.language}.
            
            ${ratedHooks()}

            Additional Email Content Guidelines:
            - Include a strong call-to-action (CTAs). The CTA is ${input.cta ?? "purchase"}
            - ${getTriggerWords()}.
            - ${
                input.emoji
                    ? "Add relevant emojis to the emails."
                    : "You must not add emojis in the emails."
            }
            - ${getInstructions()}
            
            Email Sequence Timing:
            - The first email should be suitable to be sent '1 hour later'. This email mainly focuses on persuading the visitor to complete the action they started.
            - The second email should be suitable to be sent '1 day later'. This email highlights the main benefit of the product or service.
            - The third email should be suitable to be sent '3 days later'. This email articulates why the time to act is now, not later. 
            - The fourth email should be suitable to be sent '5 days later'. This email is the final reminder and last chance.
            
            Email Evaluation Metrics:
            - Compose each email for each email for:
              -- Engagement: The ability to capture attention.
              -- Persuasiveness: Effectiveness in inducing action.
              -- Clarity: Ease of understanding for the reader.
             
            - You MUST provide output according to the following specification:
             - Output the results in a valid JSON array of objects.
             - Use double quotes for keys and string values, and do not include percentage signs or brackets for the numbers.
             - Create separate paragraphs in the email body. Make sure to insert these frequently - more is better than less. Use \n\n to separate paragraphs.
             - Only output the JSON and nothing else (not even the markdown specifier showing it's JSON content i.e. backtick backtick backtick json...)
                 Format:
                      [
                        {"timing": "1 hour later", "subject": "Subject text in ${
                            input.language
                        }", "body": "Email body in ${input.language}"},
                        {"timing": "1 day later", "subject": "Subject text in ${
                            input.language
                        }", "body": "Email body in ${input.language}"},
                        {"timing": "3 days later", "subject": "Subject text in ${
                            input.language
                        }", "body": "Email body in ${input.language}"},
                        {"timing": "5 days later", "subject": "Subject text in ${
                            input.language
                        }", "body": "Email body in ${input.language}"}
                      ]
             - Values for 'timing', 'subject', and 'body' must be strings enclosed in double quotes.
             - Special characters in strings must be escaped correctly to prevent JSON parsing errors.
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

export async function fetchChatCompletionAbandonedCart(
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
            content: generateEmailSequence(input)
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
            return fetchChatCompletionAbandonedCart("gpt-4", input, userId, 1)
        } else {
            return null
        }
    }
}
