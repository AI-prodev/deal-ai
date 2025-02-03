import { AdditionalInputProperties, MarketingHooksInput } from "../types/query"
import { setRedis } from "../services/redis.service"
import { fetchChatCompletionMarketingHooks } from "./marketingHooksGenerator"

export async function processRequestMarketing(
    token: string,
    input: MarketingHooksInput & AdditionalInputProperties,
    userId: string
): Promise<void> {
    const parsedContent = await fetchChatCompletionMarketingHooks(
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
        setRedis(token, JSON.stringify({
            status: "error",
            error: "Failed to fetch chat completion after multiple attempts.",
            input
        }))
    }
}
