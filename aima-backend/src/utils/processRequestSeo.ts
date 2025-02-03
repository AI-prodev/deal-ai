import { setRedis } from "../services/redis.service"
import { AdditionalInputProperties, SeoInput } from "../types/query"
import { fetchChatCompletionSeo } from "./seoGenerator"

export async function processRequestSeo(
    token: string,
    input: SeoInput & AdditionalInputProperties,
    userId: string
): Promise<void> {
    const parsedContent = await fetchChatCompletionSeo(
        "gpt-4-0125-preview",
        input,
        userId
    )

    if (parsedContent) {
        await setRedis(token, JSON.stringify({
            status: "completed",
            response: JSON.stringify(parsedContent),
            input
        }))
    } else {
        await setRedis(token, JSON.stringify({
            status: "error",
            error: "Failed to fetch chat completion after multiple attempts.",
            input
        }))
    }
}
