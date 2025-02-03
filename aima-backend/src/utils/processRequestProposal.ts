import { setRedis } from "../services/redis.service"
import { ProposalInput } from "../types/query"
import axios from "axios"
import FormData from "form-data"
import * as fs from "fs"
import path from "path"
import { putObject } from "../services/files.service"
import { randomUUID } from "crypto"
import { IProposal } from "../types/IProposal"
import ProposalModel from "../models/proposal"
import { createFileAndPipeUpload, findOrCreateFolder } from "../controllers/fileController"
import stream from "stream"
import { executeCrawl } from "./processUrlRequest"
import { fetchAdSocialImage } from "./processRequestAdSocialImage"
import { fetchChatCompletionImageIdeas } from "./imageIdeasGenerator"
import { IFolder } from "../types/IFolder"
import { fetchChatCompletionProposalIntro, fetchChatCompletionProposalServices, fetchChatCompletionProposalSummary } from "./proposalGenerator"
import { fetchChatCompletionMarketingHooks } from "./marketingHooksGenerator"
import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"
import { DocxImageReplacer } from "../utils/docxImageReplacer"
import { getCurrentDateFormattedLong } from "./date"
import { fetchChatCompletionFaq } from "./faqGenerator"
import { fetchChatCompletionBenefitStack } from "./benefitStackGenerator"
import { fetchChatCompletionBonusStack } from "./bonusStackGenerator"
import { IUser } from "../types/IUser"
import { fetchChatCompletionSeo } from "./seoGenerator"
import { fetchChatCompletionProduct } from "./productGenerator"

