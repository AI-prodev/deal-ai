import { BonusStackInput } from "../types/query"
import { setRedis } from "../services/redis.service"

import { fetchChatCompletionBonusStack } from "./bonusStackGenerator"

type InputType = BonusStackInput

export async function processRequestBonusStack(
    token: string,
    input: InputType,
    userId: string
): Promise<void> {
    const parsedContent = await fetchChatCompletionBonusStack(
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
