import { Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"
import {
    QueryRequest,
    QueryResponse
} from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch"
import { PineconeClient } from "@pinecone-database/pinecone"
import {
    processApolloLandMatchesExclusiveFiltered,
    processApolloLandMatchesFiltered,
    processApolloLandMatchesSync
} from "../utils/apolloLandMatching"
import { getEmbeddings } from "../utils/getEmbeddings"
import { processRequest } from "../utils/processRequest"
import { cosineSimilarity } from "../utils/cosineSimilarity"
import { CommercialSellerModel } from "../models/commercialSeller"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { Thesis, LandRecommandation } from "../types/apolloType"
import { setRedis } from "../services/redis.service"

export async function processApolloLandMatches(
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

            const index = pineconeClient.Index(process.env.LAND_INDEX)

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

    if (!success) {
        await setRedis(token, JSON.stringify({
            status: "error",
            error: "Unable to get property matches from Pinecone"
        }))
    }

    await setRedis(token, JSON.stringify({
        status: "completed",
        response: JSON.stringify(matches)
    }))
}

export async function processApolloPropertyExclusiveMatches(
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

    let property
    try {
        property = await CommercialSellerModel.find({ enabled: true })
            .populate("userId", "firstName lastName email roles")
            .limit(100)
    } catch (err) {
        console.error(err)
        await setRedis(token, JSON.stringify({
            status: "error",
            error: "Unable to get property from MongoDB"
        }))
        return
    }

    // Set the relevance cutoff
    const relevanceCutoff = 0.1
    const exclusiveBoost = parseFloat(process.env.EXCLUSIVE_BOOST) || 0.0
    const results = property
        .map((property) => {
            let relevanceScore = cosineSimilarity(embeddings, property.vectors)

            if (property.vectors) {
                relevanceScore += exclusiveBoost
                if (relevanceScore > 1) {
                    relevanceScore = 1
                }
            }
            const propertyObj = property.toObject()

            return {
                id: propertyObj._id, // or another unique identifier
                score: relevanceScore,
                values: [], // populate as needed
                metadata: {
                    PreConvertedAskingPrice: propertyObj.listingPrice,
                    URL: `/apps/broker-property?detail=${propertyObj._id}`,
                    sellerEmail: propertyObj.userId.email,
                    sellerFirstName: propertyObj.userId.firstName,
                    sellerLastName: propertyObj.userId.lastName,
                    about: propertyObj.propertyDescription,
                    acres: propertyObj.acres,
                    type: propertyObj.propertyType,
                    askingPrice: propertyObj.listingPrice,
                    listingHeadline: propertyObj.propertyName,
                    location: `${propertyObj.location}`,
                    Country: propertyObj.country
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

export async function processApolloLandRecommends(
    token: string,
    recommendation: LandRecommandation,
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

    // res.json({ token })
}

export const apolloMatchLandSync = async (req: Request, res: Response) => {
    const thesis = {
        thesis: req.query.thesis as string,
        me: req.query.me as string,
        trends: req.query.trends as string
    }

    try {
        const matches = await processApolloLandMatchesSync(thesis)
        res.json(matches)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
}

export const startApolloMatchLandFiltered = async (req: Request, res: Response) => {
    const token = `pending-request:${uuidv4()}`
    const filteredThesis = req.body

    await setRedis(token, JSON.stringify({ status: "processing", progress: 0 }))

    processApolloLandMatchesFiltered(token, filteredThesis, res).catch(
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

export const startApolloMatchLandExclusiveFiltered = async (
    req: Request,
    res: Response
) => {
    const token = `pending-request:${uuidv4()}`
    const filteredThesis = req.body

    await setRedis(token, JSON.stringify({ status: "processing", progress: 0 }))

    processApolloLandMatchesExclusiveFiltered(token, filteredThesis, res).catch(
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
