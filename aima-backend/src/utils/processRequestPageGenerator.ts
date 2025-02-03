import { randomUUID } from "crypto"
import { PageGeneratorInput } from "../types/query"
import PageModel from "../models/page"
import { putObject } from "../services/files.service"
import { setRedis } from "../services/redis.service"
import { fetchChatCompletionPageGenerator } from "./pageGenerator"
import { randomString } from "./random"

type InputType = PageGeneratorInput

function splitString(str: string): string[] {
    const strToken = str.split(" ")
    const middleIndex = Math.round(strToken.length / 2)
    const str1 = strToken.slice(0, middleIndex).join(" ")
    const str2 = strToken.slice(middleIndex).join(" ")
    return [str1, str2]
}

export async function generateRandomPath(funnelId?: string): Promise<string | null> {
    let tries = 0
    while (tries < 10) {
        const path = randomString(10)
        const condition = { path } as any
        if (funnelId) {
            condition.funnel = funnelId
        }
        const existingPage = await PageModel.findOne(condition).lean().exec()
        if (!existingPage) {
            return path
        }
        tries++
    }
    return null
}

export async function processRequestPageGenerator(
    token: string,
    title: string,
    input: InputType,
    userId: string,
    projectId?: string,
    funnelId?: string
): Promise<void> {
    const parsedContent = await fetchChatCompletionPageGenerator(
        "gpt-4-0125-preview",
        input,
        userId
    )
    if (parsedContent) {
        const [title1, title2] = splitString(parsedContent.hero_text)
        const [followUp1, followUp2] = splitString(parsedContent.follow_up)

        const defaultTemplateUrl = "https://prod-dealai-templates.s3.us-east-2.amazonaws.com/default_template.html"

        let content = await (await fetch(defaultTemplateUrl)).text()
        content = content
            .replace(/%%%hero_text_1%%%/g, title1)
            .replace(/%%%hero_text_2%%%/g, title2)
            .replace(/%%%follow_up_1%%%/g, followUp1)
            .replace(/%%%follow_up_2%%%/g, followUp2)

        const { fileUrl } = await putObject({
            Bucket: process.env.S3_PAGES_BUCKET,
            ContentType: "text/html",
            Key: `${randomUUID()}.html`,
            Body: content
        })

        const path = await generateRandomPath()
        if (!path) {
            await setRedis(token, JSON.stringify({
                status: "error",
                error: "Failed create a page path.",
            }))
            return
        }

        const newPage = {
            fields: parsedContent,
            input,
            user: userId,
            contentUrl: fileUrl,
            path,
            title
        } as any
        if (projectId && funnelId) {
            newPage.project = projectId
            newPage.funnel = funnelId
            newPage.funnelStep = 1
            
            const pages = await PageModel.find({ funnel: funnelId }).exec()
            if (pages) {
                newPage.funnelStep = pages.length + 1
            }
        }

        const { _id } = await PageModel.create(newPage)

        await setRedis(token, JSON.stringify({
            status: "completed",
            response: JSON.stringify({ pageId: _id })
        }))
    } else {
        await setRedis(token, JSON.stringify({
            status: "error",
            error: "Failed to fetch chat completion after multiple attempts."
        }))
    }
}
