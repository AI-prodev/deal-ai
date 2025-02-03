import { AdditionalInputProperties, BenefitStackInput } from "../types/query"
import { setRedis } from "../services/redis.service"
import { fetchChatCompletionBenefitStack } from "./benefitStackGenerator"

export async function processRequestBenefitStack(
    token: string,
    input: BenefitStackInput & AdditionalInputProperties,
    userId: string
): Promise<void> {
    const parsedContent = await fetchChatCompletionBenefitStack(
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
