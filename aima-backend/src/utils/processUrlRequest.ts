/* eslint-disable quotes */
import { ApifyClient } from "apify-client"
import { RateLimitModel } from "../models/RateLimit"
import { setRedis } from "../services/redis.service"
import { fetchChatCompletionSummary } from "./processUrlGenerator"

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN
})
const actorId = "aYG0l9s7dbB7j3gbS"

export const executeCrawl = async (url: string, userId: string): Promise<any> => {
    const input = {
        startUrls: [{ url: url }],
        crawlerType: "playwright:firefox",
        includeUrlGlobs: [] as any,
        excludeUrlGlobs: [] as any,
        maxCrawlDepth: 20,
        maxCrawlPages: 1,
        initialConcurrency: 0,
        maxConcurrency: 200,
        initialCookies: [] as any,
        proxyConfiguration: {
            useApifyProxy: true
        },
        requestTimeoutSecs: 60,
        dynamicContentWaitSecs: 10,
        maxScrollHeightPixels: 5000,
        removeElementsCssSelector:
            'nav, footer, script, style, noscript, svg,\n[role="alert"],\n[role="banner"],\n[role="dialog"],\n[role="alertdialog"],\n[role="region"][aria-label*="skip" i],\n[aria-modal="true"]',
        removeCookieWarnings: true,
        clickElementsCssSelector: '[aria-expanded="false"]',
        htmlTransformer: "readableText",
        readableTextCharThreshold: 100,
        aggressivePrune: false,
        debugMode: false,
        debugLog: false,
        saveHtml: false,
        saveMarkdown: true,
        saveFiles: false,
        saveScreenshots: false,
        maxResults: 9999999
    }
    console.log(url)

    const run = await retryWithDelay(
        () => client.actor(actorId).call(input),
        3,
        20000
    )

    if (!run || !run.defaultDatasetId) {
        throw new Error("Failed to get a valid response from the actor")
    }

    const { items } = await client.dataset(run.defaultDatasetId).listItems()

    let responseContent

    try {
        const summary = await fetchChatCompletionSummary(
            "gpt-4-0125-preview",
            items[0].text,
            userId
        )

        responseContent = { ...items[0], text: summary }
    } catch (error) {
        console.error(
            "GPT-4 Turbo summarization failed, using full text:",
            error
        )
        responseContent = items[0]
    }
    await updateTokensUsed(userId, 2000)

    return responseContent
}

const processUrlRequest = async (
    url: string,
    token: string,
    userId: string
): Promise<void> => {
    try {
        const responseContent = await executeCrawl(url, userId)
        
        await setRedis(token, JSON.stringify({
            status: "completed",
            progress: 100,
            response: [responseContent]
        }))
    } catch (error) {
        console.error(error)
        await setRedis(token, JSON.stringify({
            status: "error",
            progress: 100,
            error: error.message
        }))
    }
}

async function updateTokensUsed(userId: string, tokens: number) {
    const rateLimitData = await RateLimitModel.findOne({ userId })

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

const retryWithDelay = async (
    fn: () => Promise<any>,
    maxAttempts: number,
    delay: number
) => {
    let attempts = 0
    while (attempts < maxAttempts) {
        try {
            return await fn()
        } catch (error) {
            attempts++
            if (attempts >= maxAttempts) throw error
            await new Promise((resolve) => setTimeout(resolve, delay))
        }
    }
}

export default processUrlRequest