export async function processRequestProposal(
    token: string,
    input: ProposalInput,
    user: IUser
): Promise<void> {
    try {
        const businessName = input.businessName
        const businessWebsite = input.businessWebsite

        const [
            { imageRes, imageRes2, imageRes3, imageRes4, imageRes5, businessIntro, businessSummary, businessServices, marketingHooks, faqs, benefits, bonuses, seoTags, seoIntro },
            pagespeedDataDesktop,
            pagespeedDataMobile
        ] = await Promise.all([
            getMarketingSuggestions(businessWebsite, businessName, user._id),
            getPagespeedDataDesktop(businessWebsite),
            getPagespeedDataMobile(businessWebsite),
        ])

        const tempFolderPath = path.join(__dirname, "/../../tmp")
        if (!fs.existsSync(tempFolderPath)) {
            fs.mkdirSync(tempFolderPath, { recursive: true })
        }

        const tmpFilename = `temp_${Math.random()}.docx`
        const inputFilePath = path.join(__dirname, "/../../data/proposal_template9.docx")
        const outputFilePath = path.join(__dirname, `/../../tmp/${tmpFilename}`)
    
        const content = fs.readFileSync(inputFilePath, "binary")
    
        const zip = new PizZip(content)
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true
        })

        let authorName = user.businessName
        if (!authorName) {
            authorName = `${(user.firstName && user.firstName) != "N/A" ? user.firstName : ""} ${(user.lastName && user.lastName) != "N/A" ? user.lastName : ""}`
        }

        const dP = Math.round(pagespeedDataDesktop.lighthouseResult.categories.performance.score * 100)
        const dB = Math.round(pagespeedDataDesktop.lighthouseResult.categories["best-practices"].score * 100)
        const dA = Math.round(pagespeedDataDesktop.lighthouseResult.categories.accessibility.score * 100)
        const dS = Math.round(pagespeedDataDesktop.lighthouseResult.categories.seo.score * 100)
        const mP = Math.round(pagespeedDataMobile.lighthouseResult.categories.performance.score * 100)
        const mB = Math.round(pagespeedDataMobile.lighthouseResult.categories["best-practices"].score * 100)
        const mA = Math.round(pagespeedDataMobile.lighthouseResult.categories.accessibility.score * 100)
        const mS = Math.round(pagespeedDataMobile.lighthouseResult.categories.seo.score * 100)
    
        doc.render({
            businessName,
            businessWebsite,
            authorName,
            currentDate: getCurrentDateFormattedLong(),
            intro: businessIntro || "",
            summary: businessSummary || "",
            hook1: marketingHooks[0] ? `"${marketingHooks[0].h}"` : "",
            hook2: marketingHooks[1] ? `"${marketingHooks[1].h}"` : "",
            hook3: marketingHooks[2] ? `"${marketingHooks[2].h}"` : "",
            hook4: marketingHooks[3] ? `"${marketingHooks[3].h}"` : "",
            hook5: marketingHooks[4] ? `"${marketingHooks[4].h}"` : "",
            hook6: marketingHooks[5] ? `"${marketingHooks[5].h}"` : "",
            hook7: marketingHooks[6] ? `"${marketingHooks[6].h}"` : "",
            hook8: marketingHooks[7] ? `"${marketingHooks[7].h}"` : "",
            hook9: marketingHooks[8] ? `"${marketingHooks[8].h}"` : "",
            hook10: marketingHooks[9] ? `"${marketingHooks[9].h}"` : "",
            faq1q: faqs[0] ? `${faqs[0].q}` : "",
            faq1a: faqs[0] ? `${faqs[0].a}` : "",
            faq2q: faqs[1] ? `${faqs[1].q}` : "",
            faq2a: faqs[1] ? `${faqs[1].a}` : "",
            faq3q: faqs[2] ? `${faqs[2].q}` : "",
            faq3a: faqs[2] ? `${faqs[2].a}` : "",
            faq4q: faqs[3] ? `${faqs[3].q}` : "",
            faq4a: faqs[3] ? `${faqs[3].a}` : "",
            faq5q: faqs[4] ? `${faqs[4].q}` : "",
            faq5a: faqs[4] ? `${faqs[4].a}` : "",
            faq6q: faqs[5] ? `${faqs[5].q}` : "",
            faq6a: faqs[5] ? `${faqs[5].a}` : "",
            benefit1n: benefits[0] ? benefits[0].n : "",
            benefit1a: benefits[0] ? benefits[0].a : "",
            benefit2n: benefits[1] ? benefits[1].n : "",
            benefit2a: benefits[1] ? benefits[1].a : "",
            benefit3n: benefits[2] ? benefits[2].n : "",
            benefit3a: benefits[2] ? benefits[2].a : "",
            benefit4n: benefits[3] ? benefits[3].n : "",
            benefit4a: benefits[3] ? benefits[3].a : "",
            benefit5n: benefits[4] ? benefits[4].n : "",
            benefit5a: benefits[4] ? benefits[4].a : "",
            bonus1b: bonuses[0] ? bonuses[0].b : "",
            bonus1r: bonuses[0] ? bonuses[0].r : "",
            bonus2b: bonuses[1] ? bonuses[1].b : "",
            bonus2r: bonuses[1] ? bonuses[1].r : "",
            bonus3b: bonuses[2] ? bonuses[2].b : "",
            bonus3r: bonuses[2] ? bonuses[2].r : "",
            bonus4b: bonuses[3] ? bonuses[3].b : "",
            bonus4r: bonuses[3] ? bonuses[3].r : "",
            bonus5b: bonuses[4] ? bonuses[4].b : "",
            bonus5r: bonuses[4] ? bonuses[4].r : "",
            dP,
            dB,
            dA,
            dS,
            dFcp: pagespeedDataDesktop.lighthouseResult.audits["first-contentful-paint"].displayValue,
            dSi: pagespeedDataDesktop.lighthouseResult.audits["speed-index"].displayValue,
            dLcp: pagespeedDataDesktop.lighthouseResult.audits["largest-contentful-paint"].displayValue,
            dTti: pagespeedDataDesktop.lighthouseResult.audits["interactive"].displayValue,
            dTbt: pagespeedDataDesktop.lighthouseResult.audits["total-blocking-time"].displayValue,
            dCls: pagespeedDataDesktop.lighthouseResult.audits["cumulative-layout-shift"].displayValue,
            dNotes: getPagespeedNotes(pagespeedDataDesktop),
            mP,
            mB,
            mA,
            mS,
            mFcp: pagespeedDataMobile.lighthouseResult.audits["first-contentful-paint"].displayValue,
            mSi: pagespeedDataMobile.lighthouseResult.audits["speed-index"].displayValue,
            mLcp: pagespeedDataMobile.lighthouseResult.audits["largest-contentful-paint"].displayValue,
            mTti: pagespeedDataMobile.lighthouseResult.audits["interactive"].displayValue,
            mTbt: pagespeedDataMobile.lighthouseResult.audits["total-blocking-time"].displayValue,
            mCls: pagespeedDataMobile.lighthouseResult.audits["cumulative-layout-shift"].displayValue,
            mNotes: getPagespeedNotes(pagespeedDataMobile),
            service1a: businessServices.service1 ? businessServices.service1.service : "",
            service1b: businessServices.service1 ? `- ${businessServices.service1.price}` : "",
            service2a: businessServices.service2 ? businessServices.service2.service : "",
            service2b: businessServices.service2 ? `- ${businessServices.service2.price}` : "",
            service3a: businessServices.service3 ? businessServices.service3.service : "",
            service3b: businessServices.service3 ? `- ${businessServices.service3.price}` : "",
            service4a: businessServices.service4 ? businessServices.service4.service : "",
            service4b: businessServices.service4 ? `- ${businessServices.service4.price}` : "",
            service5a: businessServices.service5 ? businessServices.service5.service : "",
            service6a: businessServices.service6 ? businessServices.service6.service : "",
            service7a: businessServices.service7 ? businessServices.service7.service : "",
            service8a: businessServices.service8 ? businessServices.service8.service : "",
            additionalComments: businessServices.additionalComments || "",
            seoIntro: seoIntro || "",
            seoTag1: seoTags[0] ? `• ${seoTags[0]}` : "",
            seoTag2: seoTags[1] ? `• ${seoTags[1]}` : "",
            seoTag3: seoTags[2] ? `• ${seoTags[2]}` : "",
            seoTag4: seoTags[3] ? `• ${seoTags[3]}` : "",
            seoTag5: seoTags[4] ? `• ${seoTags[4]}` : "",
            seoTag6: seoTags[5] ? `• ${seoTags[5]}` : "",
        })
    
        const buf = doc.getZip().generate({type: "nodebuffer", compression: "DEFLATE"})
    
        fs.writeFileSync(outputFilePath, buf)

        const docxImager = new DocxImageReplacer()
        await docxImager.load(outputFilePath)
        await docxImager.replaceWithImageURL(imageRes.url, 1, "png")
        await docxImager.replaceWithImageURL(getColorImage(mP), 2, "png")
        await docxImager.replaceWithImageURL(getColorImage(mP), 3, "png")
        await docxImager.replaceWithImageURL(getColorImage(mB), 4, "png")
        await docxImager.replaceWithImageURL(getColorImage(mB), 5, "png")
        await docxImager.replaceWithImageURL(getColorImage(mA), 6, "png")
        await docxImager.replaceWithImageURL(getColorImage(mA), 7, "png")
        await docxImager.replaceWithImageURL(getColorImage(mS), 8, "png")
        await docxImager.replaceWithImageURL(getColorImage(mS), 9, "png")
        await docxImager.replaceWithImageURL(getColorImage(dP), 10, "png")
        await docxImager.replaceWithImageURL(getColorImage(dP), 11, "png")
        await docxImager.replaceWithImageURL(getColorImage(dB), 12, "png")
        await docxImager.replaceWithImageURL(getColorImage(dB), 13, "png")
        await docxImager.replaceWithImageURL(getColorImage(dA), 14, "png")
        await docxImager.replaceWithImageURL(getColorImage(dA), 15, "png")
        await docxImager.replaceWithImageURL(getColorImage(dS), 16, "png")
        await docxImager.replaceWithImageURL(getColorImage(dS), 17, "png")
        await docxImager.replaceWithImageURL(imageRes.url, 18, "png")
        await docxImager.replaceWithImageURL(imageRes2.url, 19, "png")
        await docxImager.replaceWithImageURL(imageRes3.url, 20, "png")
        await docxImager.replaceWithImageURL(imageRes4.url, 21, "png")
        await docxImager.replaceWithImageURL(imageRes5.url, 22, "png")
        await docxImager.save(outputFilePath)

        const proposalContent = fs.readFileSync(outputFilePath)
    
        const propsalKey = `${user._id}_proposal_${randomUUID()}.docx`
        await putObject({
            Bucket: process.env.S3_UPLOADS_BUCKET,
            ContentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            Key: propsalKey,
            Body: proposalContent
        })
    
        const proposalDocxUrl = process.env.CLOUDFRONT_UPLOADS_PREFIX + "/" + propsalKey

        console.log("proposalDocxUrl=", proposalDocxUrl)

        const form = new FormData()
        form.append("File", proposalDocxUrl)
        form.append("StoreFile", "true")
        const pdfRes = await axios.post(`https://v2.convertapi.com/convert/docx/to/pdf?Secret=${process.env.CONVERTAPI_KEY}`, form, {
            headers: {
                ...form.getHeaders(),
            },
        })
        const pdfData = pdfRes.data
        const pdfUrl = pdfData.Files[0].Url

        console.log("pdfUrl=", pdfUrl)

        const folder = await findOrCreateFolder(user._id, "Marketing Proposals")
        if (!folder) {
            throw new Error("Unable to create folder")
        }

        const [pdfFile, docFile] = await Promise.all([
            uploadPdfFile(pdfUrl, user._id, folder, businessName),
            uploadDocFile(proposalDocxUrl, user._id, folder, businessName),
        ])

        const newProposal: IProposal = new ProposalModel({
            user: user._id,
            businessName: input.businessName,
            businessWebsite: input.businessWebsite,
            pdfFile: pdfFile._id,
            docFile: docFile._id,
        })
        await newProposal.save()

        fs.unlink(outputFilePath, (err) => {
            console.log("Unlink err=", err)
        })
        
        await setRedis(token, JSON.stringify({
            status: "completed",
            response: JSON.stringify({ proposalId: newProposal._id }),
            input
        }))
    } catch(err) {
        console.error(err)
        await setRedis(token, JSON.stringify({
            status: "error",
            error: "Error: " + (err.message || JSON.stringify(err)),
            input
        }))
    }
}

