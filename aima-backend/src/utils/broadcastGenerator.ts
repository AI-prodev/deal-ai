/* eslint-disable quotes */
/* eslint-disable indent */

import { AdditionalInputProperties, MarketingHooksInput } from "../types/query"
import { RateLimitModel } from "../models/RateLimit"
import { moderate } from "./moderation"
import { chooseOpenAiKey } from "./chooseOpenAiKey"

function generateBroadcast(
    input: MarketingHooksInput & AdditionalInputProperties,
    news: string
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
            I want to send an email broadcast to my readers bringing them up to date.            
            
            The email should be ${
                input.hookLength - 2
            } sentences in length.

            Do not start the email with an introduction, just jump right into the news content.
            Cite the source of the news article (e.g. According to the Daily Mail, As reported in the Sun Tribune, According to Wired.com, etc.) and write a short summary of the article in 3 sentences or fewer. In this short summary, focus on the key takeaways for the reader and what’s in it for them.
            After the summary, in one short sentence, describe how it relates to my business or product. Do not sell the product or service in this sentence, just highlight the benefit of my product and service and how it relates to the news article you just summarized.
            The entire email should be short and punchy. 

            Add a separate, very short line on a separate paragraph at the end of this email that takes the main point of this article and compels the user to take action and purchase my product or service with a strong Call-To-Action (CTA). The CTA is ${input.cta ?? "purchase"}.
            
	        Do not use filler words and phrases anywhere in this email, be direct.
            Use simple language suitable for an 8th grader.

            Here is a description of my business or product:

            <START DESCRIPTION OF MY BUSINESS OR PRODUCT / SERVICE>
            ${input.businessDescription}
            <END DESCRIPTION OF MY BUSINESS OR PRODUCT / SERVICE>
            
            Here is the news article I want to use as the basis for the email broadcast, which will be in the following format:
            { "title", "Article title", "body": "Article body", "url": "Article URL" }

            <START ARTICLE>
            ${news}
            <END ARTICLE>

            Reminder of instructions:

            Do not start the email with an introduction, just jump right into the news content.
            Cite the source of the news article (e.g. According to the Daily Mail, As reported in the Sun Tribune, According to Wired.com, etc.) and write a short summary of the article in 3 sentences or fewer. In this short summary, focus on the key takeaways for the reader and what’s in it for them.
            After the summary, in one short sentence, describe how it relates to my business or product. Do not sell the product or service in this sentence, just highlight the benefit of my product and service and how it relates to the news article you just summarized.
            The entire email should be short and punchy. 

            Add a separate, very short line on a separate paragraph at the end of this email that takes the main point of this article and compels the user to take action and purchase my product or service with a strong Call-To-Action (CTA). The CTA is ${input.cta ?? "purchase"}.
            
	        Do not use filler words and phrases anywhere in this email, be direct.
            Use simple language suitable for an 8th grader.

            Additional of instructions:
            
            ${getTone()}.
            
            The level of persuasive language should be around ${
                input.aggressiveness
            } on a scale of 1 to 10.
            
            ${priceSentence}
            
            The target audience is ${input.targetAudience}. My customers speak the language ${input.language} so the generated emails must be in ${input.language}.
            
            Additional Email Content Guidelines:
            - ${getTriggerWords()}.
            - ${
                input.emoji
                    ? "Add relevant emojis to the emails."
                    : "You must not add emojis in the emails."
            }
            - ${getInstructions()}
                         
            - You MUST provide output according to the following specification:
             - Output the results in a valid JSON array of objects, containing one item.
             - Use double quotes for keys and string values, and do not include percentage signs or brackets for the numbers.
             - Create separate paragraphs in the email body. Make sure to insert these frequently - more is better than less. Use \n\n to separate paragraphs.
             - Only output the JSON and nothing else (not even the markdown specifier showing it's JSON content i.e. backtick backtick backtick json...)
                 Format:
                      [
                        {"url": "The article URL", "subject": "Subject text in ${
                            input.language
                        }", "body": "Email body in ${input.language}"}
                      ]
             - Values for 'url', 'subject', and 'body' must be strings enclosed in double quotes.
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

export async function fetchChatCompletionBroadcast(
    model: string,
    input: MarketingHooksInput & AdditionalInputProperties,
    userId: string,
    news: string,
    maxAttempts = 2,
    delay = 1000,
    factor = 2
): Promise<any> {
    const messages = [
        {
            role: "user",
            content: generateBroadcast(input, news)
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
            return fetchChatCompletionBroadcast("gpt-4", input, userId, news)
        } else {
            return null
        }
    }
}
