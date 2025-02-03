import OpenAI from "openai"
import ModerationEvent from "../models/moderationEvent"
import { chooseOpenAiKey } from "./chooseOpenAiKey"

export const moderate = async (
    input: string,
    userId: string
): Promise<void> => {
    const openai = new OpenAI({
        apiKey: chooseOpenAiKey()
    })

    let moderation

    try {
        moderation = await openai.moderations.create({ input })
    } catch (error) {
        await new ModerationEvent({
            user: userId,
            input: input,
            flags: "Unable to moderate content due to" + error
        }).save()
        console.error("Unable to moderate content", error)
        return
    }

    if (moderation.results[0].flagged) {
        await new ModerationEvent({
            user: userId,
            input: input,
            flags: moderation.results[0].categories
        }).save()

        throw new Error(
            "Your request has been flagged for moderation as it may be against our content policies. Feel free to amend your request and try again."
        )
    }
}