async function getMarketingSuggestions(businessWebsite: string, businessName: string, userId: string) {
    const websiteSummary = (await executeCrawl(businessWebsite, userId)).text

    console.log("websiteSummary=", websiteSummary)

    const [ideas, businessIntro, businessSummary, businessServices, marketingHooks, benefits, seoTagRes] = await Promise.all([
        fetchChatCompletionImageIdeas("gpt-4-0125-preview", {
            businessDescription: websiteSummary,
        }, userId),
        fetchChatCompletionProposalIntro("gpt-4-0125-preview", {
            businessDescription: websiteSummary,
            businessName,
            businessWebsite
        }, userId),
        fetchChatCompletionProposalSummary("gpt-4-0125-preview", {
            businessDescription: websiteSummary,
            businessName,
            businessWebsite
        }, userId),
        fetchChatCompletionProposalServices("gpt-4-0125-preview", {
            businessDescription: websiteSummary,
            businessName,
            businessWebsite
        }, userId),
        fetchChatCompletionMarketingHooks("gpt-4-0125-preview", {
            n: 11,
            aggressiveness: 8,
            businessDescription: websiteSummary,
            emoji: false,
            goodHooks: "",
            goodHooksCheck: false,
            hookCreative: 10,
            hookLength: 4,
            imageDescription: "",
            instructions: "",
            language: "English",
            priceDriven: "",
            priceDrivenCheck: false,
            ratedHooks: "",
            targetAudience: "everyone",
            tone: "Factual",
            toneAdditionalInfo: "",
            triggerWords: "",
            valence: true,
            fear: "",
            urgency: ""
        }, userId),
        fetchChatCompletionBenefitStack("gpt-4-0125-preview", {
            n: 7,
            aggressiveness: 8,
            businessDescription: websiteSummary,
            dimensionsOfNeed:"",
            hookCreative: 10,
            hookLength: 7,
            instructions: "",
            language: "English",
            priceDriven: "",
            priceDrivenCheck: false,
            ratedHooks: "",
            targetAudience: "everyone",
            tone: "Factual",
            toneAdditionalInfo: ""
        }, userId),
        fetchChatCompletionSeo("gpt-4-0125-preview", {
            aggressiveness: 8,
            businessDescription: websiteSummary,
            emoji: false,
            goodHooks: "",
            goodHooksCheck: false,
            hookCreative: 10,
            hookLength: 5,
            imageDescription: "",
            instructions: "",
            language: "English",
            n: 10,
            priceDriven: "",
            priceDrivenCheck: false,
            targetAudience: "everyone",
            targeting: 4,
            tone: "Factual",
            toneAdditionalInfo: "",
            triggerWords: "",
            type: "business",
            valence: false
        }, userId)
    ])

    const seoTags = seoTagRes.map((s: any) => s.tag)

    const benefitStack = benefits.map((b: any) => b.n + " - " + b.a).join("\n")

    const [faqs, bonuses, productRes] = await Promise.all([
        fetchChatCompletionFaq("gpt-4-0125-preview", {
            n: 7,
            aggressiveness: 8,
            benefitStack,
            businessDescription: websiteSummary,
            hookCreative: 10,
            hookLength: 7,
            language: "English",
            ratedHooks: "",
            targetAudience: "everyone",
            tone: "Factual",
            toneAdditionalInfo: "",
        }, userId),
        fetchChatCompletionBonusStack("gpt-4-0125-preview", {
            aggressiveness: 8,
            benefitStack,
            businessDescription: websiteSummary,
            hookCreative: 10,
            hookLength: 7,
            language: "English",
            ratedHooks: "",
            targetAudience: "everyone",
            tone: "Factual",
            toneAdditionalInfo: ""
        }, userId),
        fetchChatCompletionProduct("gpt-4-0125-preview", {
            seoTags,
            aggressiveness: 8,
            businessDescription: websiteSummary,
            emoji: false,
            goodHooks: "",
            goodHooksCheck: false,
            hookCreative: 10,
            hookLength: 5,
            imageDescription: "",
            instructions: "",
            language: "English",
            n: 1,
            priceDriven: "",
            priceDrivenCheck: false,
            targetAudience: "everyone",
            targeting: 4,
            tone: "Factual",
            toneAdditionalInfo: "",
            triggerWords: "",
            type: "business",
            valence: false
        }, userId)
    ])

    const seoIntro = productRes[0].product

    console.log("ideas=", ideas)
    console.log("businessIntro=", businessIntro)
    console.log("marketingHooks=", marketingHooks)
    console.log("faqs=", faqs)
    console.log("seoIntro=", seoIntro)

    for (let i = 0; i < ideas.length; i++) {
        ideas[i] += " If there are any people in the image, please ensure they are caucasian."
    }

    const idea1 = ideas[0]
    const idea2 = ideas[1]
    const idea3 = ideas[2]
    const idea4 = ideas[3]
    const idea5 = ideas[4]

    console.log("idea1=", idea1)
    console.log("idea2=", idea2)
    console.log("idea3=", idea3)
    console.log("idea4=", idea4)
    console.log("idea5=", idea5)

    const [imageRes, imageRes2, imageRes3, imageRes4, imageRes5] = await Promise.all([
        createImage(idea1, websiteSummary, userId, "Portrait (Stories / Reel)"),
        createImage(idea2, websiteSummary, userId, "Portrait (Stories / Reel)"),
        createImage(idea3, websiteSummary, userId, "Portrait (Stories / Reel)"),
        createImage(idea4, websiteSummary, userId, "Portrait (Stories / Reel)"),
        createImage(idea5, websiteSummary, userId, "Landscape (YouTube cover)"),
    ])

    console.log("imageRes.url=", imageRes.url)
    console.log("imageRes2.url=", imageRes2.url)
    console.log("imageRes3.url=", imageRes3.url)
    console.log("imageRes4.url=", imageRes4.url)
    console.log("imageRes5.url=", imageRes5.url)

    return { imageRes, imageRes2, imageRes3, imageRes4, imageRes5, businessIntro, businessSummary, businessServices, marketingHooks, faqs, benefits, bonuses, seoTags, seoIntro }
}

