import { AdditionalInputProperties, MarketingHooksInput } from "../types/query"
import { deleteRedis, getRedis, setRedis } from "../services/redis.service"
import { fetchChatCompletionAbandonedCart } from "./abandonedCartGenerator"
import { fetchChatCompletionBusinessToTopic } from "./businessToTopicGenerator"
import { getNewsForTopic } from "./processNewsRequest"
import { fetchChatCompletionBroadcast } from "./broadcastGenerator"
import util from "util"
import crypto from "crypto"
import { fetchChatCompletionRelevantArticles } from "./relevantArticlesGenerator"

export async function processRequestEmailAbandonedCart(
    token: string,
    input: MarketingHooksInput & AdditionalInputProperties,
    userId: string
): Promise<void> {
    const parsedContent = await fetchChatCompletionAbandonedCart(
        "gpt-4-0125-preview",
        input,
        userId
    )

    if (parsedContent) {
        await setRedis(
            token,
            JSON.stringify({
                status: "completed",
                response: JSON.stringify(parsedContent),
                input
            })
        )
    } else {
        await setRedis(
            token,
            JSON.stringify({
                status: "error",
                error: "Failed to fetch chat completion after multiple attempts.",
                input
            })
        )
    }
}

const sha256 = (s: string) =>
    crypto.createHash("sha256").update(s).digest("hex")

export async function processRequestEmailBroadcast(
    token: string,
    input: MarketingHooksInput & AdditionalInputProperties,
    userId: string
): Promise<void> {
    let continueWithCache = true

    let topic = await getRedis(
        `broadcast-businessToTopic:${sha256(
            input.businessDescription + input.language
        )}`
    )

    if (!topic) {
        continueWithCache = false

        topic = await fetchChatCompletionBusinessToTopic(
            "gpt-4-0125-preview",
            input,
            userId
        )
        await setRedis(
            `broadcast-businessToTopic:${sha256(
                input.businessDescription + input.language
            )}`,
            topic,
            600
        )
    } else {
        console.log("Topic found in cache")
    }

    console.log("Topic")
    console.log(util.inspect(topic, { maxStringLength: null }))

    let parsedTopic: any[]

    try {
        parsedTopic = JSON.parse(topic)
    } catch (e) {
        await deleteRedis(
            `broadcast-businessToTopic:${sha256(
                input.businessDescription + input.language
            )}`
        )

        await setRedis(
            token,
            JSON.stringify({
                status: "error",
                error: "Couldn't get latest news topics, please try again.",
                input
            })
        )

        return
    }

    let news

    if (continueWithCache) {
        news = await getRedis(
            `broadcast-topicToNews:${sha256(topic + input.language)}`
        )
    }

    if (!news) {
        continueWithCache = false

        try {
            news = await getNewsForTopic(parsedTopic, userId, input.language)
            await setRedis(
                `broadcast-topicToNews:${sha256(topic + input.language)}`,
                news,
                600
            )
        } catch (e) {
            await deleteRedis(
                `broadcast-businessToTopic:${sha256(
                    input.businessDescription + input.language
                )}`
            )

            await setRedis(
                token,
                JSON.stringify({
                    status: "error",
                    error:
                        "Couldn't get the latest news, please try again later.",
                    input
                })
            )

            return
        }
    } else {
        console.log("News found in cache")
    }

    //console.log("News")
    //console.log(util.inspect(news, { maxStringLength: null }))

    let parsedNews: any[]

    try {
        parsedNews = JSON.parse(news)
    } catch (e) {
        await deleteRedis(
            `broadcast-businessToTopic:${sha256(
                input.businessDescription + input.language
            )}`
        )

        await deleteRedis(
            `broadcast-topicToNews:${sha256(topic + input.language)}`
        )

        await setRedis(
            token,
            JSON.stringify({
                status: "error",
                error: "Couldn't get latest news, please try again.",
                input
            })
        )

        return
    }

    const headlines = parsedNews
        .map(
            (
                article: { title: string; body?: string; url: string },
                index: number
            ) => {
                return `${index}: "${article.title}"`
            }
        )
        .join("\n")

    //console.log("Headlines")
    //console.log(util.inspect(headlines, { maxStringLength: null }))

    if (headlines?.length == 0) {
        await deleteRedis(
            `broadcast-businessToTopic:${sha256(
                input.businessDescription + input.language
            )}`
        )

        await deleteRedis(
            `broadcast-topicToNews:${sha256(topic + input.language)}`
        )

        await setRedis(
            token,
            JSON.stringify({
                status: "error",
                error: "Couldn't get news headlines, please try again.",
                input
            })
        )

        return
    }

    let articleIndexes

    if (continueWithCache) {
        articleIndexes = await getRedis(
            `broadcast-articleIndexes:${sha256(
                news + input.businessDescription
            )}`
        )
    }

    if (!articleIndexes) {
        continueWithCache = false

        articleIndexes = await fetchChatCompletionRelevantArticles(
            "gpt-4-0125-preview",
            input,
            userId,
            headlines
        )
        await setRedis(
            `broadcast-articleIndexes:${sha256(
                news + input.businessDescription
            )}`,
            articleIndexes,
            600
        )
    } else {
        console.log("Article indexes found in cache")
    }

    let parsedArticleIndexes: number[]

    try {
        parsedArticleIndexes = JSON.parse(articleIndexes)
    } catch (e) {
        await deleteRedis(
            `broadcast-businessToTopic:${sha256(
                input.businessDescription + input.language
            )}`
        )

        await deleteRedis(
            `broadcast-topicToNews:${sha256(topic + input.language)}`
        )

        await deleteRedis(
            `broadcast-articleIndexes:${sha256(
                news + input.businessDescription
            )}`
        )

        await setRedis(
            token,
            JSON.stringify({
                status: "error",
                error: "Couldn't get relevant news, please try again.",
                input
            })
        )

        return
    }

    //console.log("Article Indexes")
    //console.log(util.inspect(articleIndexes, { maxStringLength: null }))

    if (parsedArticleIndexes?.length == 0) {
        await setRedis(
            token,
            JSON.stringify({
                status: "error",
                error: "Couldn't find relevant news, please try again.",
                input
            })
        )

        return
    }

    const filteredArticles = parsedArticleIndexes.map(
        (index: number) => parsedNews[index]
    )

    //console.log("Filtered Articles")
    //console.log(util.inspect(filteredArticles, { maxStringLength: null }))

    const article = JSON.stringify(
        filteredArticles[Math.floor(Math.random() * filteredArticles.length)]
    )

    console.log("Article")
    console.log(util.inspect(article, { maxStringLength: null }))

    const parsedContent = await fetchChatCompletionBroadcast(
        "gpt-4-0125-preview",
        input,
        userId,
        article
    )

    console.log("Parsed Content")
    console.log(util.inspect(parsedContent, { maxStringLength: null }))

    if (parsedContent) {
        await setRedis(
            token,
            JSON.stringify({
                status: "completed",
                response: JSON.stringify(parsedContent),
                input
            })
        )
    } else {
        await setRedis(
            token,
            JSON.stringify({
                status: "error",
                error: "Couldn't create the news broadcast, please try again.",
                input
            })
        )
    }
}
