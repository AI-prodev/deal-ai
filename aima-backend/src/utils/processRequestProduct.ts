import { setRedis } from "../services/redis.service"
import { AdditionalInputProperties, ProductInput } from "../types/query"
import { fetchChatCompletionProduct } from "./productGenerator"

export async function processRequestProduct(
    token: string,
    input: ProductInput & AdditionalInputProperties,
    userId: string
): Promise<void> {
    const parsedContent = await fetchChatCompletionProduct(
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