async function uploadPdfFile(pdfUrl: any, userId: string, folder: IFolder, businessName: string) {
    const pdfFileRes = await axios({
        url: pdfUrl,
        method: "GET",
        responseType: "stream",
    })
    const pdfPassThrough = new stream.PassThrough()
    pdfFileRes.data.pipe(pdfPassThrough)

    const pdfFile = await createFileAndPipeUpload(
        userId,
        folder._id,
        `Marketing Proposal for ${businessName}.pdf`,
        pdfPassThrough,
        "application/pdf"
    )
    return pdfFile
}

async function uploadDocFile(docUrl: any, userId: string, folder: IFolder, businessName: string) {
    const docFileRes = await axios({
        url: docUrl,
        method: "GET",
        responseType: "stream",
    })
    const docPassThrough = new stream.PassThrough()
    docFileRes.data.pipe(docPassThrough)

    const docFile = await createFileAndPipeUpload(
        userId,
        folder._id,
        `Marketing Proposal for ${businessName}.docx`,
        docPassThrough,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    return docFile
}

async function getPagespeedDataDesktop(businessWebsite: string) {
    const res = await axios.get(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=DESKTOP&category=ACCESSIBILITY&category=BEST_PRACTICES&category=PERFORMANCE&category=SEO&url=${encodeURIComponent(businessWebsite)}&key=${process.env.GOOGLE_PAGESPEED_API_KEY}`)
    const pagespeedJsonData = res.data
    return pagespeedJsonData
}

async function getPagespeedDataMobile(businessWebsite: string) {
    const res = await axios.get(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=MOBILE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=PERFORMANCE&category=SEO&url=${encodeURIComponent(businessWebsite)}&key=${process.env.GOOGLE_PAGESPEED_API_KEY}`)
    const pagespeedJsonData = res.data
    return pagespeedJsonData
}

function getColorImage(score: number) {
    let image = "https://d1xzp23rup9ttz.cloudfront.net/proposals/yellow.png"
    if (score < 40) {
        image = "https://d1xzp23rup9ttz.cloudfront.net/proposals/red.png"
    } else if (score >= 85) {
        image = "https://d1xzp23rup9ttz.cloudfront.net/proposals/green.png"
    }
    return image
}

function getPagespeedNotes(pagespeedData: any) {
    const audits: string[] = []
    for (const audit of pagespeedData.lighthouseResult.categories.performance.auditRefs) {
        if (audit.relevantAudits) {
            for (const relevantAudit of audit.relevantAudits) {
                if (!audits.includes(relevantAudit)) {
                    audits.push(relevantAudit)
                }
            }
        }
    }

    let notes = ""
    let count = 0
    for (const auditName of audits) {
        if (pagespeedData.lighthouseResult.audits[auditName]) {
            const audit = pagespeedData.lighthouseResult.audits[auditName]
            notes += `${notes && ", "}${audit.title}${audit.displayValue ? " (" + audit.displayValue + ")" : ""}`
            count++
            if (count > 7) {
                break
            }
        }
    }

    if (notes) {
        notes += "."
    } else {
        notes = "None!"
    }

    return notes
}

async function createImage(idea: any, websiteSummary: any, userId: string, aspectRatio: string) {
    return JSON.parse(await fetchAdSocialImage({
        adDescription: idea,
        aggressiveness: 8,
        aspectRatio,
        businessDescription: websiteSummary,
        tone: "Factual",
        colours: "",
        hookCreative: 10,
        imageStyle: "Realistic",
        imageType: "Photograph",
        impacts: [
            { "Vivid Colors and Contrasts": true },
            { "Focus on Composition": true },
            { "Incorporate Movement or Action": true },
            { "Clarity and Simplicity": true },
            { "Use of Scale and Perspective": true },
            { "Emotional Appeal": true },
            { "Innovative or Unexpected Elements": true },
            { "Use Negative Space": true },
            { "Texture and Patterns": true },
            { "Psychological Triggers": true },
            { "Sensory Appeal": true },
        ],
        instructions: "",
        isolation: "Black",
        scrollStopper: true,
        targetAudience: "everyone",
        campaignId: ""
    }, userId))
}

