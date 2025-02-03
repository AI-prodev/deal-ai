/* eslint-disable indent */
/* eslint-disable quotes */
// src/utils/fetchChatCompletion.ts
import GPT3Tokenizer from "gpt3-tokenizer"
import mongoose from "mongoose"
import { NewtonInput, NewtonLandInput } from "../types/newTonTypes"
import { Query, SocrateLandQuery } from "../types/query"
import { Thesis } from "../types/thesis"
import { LandRecommandation, Recommendation } from "../types/apolloType"
import { RateLimitModel } from "../models/RateLimit"
import { chooseOpenAiKey } from "./chooseOpenAiKey"

type InputType =
    | Query
    | NewtonInput
    | SocrateLandQuery
    | LandRecommandation
    | Recommendation
    | NewtonLandInput

function isNewtonInputLand(input: InputType): input is NewtonLandInput {
    return (
        (input as NewtonLandInput).propertyName !== undefined &&
        (input as NewtonLandInput).propertyDescription !== undefined &&
        (input as NewtonLandInput).propertyType !== undefined
    )
}

function isLandRecommendation(input: InputType): input is LandRecommandation {
    return (
        (input as LandRecommandation).thesis !== undefined &&
        (input as LandRecommandation).about !== undefined &&
        (input as LandRecommandation).business !== undefined
    )
}

function isBusinessRecommendation(input: InputType): input is Recommendation {
    return (
        (input as Recommendation).thesis !== undefined &&
        (input as Recommendation).business !== undefined
    )
}

//helper functions for helping with timeout
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

async function retryWithExponentialBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts = 3,
    delay = 1000,
    factor = 2,
    maxDelay = 10000,
    nonRetryableErrors = ["TypeError"] // Error types that should not trigger a retry
): Promise<T> {
    let attempts = 0
    let error: Error

    while (attempts < maxAttempts) {
        try {
            return await fn()
        } catch (err) {
            error = err

            // If error type should not trigger a retry, throw immediately
            if (nonRetryableErrors.includes(err.name)) {
                throw error
            }

            attempts++
            if (attempts < maxAttempts) {
                const exponentialDelay = delay * Math.pow(factor, attempts)
                const cappedDelay = Math.min(exponentialDelay, maxDelay)

                await sleep(cappedDelay)
            }
        }
    }

    throw error
}

