import { Response } from "express"
import {
    QueryRequest,
    QueryResponse
} from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch"
import { PineconeClient } from "@pinecone-database/pinecone"
import { CommercialSellerModel } from "../models/commercialSeller"
import { setRedis } from "../services/redis.service"
import { FilteredThesis, Thesis } from "../types/apolloType"

import { cosineSimilarity } from "./cosineSimilarity"
import { getEmbeddings } from "./getEmbeddings"
import { stateNamesToAbbr } from "./utilsData"

export async function processApolloLandMatchesSync(
    thesis: Thesis
): Promise<QueryResponse> {
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
        throw new Error("Unable to get embeddings from OpenAI")
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
        throw new Error("Unable to get business matches from Pinecone")
    }

    return matches
}

export async function processApolloLandMatchesFiltered(
    token: string,
    filteredThesis: FilteredThesis,
    res: Response
): Promise<void> {
    const maxRetries = 5

    let retryCount = 0
    let success = false
    let embeddings: number[]

    while (!success && retryCount < maxRetries) {
        try {
            embeddings = await getEmbeddings(filteredThesis)
            success = true
            // console.log(JSON.stringify(embeddings))
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
    const countries = filteredThesis.countries || []
    const states = filteredThesis.states || []
    while (!success && retryCount < maxRetries) {
        try {
            const pineconeClient = new PineconeClient()

            await pineconeClient.init({
                environment: process.env.PINECONE_ENV || "",
                apiKey: process.env.PINECONE_API_KEY || ""
            })

            const index = pineconeClient.Index(process.env.LAND_INDEX)

            const filterConditions: Array<{
                [key: string]:
                    | { $eq: any }
                    | { $gt: number; $lte?: number }
                    | { $lte: number; $gt?: number }
            }> = [
                { askingPrice: { $gt: filteredThesis.minAskingPrice } },
                { askingPrice: { $lte: filteredThesis.maxAskingPrice } }
            ]

            const queryFilter: any = {
                $and: filterConditions
            }

            if (countries.length > 0) {
                const countryConditions = countries.map((country) => ({
                    Country: { $eq: country }
                }))
                queryFilter["$or"] = countryConditions
            }

            const queryRequest: QueryRequest = {
                topK: states.length > 0 ? 1000 : 100,
                vector: embeddings,
                includeMetadata: true,
                namespace: "",
                filter: queryFilter
            }
            matches = await index.query({ queryRequest })
            success = true

            if (states.length > 0) {
                matches.results = matches.results.filter((result: any) => {
                    const location = result.metadata?.location as string

                    const stateAbbr = location.split(",")[2].trim().slice(0, 2)

                    return (states as string[]).includes(stateAbbr)
                })
            }
        } catch (err) {
            console.error(err)
            ++retryCount
        }
    }

    // Filter results by state
    if (states.length > 0) {
        matches.matches = await matches.matches?.filter((result: any) => {
            const location = result.metadata?.location as string
            const locationTokens = location.split(/[\s,]+/) // Split the location string into tokens using space or comma as delimiters
            return states.some(
                (state) =>
                    locationTokens.includes(state) ||
                    locationTokens.includes(stateNamesToAbbr[state])
            )
        })
    }

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

export async function processApolloLandMatchesExclusiveFiltered(
    token: string,
    filteredThesis: FilteredThesis,
    res: Response
): Promise<void> {
    const maxRetries = 5

    let retryCount = 0
    let success = false
    let embeddings: number[]

    while (!success && retryCount < maxRetries) {
        try {
            embeddings = await getEmbeddings(filteredThesis)
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
        const countries = filteredThesis.countries || []
        const states = filteredThesis.states || []

        const filterConditions: { [key: string]: any }[] = [
            { listingPrice: { $gt: filteredThesis.minAskingPrice } },
            { listingPrice: { $lte: filteredThesis.maxAskingPrice } }
        ]

        if (countries.length > 0) {
            const countryConditions = countries.map((country) => ({
                country: country
            }))
            filterConditions.push({ $or: countryConditions })
        }

        if (states.length > 0) {
            const stateConditionsForStateField = states.map((state: string) => {
                const stateAbbr =
                    (stateNamesToAbbr as Record<string, string>)[state] || state
                const regex = new RegExp(`${state}|${stateAbbr}`, "i")

                return {
                    state: regex
                }
            })

            const stateConditionsForLocationField = states.map(
                (state: string) => {
                    const stateAbbr =
                        (stateNamesToAbbr as Record<string, string>)[state] ||
                        state
                    const regex = new RegExp(`${state}|${stateAbbr}`, "i")

                    return {
                        location: regex
                    }
                }
            )

            filterConditions.push({
                $or: [
                    ...stateConditionsForStateField,
                    ...stateConditionsForLocationField
                ]
            })
        }

        property = await CommercialSellerModel.find({
            enabled: true,
            $and: filterConditions
        }).limit(100)
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

    // Sort by relevance score in descending order
    results.sort((a, b) => b.score - a.score)

    await setRedis(token, JSON.stringify({
        status: "completed",
        response: JSON.stringify({
            results: [],
            matches: results
        })
    }))
}
