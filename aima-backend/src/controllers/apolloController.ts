import { Request, Response } from "express"
import {
    QueryRequest,
    QueryResponse
} from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch"
import { PineconeClient } from "@pinecone-database/pinecone"
import { v4 as uuidv4 } from "uuid"

import { BusinessSellerModel } from "../models/seller"
import {
    processApolloBusinessMatchesSync,
    processApolloBusinessMatchesFiltered,
    processApolloBusinessMatchesExclusiveFiltered
} from "../utils/apolloBusinessMatching"
import { getEmbeddings } from "../utils/getEmbeddings"
import { processRequest } from "../utils/processRequest"
import { cosineSimilarity } from "../utils/cosineSimilarity"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { Thesis, Recommendation } from "../types/apolloType"
import { setRedis } from "../services/redis.service"

export async function processApolloBusinessMatches(
    token: string,
    thesis: Thesis,
    res: Response
): Promise<void> {
    const maxRetries = 5

    let retryCount = 0
    let success = false
    let embeddings: number[]

    while (!success && retryCount < maxRetries) {
        try {
            embeddings = await getEmbeddings(thesis)
            success = true
        } catch (err) {
            console.error(err)
            ++retryCount
        }
    }

    if (!success) {
        await setRedis(token, JSON.stringify({
            status: "error",
            error: "Unable to get embeddings from OpenAI"
        }))
        return
    }

    retryCount = 0
    success = false
    let matches: QueryResponse

    while (!success && retryCount < maxRetries) {
        try {
            const pineconeClient = new PineconeClient()

            await pineconeClient.init({
                environment: process.env.PINECONE_ENV || "",
                apiKey: process.env.PINECONE_API_KEY || ""
            })

            const index = pineconeClient.Index(process.env.PINECONE_INDEX)

            const queryRequest: QueryRequest = {
                topK: 100,
                vector: embeddings,
                includeMetadata: true,
                namespace: ""
            }

            matches = await index.query({ queryRequest })
            success = true
        } catch (err) {
            console.error(err)
            ++retryCount
        }
    }

    // matches.results.forEach((result) => {
    //     console.log((result as any).metadata!)
    // })

    if (!success) {
        await setRedis(token, JSON.stringify({
            status: "error",
            error: "Unable to get business matches from Pinecone"
        }))
    }

    await setRedis(token, JSON.stringify({
        status: "completed",
        response: JSON.stringify(matches)
    }))
}

export async function processApolloBusinessExclusiveMatches(
    token: string,
    thesis: Thesis,
    res: Response
): Promise<void> {
    const maxRetries = 5

    let retryCount = 0
    let success = false
    let embeddings: number[]

    while (!success && retryCount < maxRetries) {
        try {
            embeddings = await getEmbeddings(thesis)
            success = true
        } catch (err) {
            console.error(err)
            ++retryCount
        }
    }

    if (!success) {
        await setRedis(token, JSON.stringify({
            status: "error",
            error: "Unable to get embeddings from OpenAI"
        }))
        return
    }

    let businesses
    try {
        businesses = await BusinessSellerModel.find({ enabled: true })
            .populate("userId", "firstName lastName email roles")
            .limit(100)
    } catch (err) {
        console.error(err)
        await setRedis(token, JSON.stringify({
            status: "error",
            error: "Unable to get businesses from MongoDB"
        }))
        return
    }

    // Set the relevance cutoff
    const relevanceCutoff = 0.1
    const exclusiveBoost = parseFloat(process.env.EXCLUSIVE_BOOST) || 0.0

    const results = businesses
        .map((business) => {
            let relevanceScore = cosineSimilarity(embeddings, business.vectors)
            if (business.vectors) {
                relevanceScore += exclusiveBoost
                if (relevanceScore > 1) {
                    relevanceScore = 1
                }
            }
            const businessObj = business.toObject()

            return {
                id: businessObj._id, // or another unique identifier
                score: relevanceScore,
                values: [], // populate as needed
                metadata: {
                    PreConvertedAskingPrice: businessObj.listingPrice,
                    URL: `/apps/broker-business?detail=${businessObj._id}`,
                    sellerEmail: businessObj.userId?.email,
                    sellerFirstName: businessObj.userId?.firstName,
                    sellerLastName: businessObj.userId?.lastName,
                    about: businessObj.businessDescription,
                    askingPrice: businessObj.listingPrice,
                    listingHeadline: businessObj.businessName,
                    location: `${businessObj.country}`,
                    entityName: businessObj.entityName,
                    entityType: businessObj.entityType,
                    ownershipStructure: businessObj.ownershipStructure,
                    liabilities: businessObj.liabilities,
                    platformBusiness: businessObj.platformBusiness,
                    assetsIncluded: businessObj.assetsIncluded,
                    sellerContinuity: businessObj.sellerContinuity
                }
            }
        })
        .filter((result) => result.score >= relevanceCutoff)

    results.sort((a, b) => b.score - a.score)

    await setRedis(token, JSON.stringify({
        status: "completed",
        response: JSON.stringify({
            results: [],
            matches: results
        })
    }))
}

export async function processApolloRecommends(
    token: string,
    recommendation: Recommendation,
    res: Response,
    req: IExtendedRequest
): Promise<void> {
    try {
        await setRedis(token, JSON.stringify({
            status: "processing",
            progress: 0
        }))

        const userId = req.user.id

        await processRequest(
            token,
            recommendation,
            userId
        )
    } catch (err) {
        // handle errors
        console.error(err)
        const errorResponse = {
            status: "error",
            error: {
                message: err.message,
                stack: err.stack
            }
        }
        await setRedis(token, JSON.stringify(errorResponse))
        res.status(500).json(errorResponse)
    }
}

export const apolloMatchBusinessesSync = async (
    req: Request,
    res: Response
) => {
    const thesis = {
        thesis: req.query.thesis as string,
        me: req.query.me as string,
        trends: req.query.trends as string
    }

    try {
        const matches = await processApolloBusinessMatchesSync(thesis)
        res.json(matches)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
}

export const startApolloMatchBusinessesFiltered = async (
    req: Request,
    res: Response
) => {
    const token = `pending-request:${uuidv4()}`
    const filteredThesis = req.body

    await setRedis(token, "{ status: \"processing\", progress: 0 }")

    processApolloBusinessMatchesFiltered(token, filteredThesis, res).catch(
        async (err) => {
            console.error(err)
            await setRedis(token, JSON.stringify({
                status: "error",
                error: err.message
            }))
        }
    )

    res.json({ token })
}
export const startApolloMatchBusinessesExclusiveFiltered = async (
    req: Request,
    res: Response
) => {
    const token = `pending-request:${uuidv4()}`
    const filteredThesis = req.body

    // res.locals.pendingRequests.set(token, { status: "processing", progress: 0 })
    await setRedis(token, "{ status: \"processing\", progress: 0 }")

    processApolloBusinessMatchesExclusiveFiltered(
        token,
        filteredThesis,
        res
    ).catch(async (err) => {
        console.error(err)
        await setRedis(token, JSON.stringify({
            status: "error",
            error: err.message
        }))
    })

    res.json({ token })
}
