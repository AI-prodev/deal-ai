import { Query, SocrateLandQuery } from "../types/query"
import { fetchChatCompletion } from "./fetchChatCompletion"
import { NewtonInput, NewtonLandInput } from "../types/newTonTypes"
import { LandRecommandation, Recommendation } from "../types/apolloType"
import { setRedis } from "../services/redis.service"

type InputType =
    | Query
    | NewtonInput
    | NewtonLandInput
    | SocrateLandQuery
    | LandRecommandation
    | Recommendation

export async function processRequest(
    token: string,
    input: InputType,
    userId: string
): Promise<void> {
    const parsedContent = await fetchChatCompletion("gpt-4", input, userId)
    //const parsedContent = await fetchChatCompletion("gpt-3.5-turbo", input)

    if (parsedContent) {
        await setRedis(token, JSON.stringify({
            status: "completed",
            response: JSON.stringify(parsedContent)
        }))
    } else {
        await setRedis(token, JSON.stringify({
            status: "error",
            error: "Failed to fetch chat completion after multiple attempts."
        }))
    }
}