function createMessageContent(input: InputType): string {
    const tokenizer = new GPT3Tokenizer({ type: "gpt3" })

    if ("competencies" in input) {
        const query = input as Query
        return 'I want to acquire one or multiple businesses. I need a few theses to help me search for the potential acquisition targets. The following is the list of 6 criteria to consider when formulating my theses for acquiring businesses with the relative weight for each criteria: 1) The business should match my skillset (relative weight = 10), 2) I would be the most likely to succeed in that business given current macro trends and economic environment (relative weight = 8), 3) The business has good synergy with my professional history and current businesses (if any) (relative weight = 4), 4) I prefer businesses that I enjoy running because they are congruent with my likes, interests, and hobbies (relative weight = 2), 5) If possible, avoid my weaknesses and dislikes (relative weight = 2). The following is my skillset in order of competence: {{ competencies }}. The following are the professions I have worked in: {{ professionHistory }}. The following are my current businesses (if any): {{ previousAcquisitions }}. The following are my likes, interests, and hobbies (if any): {{ hobbies }}. The following are my weaknesses and dislikes (if any): {{ negativeCompetencies }}. Generate 10 theses as bullet points. Use at least 20 words for each thesis but no more than 50 words. Order them based on how strongly they match the criteria from the best match to the weakest. Additionally, for each thesis, provide two sets of rationales: 1- Why each thesis is relevant to me, referring to my skillset, my professional history and current businesses, alignment with my likes, interests and hobbies. Use at least 20 words but no more than 50 words. 2- Why a business that matches this thesis is well positioned to benefit from the current macro trends, economic forces, and US or global environment. Use at least 20 words but no more than 50 words. Return the theses as a JSON object in the following format [{"thesis": "<thesis>", "me": "<relevance_to_me>", "trends": "<trends>"}...]'
            .replace("{{ competencies }}", query.competencies)
            .replace("{{ professionHistory }}", query.professionHistory)
            .replace("{{ previousAcquisitions }}", query.previousAcquisitions)
            .replace("{{ hobbies }}", query.hobbies)
            .replace("{{ negativeCompetencies }}", query.negativeCompetencies)
    } else if ("property" in input) {
        const query = input as SocrateLandQuery

        return 'I want to acquire one or multiple commercial properties. I need a few theses to help me search for the potential acquisition targets. The following is the list of 5 criteria to consider when formulating my theses for acquiring businesses with the relative weight for each criteria: 1- My desired types of property (relative weight = 10), 2) 2- The property is the most likely to appreciate in value given current macro trends and economic environment (relative weight = 5), 3) I can successfully own, operate, and sell this property give my background and skillset (if any) (relative weight = 4), 4) The property aligns with my overall goals (relative weight = 4), 5) If possible, avoid my dislikes (relative weight = 3). The following is my desired types of property: {{ property }}. The following are my background and skillset: {{ skills }}. The following are my overall goals: {{ overall }}. The following are my dislikes (if any): {{ dislike }}. Generate 10 theses as bullet points. Use at least 20 words for each thesis but no more than 50 words. Order them based on how strongly they match the criteria from the best match to the weakest. Additionally, for each thesis, provide two sets of rationales: 1- Why each thesis will narrow my search of commercial properties to those that I can successfully own, operate and eventually sell. For each thesis refer to my relevant background and skillset, as well as alignment with my overall goals. Use at least 20 words but no more than 50 words. Write the relevance to me as sentences, not as a number. 2- Why a commercial property that matches this thesis is well positioned to benefit from the current macro trends, economic forces, and US or global environment. Use at least 20 words but no more than 50 words. Return the theses as a JSON object in the following format [{"thesis": "<thesis>", "me": "<relevance_to_me>", "trends": "<trends>"}...]'
            .replace("{{ property }}", query.property)
            .replace("{{ skills }}", query.skills)
            .replace("{{ overall }}", query.overall)
            .replace("{{ dislike }}", query.dislike)
    } else if (isLandRecommendation(input)) {
        // console.log("land recommendation")
        const query = input as LandRecommandation
        const encoded = tokenizer.encode(query.about)
        const truncatedTokens = encoded.bpe.slice(0, 1000)
        const truncatedDescription = tokenizer.decode(truncatedTokens)
        const hasQueryMe = query.me
        const hasQueryTrends = query.trends
        if (!hasQueryMe && !hasQueryTrends) {
            return 'Here is a description of a commercial property: The size of the land is {acres} acres, the asking price is {askingPrice}, the location is {location} and the description is {about}. Here is my thesis for buying it: {{ thesis }}  1. Write a summary of the property of length between 20 to 50 words. You must not mention the size of the property in the output. 2. Write a rationale for how this property fits the regional trends where the property is located. Format your output as a JSON object with the following format: {"summary": "<summary>","regional": "<regional>"}'
                .replace("{acres}", query.acres)
                .replace("{askingPrice}", query.askingPrice)
                .replace("{location}", query.location)
                .replace("{about}", truncatedDescription)
                .replace("{{ relevance to me }}", query.me)
                .replace("{{ relevance to trends }}", query.trends)
                .replace("{{ thesis }}", query.thesis)
        } else {
            return 'Here is a description of a commercial property: The size of the land is {acres} acres, the asking price is {askingPrice}, the location is {location} and the description is {about}. Here is my thesis for buying it: {{ thesis }} {{ relevance to me }} {{ relevance to trends }} 1. Write a summary of the property of length between 20 to 50 words. You must not mention the size of the property in the output. 2. Write a rationale for why this property matches my thesis, background and skills, and the macro trends described in the thesis. 3. Write a rationale for how this property fits the regional trends where the property is located. Format your output as a JSON object with the following format: {"summary": "<summary>", "rationale": "<rationale>" ,"regional": "<regional>"}'
                .replace("{acres}", query.acres)
                .replace("{askingPrice}", query.askingPrice)
                .replace("{location}", query.location)
                .replace("{about}", truncatedDescription)
                .replace("{{ relevance to me }}", query.me)
                .replace("{{ relevance to trends }}", query.trends)
                .replace("{{ thesis }}", query.thesis)
        }
    } else if (isBusinessRecommendation(input)) {
        console.log("Business recommendation")
        console.log(input)
        const query = input as Recommendation
        const encoded = tokenizer.encode(query.business)
        const truncatedTokens = encoded.bpe.slice(0, 1000)
        const truncatedDescription = tokenizer.decode(truncatedTokens)
        const hasQueryMe = query.me
        const hasQueryTrends = query.trends
        if (!hasQueryMe && !hasQueryTrends) {
            return 'Here is a description of a business: {description}. Here is my thesis for buying it,  the relevance to me, and relevance to macroeconomic trends: {thesis}. 1. Write a summary of the business of length between 20 to 50 words. Format your output as a JSON object with the following format: {"summary": "<summary>"}'
                .replace("{description}", truncatedDescription)
                .replace("{thesis}", query.thesis)
        } else {
            return 'Here is a description of a business: {description}. Here is my thesis for buying it, the relevance to me, and relevance to macroeconomic trends: {thesis}. 1. Write a summary of the business of length between 20 to 50 words. 2. Write a rationale for why this business matches my thesis, background and skills, and the macro trends described in the thesis. Format your output as a JSON object with the following format: {"summary": "<summary>", "rationale": "<rationale>"}'
                .replace("{description}", truncatedDescription)
                .replace("{thesis}", query.thesis)
        }
    } else if (isNewtonInputLand(input)) {
        // console.log("Newton Land")
        const {
            propertyName,
            propertyDescription,
            propertyType,
            propertyAcres
        } = input as NewtonLandInput
        const encoded = tokenizer.encode(propertyDescription)
        const truncatedTokens = encoded.bpe.slice(0, 1000)
        const truncatedDescription = tokenizer.decode(truncatedTokens)

        const lines = [
            `commercial property. The following are the property's name and description:`,
            `<<Commercial Property Name>>: ${propertyName}`,
            `<<Commercial Property  Description Start>>:`,
            `${truncatedDescription}`,
            `<<Commercial Property  Descrption End>>`,
            `<<Commercial Property  Type Start>>:`,
            `${propertyType}`,
            `<<Commercial Property  Type End>>`,
            `<<Commercial Property  Acres Start>>:`,
            `${propertyAcres}`,
            `<<Commercial Property  Acres End>>`,
            `I’ve already established that I like the property. I want to own this property. However, as final due diligence, I’d like to send the owner a list of items to produce to make sure I’m making a great acquisition. Can you create a list of 40 due diligence items that I can request from the seller?

            Format your output as a Markdown file so that I can easily read it. Do not output anything other than the markdown. Represent headings as layer 2 headings (##) and lists as ordered lists.
            `
        ]

        return lines.join("\n")
    } else {
        const {
            businessName,
            entityName,
            entityType,
            businessDescription,
            includedAssets,
            ownershipStructure,
            ownerNamesAndPercentages,
            liabilities
        } = input as NewtonInput
        const encoded = tokenizer.encode(businessDescription)
        const truncatedTokens = encoded.bpe.slice(0, 1000)
        const truncatedDescription = tokenizer.decode(truncatedTokens)

        const hasEntity = entityName && entityType
        const isEntityPurchase = false
        const ownershipStructureKnown = ownershipStructure !== ""
        const liabilitiesKnown = liabilities !== ""

        const lines = [
            `I’m in the final stages of buying a business. The following are the business’s name and description:`,
            `<<Business Name>>: ${businessName}`,
            `<<Business Description Start>>:`,
            `${truncatedDescription}`,
            `<<Business Descrption End>>`,
            hasEntity
                ? `The business is owned by a ${entityType} called ${entityName}.`
                : "The business is not owned by an entity.",
            isEntityPurchase
                ? "The purchase is for the entity, not the assets."
                : "The purchase is for the assets of the business, not the entity.",
            !isEntityPurchase
                ? `The assets included in the purchase are ${includedAssets}.`
                : "",
            ownershipStructureKnown
                ? `The ownership structure is ${ownershipStructure}.`
                : "The ownership structure is not known.",
            ownershipStructureKnown
                ? `The owners and their percentage ownership are ${ownerNamesAndPercentages}.`
                : "",
            liabilitiesKnown
                ? `So far I’ve found out the following liabilities of the company: ${liabilities}.`
                : "The liabilities are not known.",
            `I’ve already established that I like the company and its product. I want to own this business. However, as final due diligence, I’d like to send the company a list of items to produce to make sure I’m making a great acquisition. Can you create a list of 40 due diligence items that I can request from the company?`,
            `Break up the above 40 items as follows:`,
            `- The first 10 items are the most significant items that the company should provide to me to make sure I don’t have any major blind spots`,
            `- The next 15 items should be focused on financials, ownership structure, debt and liabilities, customer or client base, or related topics`,
            `- The next 5 items should be focused on people, contractors, team members, vendors and other relationships that are important to the operation of the business`,
            `- You pick remaining 10 items based on the specifics of the above business`,
            `Make sure the above 40 items are mutually exclusive but collectively exhaustive. Meaning, we shouldn’t ask the company for the same info twice, however, the info the we gather via the above 40 requests must collectively cover all aspects of this business. Make the due diligence items very specific to this business based on the information I provided above and avoid asking generic questions.`,
            `Format your output as a Markdown file so that I can easily read it. Do not output anything other than the markdown. Represent headings as layer 2 headings (##) and lists as ordered lists.`
        ]

        return lines.join("\n")
    }
}

