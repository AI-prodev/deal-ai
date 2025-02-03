import { QuestionGeneratorInput } from "../types/query"
import { setRedis } from "../services/redis.service"
import { fetchChatCompletionQuestionGenerator } from "./questionGenerator"

export async function processRequestQuestionGenerator(
    token: string,
    input: QuestionGeneratorInput,
    userId: string
): Promise<void> {
    const parsedContent = await fetchChatCompletionQuestionGenerator(
        "gpt-4-0125-preview",
        input,
        userId
    )

    if (parsedContent) {
        const { recommendText, replyText } = parsedContent

        await setRedis(token, JSON.stringify({
            status: "completed",
            response: JSON.stringify({
                recommendText: recommendText,
                replyText: replyText,
                prompt: input.prompt
            })
        }))
    } else {
        await setRedis(token, JSON.stringify({
            status: "error",
            error: "Failed to fetch chat completion after multiple attempts."
        }))
    }
}
