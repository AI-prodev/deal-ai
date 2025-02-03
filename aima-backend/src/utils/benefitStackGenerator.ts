/* eslint-disable quotes */
/* eslint-disable indent */
import { AdditionalInputProperties, BenefitStackInput } from "../types/query"
import { RateLimitModel } from "../models/RateLimit"
import { moderate } from "./moderation"
import { chooseOpenAiKey } from "./chooseOpenAiKey"

function generateBenefitStack(
    input: BenefitStackInput & AdditionalInputProperties
): string {
    input.language = input.language.replace(
        "(experimental, please send us feedback)",
        ""
    )

    const n = input.n || 20

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

    const getInstructions = (): string => {
        return input.instructions ? `Also, ${input.instructions}.` : ""
    }

    const priceSentence = input.priceDrivenCheck
        ? `Use cost saving as one of the benefits in the stack. This is how our customers save money using our product: ${input.priceDriven}.`
        : ""

    const ratedHooks = (): string =>
        input.ratedHooks
            ? `The user has rated previous benefit stacks you created as follows, on a scale of 1 to 5. Take their personal preferences into account when generating this new set of stacks. <STACK RATING START> ${input.ratedHooks} <STACK RATING END>`
            : ""

    const dimensionsOfNeed = input.dimensionsOfNeed
        ? `Here are some examples of Specific Dimensions of Need that my business satisfies for the customer: ${input.dimensionsOfNeed}.`
        : ""

    const prompt = `My goal is to generate a benefit stack for our business. A good benefit stack is a bullet list that clearly highlights the benefits of the product to the user. Each bullet point approaches a different dimension of need that can be satisfied if the customer chooses to join. So the main idea is to generate outputs and with each output target a specific and different dimension of need that the business satisfies. Then provide a blurb that conveys that to the customer.

        In the following, I will provide all pertinent information about my business in several segments. At the end I will prompt you with further instructions on how to generate a benefit stack for me.

        Description: ${input.businessDescription}.
        
        ${getTone()}.
        
        On a scale of 1 to 10 of using persuasive sales language with 10 being super salesy, generate benefits that are ${
            input.aggressiveness
        }.
        
        ${priceSentence}
        
        Target Audience for this product is ${input.targetAudience}.

        ${dimensionsOfNeed}
        
        ${ratedHooks()}
        
        ${getInstructions()}

        The blurb associated with each dimension of need should be approximately ${
            input.hookLength * 3
        } words, and definitely at most ${input.hookLength * 3} words long.

        Final instructions:
        - Based on the above instructions, dimensionalize and generate ${n} different and very specific needs that my target audience might have and my business can satisfy.
        - Make sure dimensions of need are all different, meaning we are addressing many different ways that my business can help the user.
        - Rank order them based on how strong that need is to my target audience.
        - Concisely describe each need in 4 words or less in the language ${
            input.language
        }.
        - For each specific need, write a short persuasive sentence in the language ${
            input.language
        } describing how my business benefits my user by satisfying that specific need. In your output, address the user directly who's reading this directly by using words like you/your.
        
        - You MUST provide output according to the following specification:
          - Output the results in a valid JSON array of objects.
          - Use double quotes for keys and string values, and do not include percentage signs or brackets for the numbers.
          - Ensure numbers are not enclosed in quotes.
          - Only output the JSON and nothing else (not even the markdown specifier showing it's JSON content i.e. backtick backtick backtick json...)
        
        Format:
        [
          {"n": "The need in the language ${
              input.language
          }", "a": "How my business satisfies the need in the language ${
        input.language
    }"},
          ...
        ]
        
        - The 'n' and 'a' values must be strings enclosed in double quotes, and any special characters like quotes within the string should be properly escaped using a backslash.
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

export async function fetchChatCompletionBenefitStack(
    model: string,
    input: BenefitStackInput & AdditionalInputProperties,
    userId: string,
    maxAttempts = 2,
    delay = 1000,
    factor = 2
): Promise<any> {
    const messages = [
        {
            role: "user",
            content: generateBenefitStack(input)
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
        `${input.businessDescription} ${input.dimensionsOfNeed} ${input.instructions} ${input.priceDriven} ${input.targetAudience} ${input.toneAdditionalInfo}`,
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
            return fetchChatCompletionBenefitStack("gpt-4", input, userId, 1)
        } else {
            return null
        }
    }
}