async function updateTokensUsed(userId: string, tokens: number) {
    // Fetch the user's rate limit data.
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

export async function fetchChatCompletion(
    model: string,
    input: InputType,
    userId: string,
    maxAttempts = 2,
    delay = 1000,
    factor = 2
): Promise<Thesis[] | { result: string } | null> {
    const messages = [
        {
            role: "user",
            content: createMessageContent(input)
        }
    ]

    const url = "https://api.openai.com/v1/chat/completions"
    const apiKey = chooseOpenAiKey()
    const timeoutInMilliseconds = 6 * 60 * 1000 // 3 minutes

    const payload = {
        model,
        messages
    }

    const attempts = 0
    const parsedContent: Thesis[] | { result: string } | null = null

    const fetchCompletion = async (): Promise<
        Thesis[] | { result: string } | null
    > => {
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
        ])) as unknown as globalThis.Response

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        const totalTokensUsed = data.usage.total_tokens
            ? data.usage.total_tokens
            : 0

        await updateTokensUsed(userId, totalTokensUsed)

        const content = data.choices[0].message.content

        if ("competencies" in input) {
            return JSON.parse(content)
        } else if ("property" in input) {
            return JSON.parse(content)
                ? JSON.parse(content)
                : { result: content }
        } else {
            return { result: content }
        }
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

        if (model !== "gpt-3.5-turbo") {
            console.log("Retrying with gpt-3.5-turbo model.")
            return fetchChatCompletion("gpt-3.5-turbo", input, userId, 1)
        } else {
            return parsedContent
        }
    }
}
