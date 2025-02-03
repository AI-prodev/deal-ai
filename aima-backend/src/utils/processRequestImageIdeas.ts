import { ImageIdeasInput } from "../types/query"
import { setRedis } from "../services/redis.service"

import { fetchChatCompletionImageIdeas } from "./imageIdeasGenerator"

type InputType = ImageIdeasInput

export async function processRequestImageIdeas(
    token: string,
    input: InputType,
    userId: string
): Promise<void> {
    const parsedContent = await fetchChatCompletionImageIdeas(
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
