import { setRedis } from "../services/redis.service"
import { AdditionalInputProperties, FaqInput } from "../types/query"
import { fetchChatCompletionFaq } from "./faqGenerator"

export async function processRequestFaq(
    token: string,
    input: FaqInput & AdditionalInputProperties,
    userId: string
): Promise<void> {
    const parsedContent = await fetchChatCompletionFaq(
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
