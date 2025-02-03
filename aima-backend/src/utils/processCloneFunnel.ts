/* eslint-disable quotes */
import { randomUUID } from "crypto"
import { putObject } from "../services/files.service"
import { IPage } from "../types/IPage"

import PageModel from "../models/page"
import { setRedis } from "../services/redis.service"

const processCloneFunnel = async (
    pages: any[],
    userId: string,
    oldFunnelId: string,
    newFunnelId: string,
    token: string,
): Promise<void> => {

    const pagePromises = pages.map(async (page) => {
        const { oldContentUrl, oldJsonUrl, funnelStep, projectId, title, path, thumbnailUrl, extraHead, extraBody } = page
        
        const newPage: IPage = new PageModel({
            user: userId,
            project: (!projectId || projectId === "default") ? undefined : projectId,
            funnel: newFunnelId,
            funnelStep,
            title,
            path,
            extraHead,
            extraBody
        })
        await newPage.save()

        let response = ''
        let jsonResponse = null
        response = await fetch(oldContentUrl).then(async re => {
            return await re.text().then(text => text.replace(new RegExp(oldFunnelId, 'g'), newFunnelId))
        })
        if (oldJsonUrl) {
            jsonResponse = await fetch(oldJsonUrl).then(async re => {
                return await JSON.parse(await re.text().then(jsonText => jsonText.replace(new RegExp(oldFunnelId, 'g'), newFunnelId))) 
            })
        }
        
        const pageKey = `${newPage._id}_${randomUUID()}.html`
        await putObject({
            Bucket: process.env.S3_PAGES_BUCKET,
            ContentType: "text/html",
            Key: pageKey,
            Body: response
        })
        const contentUrl = process.env.CLOUDFRONT_PAGES_PREFIX + "/" + pageKey

        let jsonUrl = undefined
        if (jsonResponse) {
            const jsonKey = `${newPage._id}_${randomUUID()}.json`
            await putObject({
                Bucket: process.env.S3_PAGES_BUCKET,
                ContentType: "application/json",
                Key: jsonKey,
                Body: JSON.stringify(jsonResponse)
            })
            jsonUrl = process.env.CLOUDFRONT_PAGES_PREFIX + "/" + jsonKey
        }
        newPage.thumbnailUrl = thumbnailUrl
        newPage.contentUrl = contentUrl
        newPage.jsonUrl = jsonUrl
        await newPage.save()
    })
    
    await Promise.all(pagePromises)

    await setRedis(token, JSON.stringify({
        status: "completed",
        input: pages
    }))
    
}

export default processCloneFunnel