/* eslint-disable quotes */
import { ApifyClient } from "apify-client"
import { randomUUID } from "crypto"
import { putObject } from "../services/files.service"
import { IPage } from "../types/IPage"
import { takeScreenshot } from "./screenshot"

import PageModel from "../models/page"
import FunnelModel from "../models/funnel"
import { setRedis } from "../services/redis.service"

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN
})

const actorId = "Z7nfd7WcpMxhdkNo6"

function getBaseUrl(templateContentUrl: string) {
    const url = new URL(templateContentUrl)
    return `${url.protocol}//${url.host}`
}

function getProtocol(templateContentUrl: string) {
    const url = new URL(templateContentUrl)
    return url.protocol
}

function addProxies(content: string, templateContentUrl: string) {
    const tagUrlRegex = /<\s*(?:link[^>]*?href|img[^>]*?src|source[^>]*?srcset|meta[^>]*?content)\s*=\s*["'](.*?)["']/g
    const cssUrlRegex = /url\(["']?(http.*?)["']?\)/g

    const replaceWithProxyUrl = (match: string, originalUrl: string) => {
        if (originalUrl.startsWith("http")) {
            const proxyUrl = `/page/proxy/${encodeURIComponent(originalUrl)}`
            return match.replace(originalUrl, proxyUrl)
        } else if (originalUrl.startsWith("//")) { // //deal.ai/assets/lander.css
            const protocol = getProtocol(templateContentUrl)
            const proxyUrl = `/page/proxy/${encodeURIComponent(`${protocol}${originalUrl}`)}`
            return match.replace(originalUrl, proxyUrl)
        } else if (originalUrl.startsWith("/")) {
            let baseUrl = getBaseUrl(templateContentUrl)
            if (baseUrl.endsWith("/")) {
                baseUrl = baseUrl.substring(0, baseUrl.length - 1)
            }
            const proxyUrl = `/page/proxy/${encodeURIComponent(`${baseUrl}${originalUrl}`)}`
            return match.replace(originalUrl, proxyUrl)
        } else {
            return match
        }
    }

    return content
        .replace(/&quot;/g, "'")
        .replace(tagUrlRegex, replaceWithProxyUrl)
        .replace(cssUrlRegex, replaceWithProxyUrl)
}

const processCrawlUrlRequest = async (
    token: string,
    input: any,
    userId: string
): Promise<void> => {
    let newPageId = null
    try {
        const { templateContentUrl, templateJsonUrl, isTemplate, isCustomerForm, funnelId, projectId, title, path, cta, businessLogoUrl, businessEmail, businessPhoneNumber, companyAddress, images, images2, logoUrl, logoUrl2, extraHead, extraBody, isSecondPage } = input

        const funnel = await FunnelModel.findOne({ _id: funnelId, user: userId })
        if (!funnel) {
            throw new Error("Invalid funnel")
        }

        const existingPages = await PageModel.find({ funnel: funnel._id }).lean().exec()

        const numSteps = existingPages.length

        if (numSteps > 100) {
            throw new Error("Too many funnel steps")
        }

        if (existingPages.find(p => p.path === (path || ""))) {
            throw new Error("Page with same path already exists for this funnel")
        }

        const newPage: IPage = new PageModel({
            user: userId,
            project: (!projectId || projectId === "default") ? undefined : projectId,
            funnel: funnelId,
            funnelStep: numSteps + 1,
            title: title,
            path: path || "",
            extraHead: extraHead,
            extraBody: extraBody,
        })
        await newPage.save()
        newPageId = newPage._id

        let response = ''
        let jsonResponse: any | null = null
        if (isTemplate) {
            response = await fetch(templateContentUrl).then(async re => await re.text())
            if (templateJsonUrl) {
                jsonResponse = await fetch(templateJsonUrl).then(async re => await re.text())
            }

            // replace content with prompt of funnel
            if (funnel.prompt) {
                const { input, magic, faq, bonus, benefitStack, hero, businessDesc } = funnel.prompt

                response = response
                    .replace(/%%%COMPANY_NAME%%%/g, input.businessName)
                    .replace(/%%%company_name%%%/g, input.businessName)
                if (jsonResponse) {
                    jsonResponse = jsonResponse.replace(/%%%COMPANY_NAME%%%/g, input.businessName)
                        .replace(/%%%company_name%%%/g, input.businessName)
                }
                if (!isSecondPage) {
                    if (businessLogoUrl) {
                        const regex = new RegExp(logoUrl, "g")
                        const regex2 = new RegExp(logoUrl2, "g")
                        response = response
                            .replace(regex, businessLogoUrl)
                            .replace(regex2, businessLogoUrl)
                        if (jsonResponse) {
                            jsonResponse = jsonResponse.replace(regex, businessLogoUrl)
                                .replace(regex2, businessLogoUrl)
                        }
                    }

                    if (magic?.length > 0) {
                        response = response.replace(/%%%NEG_MAGIC_HOOK1%%%/, magic[0])
                        response = response.replace(/%%%POS_MAGIC_HOOK2%%%/, (magic[1] && (magic[1] != "undefined")) ? magic[1] : "")
                        if (jsonResponse) {
                            jsonResponse = jsonResponse.replace(/%%%NEG_MAGIC_HOOK1%%%/, magic[0])
                            jsonResponse = jsonResponse.replace(/%%%POS_MAGIC_HOOK2%%%/, (magic[1] && (magic[1] != "undefined")) ? magic[1] : "")
                        }
                    }
                    response = response
                        .replace(/%%%BUSINESS_DESC_TITLE%%%/, businessDesc[0])
                        .replace(/%%%BUSINESS_DESC_DETAIL%%%/, businessDesc[1])
                    if (jsonResponse) {
                        jsonResponse = jsonResponse.replace(/%%%BUSINESS_DESC_TITLE%%%/, businessDesc[0])
                            .replace(/%%%BUSINESS_DESC_DETAIL%%%/, businessDesc[1])
                    }
                    if (cta) {
                        response = response.replace(/%%%CTA%%%/g, cta)
                        if (jsonResponse) {
                            jsonResponse = jsonResponse.replace(/%%%CTA%%%/g, cta)
                        }
                    }
                    if (hero?.length > 0 && images?.length > 0) {
                        for (let i = 0; i < images?.length; i++) {
                            if (hero[i]) {
                                const regex = new RegExp(images[i].url, "g")
                                response = response.replace(regex, hero[i].url)
                                if (jsonResponse) {
                                    jsonResponse = jsonResponse.replace(regex, hero[i].url)
                                }
                            }
                        }
                    }
                    if (benefitStack?.length > 0) {
                        if (benefitStack.length < 6) {
                            const idArray = ["icj1mi", "ix3n2u", "iusq46", "i9hqgr", "irol0e", "il0w7x"]
                            for (let i = benefitStack.length; i < idArray.length; i++) {
                                const regex = new RegExp(
                                    '<div id="' + idArray[i] + '" (.*?)</div>',
                                    "g"
                                )
                                response = response.replace(regex, "")

                                const regexJson = new RegExp(
                                    (i === 3 ? '' : ',') + '{"name":"Cell","draggable":".gjs-row","stylable-require":\\["flex-basis"],"unstylable":\\["width"],"resizable":{"tl":0,"tc":0,"tr":0,"cl":0,"cr":1,"bl":0,"br":0,"minDim":1,"bc":0,"currentUnit":1,"step":0.2,"keyWidth":"flex-basis"},"classes":\\[{"name":"gjs-cell","private":1}],"attributes":{"id":"' + idArray[i] + '"}(.*?)%%%BENEFIT_STACK_' + (i + 1) + '_DESC%%%"}]}]}',
                                    "g"
                                )
                                if (jsonResponse) {
                                    jsonResponse = jsonResponse.replace(regexJson, "")
                                }
                            }
                        }
                        benefitStack.map(({ n, a }, index) => {
                            if (index < 6) {
                                // content
                                response = response
                                    .replace(`%%%BENEFIT_STACK_${index + 1}_TITLE%%%`, n)
                                    .replace(`%%%BENEFIT_STACK_${index + 1}_DESC%%%`, a)

                                // json
                                if (jsonResponse) {
                                    jsonResponse = jsonResponse.replace(`%%%BENEFIT_STACK_${index + 1}_TITLE%%%`, n)
                                        .replace(`%%%BENEFIT_STACK_${index + 1}_DESC%%%`, a)
                                }
                            }
                        })
                    }
                    if (bonus) {
                        bonus.map(({ b, r }, index) => {
                            if (index < 6) {
                                // content
                                response = response
                                    .replace(`%%%SERVICE_${index + 1}_TITLE%%%`, b)
                                    .replace(`%%%SERVICE_${index + 1}_DESC%%%`, r)

                                // json
                                if (jsonResponse) {
                                    jsonResponse = jsonResponse.replace(`%%%SERVICE_${index + 1}_TITLE%%%`, b)
                                        .replace(`%%%SERVICE_${index + 1}_DESC%%%`, r)
                                }
                            }
                        })
                    }
                    if (faq) {
                        let pluginCode = ""
                        faq.map(({ q, a }, index) => {
                            const i = index + 1
                            const regexQ = new RegExp(
                                '%%%FAQ_' + i + '_QUESTION%%%',
                                "g"
                            )
                            const regexA = new RegExp(
                                '%%%FAQ_' + i + '_ANSWER%%%',
                                "g"
                            )
                            // content
                            response = response
                                .replace(regexQ, q)
                                .replace(regexA, a)

                            // json
                            if (jsonResponse) {
                                jsonResponse = jsonResponse.replace(regexQ, q)
                                    .replace(regexA, a)
                            }

                            pluginCode += `<button class="accordion">${faq[index].q}</button>\n<div class="panel">\n  <p>${faq[index].a}</p>\n</div>\n`
                        })
                        response = response
                            .replace(/<button class=\\"accordion\\">%%%FAQ_1_QUESTION%%%.*?\\n\\n/g, pluginCode)

                        for (let i = faq.length; i < 10; i++) {
                            response = response.replace(/<button type="button" class="accordion">%%%FAQ_(.*?)_ANSWER%%%/g, "")

                            // json
                            const regex1 = new RegExp(
                                ',{"type":"button","classes":\\["accordion"],"attributes":{"type":"button"},"text":"%%%FAQ_' + (i + 1) + '_QUESTION.*?_ANSWER%%%"}]}]}',
                                "g"
                            )
                            const regex2 = new RegExp(
                                ',{"type":"button","classes":\\["accordion"],"attributes":{"type":"button"},"text":"%%%FAQ_' + (i + 1) + '_QUESTION.*?_ANSWER%%%  "}]}]}',
                                "g"
                            )
                            if (jsonResponse) {
                                jsonResponse = jsonResponse.replace(regex1, "").replace(regex2, "")
                            }
                        }
                    }
                    if (isCustomerForm === "No") {
                        // Remove a customer form
                        if (jsonResponse) {
                            jsonResponse = await JSON.parse(jsonResponse)

                            let zId = ""
                            let formZId = ""
                            Object.keys(jsonResponse.zones).forEach(zoneId => {
                                const value = jsonResponse.zones[zoneId]
                                if (value.some && value.some((val: any) => val.type === "EmailForm")) {
                                    formZId = zoneId
                                }
                            });
                            Object.keys(jsonResponse.zones).forEach(zoneId => {
                                const value = jsonResponse.zones[zoneId]
                                if (value.some && value.some((val: any) => val.props?.id === formZId.split(":")[0])) {
                                    zId = zoneId
                                }
                            })

                            if (zId) {
                                // remove content
                                delete jsonResponse.zones[formZId]
                                delete jsonResponse.zones[zId]

                                // remove content
                                jsonResponse.content.filter((value: any) => value.props?.id !== (zId.split(":"))[0])
                            }
                            jsonResponse = JSON.stringify(jsonResponse)
                        }
                    }
                    if (companyAddress) {
                        response = response.replace("q=Toronto", `q=${companyAddress}`)

                        if (jsonResponse) {
                            jsonResponse = jsonResponse.replace("q=Toronto", `q=${companyAddress}`)
                        }
                    }
                } else {
                    if (businessLogoUrl) {
                        const regex = new RegExp(logoUrl, "g")
                        const regex2 = new RegExp(logoUrl2, "g")
                        response = response
                            .replace(regex, businessLogoUrl)
                            .replace(regex2, businessLogoUrl)
                        if (jsonResponse) {
                            jsonResponse = jsonResponse.replace(regex, businessLogoUrl)
                                .replace(regex2, businessLogoUrl)
                        }
                    }

                    if (hero?.length > images2?.length) {
                        const imagesLength = images.length + images2.length
                        for (let i = images.length; i < imagesLength; i++) {
                            if (hero[i]) {
                                const regex = new RegExp(images2[i - images.length].url, "g")
                                response = response?.replace(regex, hero[i].url)
                                if (jsonResponse) {
                                    jsonResponse = jsonResponse.replace(regex, hero[i].url)
                                }
                            }
                        }
                    }
                }
                response = response.replace(/%%%company_address%%%/g, companyAddress ? companyAddress : "company address")
                response = response.replace(/%%%company_email%%%/g, businessEmail ? businessEmail : "email@company.com")
                response = response.replace(/%%%company_phone%%%/g, businessPhoneNumber ? businessPhoneNumber : "555-555-5555")
                if (jsonResponse) {
                    jsonResponse = jsonResponse.replace(/%%%company_address%%%/g, companyAddress ? companyAddress : "company address")
                    jsonResponse = jsonResponse.replace(/%%%company_email%%%/g, businessEmail ? businessEmail : "email@company.com")
                    jsonResponse = jsonResponse.replace(/%%%company_phone%%%/g, businessPhoneNumber ? businessPhoneNumber : "555-555-5555")
                }

            }

            if (jsonResponse) jsonResponse = JSON.parse(jsonResponse)

            if (extraBody && jsonResponse) {
                const body = extraBody.replace(/\n/g, '')
                const styleContent = body.match(/<style.*?>(.*?)<\/style>/s)[1]
                const stylesArray = styleContent.split('}')

                const json: any = []
                if (stylesArray.length > 1) {
                    stylesArray.map((sa: any) => {
                        const item = sa.split('{')
                        const classStyles: any = {}
                        if (item.length > 1) {
                            item[1].split(';').forEach((style: any) => {
                                const [property, value] = style.split(':').map((s: any) => s.trim())
                                if (property && value) {
                                    classStyles[property] = value
                                }
                            })
                            const jsonItem = {
                                "selectors": [
                                    {
                                        "name": item[0].trim().replace('.', ''),
                                        "private": 1
                                    }
                                ],
                                "style": classStyles
                            }
                            json.push(jsonItem)
                        }
                    })

                    jsonResponse.styles = [...jsonResponse.styles, ...json]
                }
            }
        } else {
            const apifyInput = {
                "maxRequestRetries": 5,
                "proxyConfiguration": {
                    "useApifyProxy": true
                },
                "requestListSources": [{
                    url: templateContentUrl
                }],
                "useChrome": false,
                "handlePageTimeoutSecs": 60
            }

            const run = await client.actor(actorId).call(apifyInput)

            if (!run || !run.defaultDatasetId) {
                throw new Error("Failed to get a valid response from the actor")
            }

            const { items } = await client.dataset(run.defaultDatasetId).listItems()
            response = items[0].fullHtml as string
        }

        let cleanedContent = response

        if (!isTemplate) {
            cleanedContent = cleanedContent
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gm, "") // remove <script> tags
                .replace(/<link rel="canonical" href="[^"]*"[\s]*\/?>/i, '')
                .replace(/'\\'/gm, "''")
                .replace(/\(1fr\)\[(\d)?\]/gm, (_, p) => `repeat(${p}, 1fr)`)
                .replace(/\$[a-zA-Z0-9_:]+\$px/gm, "0px")
                .replace(/[:];/gm, ":0;")
                .replace(/:}/gm, ':none;}')

            cleanedContent = addProxies(cleanedContent, templateContentUrl)
        }

        const pageKey = `${newPage._id}_${randomUUID()}.html`
        await putObject({
            Bucket: process.env.S3_PAGES_BUCKET,
            ContentType: "text/html",
            Key: pageKey,
            Body: cleanedContent
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

        const screenshotUrl = await takeScreenshot(contentUrl)
        const screenshotResponse = await fetch(screenshotUrl)
        let thumbnailUrl = undefined
        if (screenshotResponse.ok) {
            const arrayBuffer = await screenshotResponse.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            const screenshotKey = `${newPage._id}_${randomUUID()}.png`
            await putObject({
                Bucket: process.env.S3_PAGES_BUCKET,
                ContentType: "image/png",
                Key: screenshotKey,
                Body: buffer
            })
            thumbnailUrl = process.env.CLOUDFRONT_PAGES_PREFIX + "/" + screenshotKey
        }

        newPage.thumbnailUrl = thumbnailUrl
        newPage.contentUrl = contentUrl
        newPage.jsonUrl = jsonUrl
        await newPage.save()

        funnel.numSteps = numSteps + 1
        await funnel.save()

        await setRedis(token, JSON.stringify({
            status: "completed",
            input
        }))
    } catch (error) {
        console.error(error)
        await setRedis(token, JSON.stringify({
            status: "error",
            error: error.message,
            input
        }))

        if (newPageId) {
            await PageModel.deleteOne({ _id: newPageId }).exec()
        }
    }
}

export default processCrawlUrlRequest
