import { RateLimitModel } from "../models/RateLimit"

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

type KeywordQuery = {
    keyword: string
    keywordLoc: "body"
}

type Query = {
    $query: {
        $and: [
            {
                $or: KeywordQuery[]
            },
            {
                dateStart: string
                dateEnd: string
                lang: string
            }
        ]
    }
}

export async function getNewsForTopic(
    topic: string[],
    userId: string,
    lang: string,
    maxAttempts = 2,
    delay = 1000,
    factor = 2
): Promise<any> {
    const getLanguageIsoCode = (language: string): string => {
        const isoCodes: { [key: string]: string } = {
          "Arabic": "ara",
          "Danish": "dan",
          "Dutch": "nld",
          "English": "eng",
          "French": "fra",
          "German": "deu",
          "Greek": "ell",
          "Indonesian": "ind",
          "Italian": "ita",
          "Japanese": "jpn",
          "Mandarin": "zho", 
          "Portuguese": "por",
          "Russian": "rus",
          "Spanish": "spa",
        };
      
        return isoCodes[language] || "eng"; 
      };

    const getIsoDate = (daysAgo: number = 0): string => {
        const currentDate = new Date()
        currentDate.setDate(currentDate.getDate() - daysAgo)

        const year = currentDate.getFullYear()
        const month = currentDate.getMonth() + 1
        const day = currentDate.getDate()

        const formattedMonth = month < 10 ? "0" + month : month.toString()
        const formattedDay = day < 10 ? "0" + day : day.toString()

        return `${year}-${formattedMonth}-${formattedDay}`
    }

    function createQuery(keywords: string[]): Query {
        const keywordQueries = keywords.map((keyword) => ({
            keyword: keyword,
            keywordLoc: "body" as const
        }))

        const query: Query = {
            $query: {
                $and: [
                    {
                        $or: keywordQueries
                    },
                    {
                        dateStart: getIsoDate(7),
                        dateEnd: getIsoDate(),
                        lang: getLanguageIsoCode(lang)
                    }
                ]
            }
        }

        return query
    }

    const url = new URL("https://newsapi.ai/api/v1/article/getArticles")

    url.search = new URLSearchParams({
        query: JSON.stringify(createQuery(topic)),
        resultType: "articles",
        articlesSortBy: "rel",
        apiKey: process.env.NEWSAPI_API_KEY || ""
    }).toString()

    const timeoutInMilliseconds = 3 * 60 * 1000 // 3 minutes

    const fetchNews = async (): Promise<any> => {
        const response = await Promise.race([
            fetch(url.toString(), {
                method: "GET"
            }),
            new Promise<Response>((_, reject) =>
                setTimeout(
                    () => reject(new Error("Request timed out")),
                    timeoutInMilliseconds
                )
            )
        ])

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        if (!data.articles) {
            throw new Error("Unexpected response structure")
        }

        // TODO: determine cost of call and update tokens used
        // await updateTokensUsed(userId, data.usage.total_tokens)

        const content = data.articles.results
            .map(
                (article: {
                    title: string
                    body?: string
                    url: string
                }) => ({
                    title: article.title,
                    body: article.body,
                    url: article.url
                })
            )

        return JSON.stringify(content)
    }

    try {
        return await retryWithExponentialBackoff(
            fetchNews,
            maxAttempts,
            delay,
            factor
        )
    } catch (error) {
        console.error(`All ${maxAttempts} attempts failed:`, error)

        throw error
    }
}
