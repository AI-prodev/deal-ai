/* eslint-disable no-sparse-arrays */
import OpenAI from "openai"
import { Thesis } from "../types/thesis"
import { IBusinessSeller } from "../models/seller"
import { ICommercialSeller } from "../models/commercialSeller"
import { chooseOpenAiKey } from "./chooseOpenAiKey"
/**
 * getEmbeddings - Generates embeddings for a thesis using OpenAI API.
 *
 * @returns {Promise<number[]>} - A promise that resolves to an array of numerical embeddings.
 */

async function getEmbeddings(thesisObj: Thesis): Promise<number[]> {
    const openai = new OpenAI({
        apiKey: chooseOpenAiKey()
    })

    const response = await openai.embeddings.create({
        input: `${thesisObj.thesis} ${thesisObj.me} ${thesisObj.trends}`,
        model: "text-embedding-ada-002"
    })

    return response.data[0].embedding
}

export { getEmbeddings }

async function sellerGetEmbeddings(
    businessSeller: Partial<IBusinessSeller>
): Promise<number[]> {
    const openai = new OpenAI({
        apiKey: chooseOpenAiKey()
    })

    const input = [
        businessSeller.businessName,
        businessSeller?.businessDescription &&
            businessSeller?.businessDescription
                // Remove HTML tags
                .replace(/<[^>]+>/g, "")
                // Replace '&nbsp;' with a space character
                .replace(/&nbsp;/g, " ")
                // Replace '&amp;' with '&'
                .replace(/&amp;/g, "&")
                // Replace '&lt;' with '<'
                .replace(/&lt;/g, "<")
                // Replace '&gt;' with '>'
                .replace(/&gt;/g, ">")
                // Replace '&quot;' with double quotation marks
                // eslint-disable-next-line quotes
                .replace(/&quot;/g, '"')
                // Replace '&#039;' with a single quotation mark
                .replace(/&#039;/g, "'"),

        businessSeller.sector,
        businessSeller.country,
        businessSeller.state,
        businessSeller.zip,
        businessSeller.entityName,
        businessSeller.entityType,
        businessSeller.ownershipStructure,
        businessSeller.liabilities,
        businessSeller.purchaseType,
        businessSeller.assetsIncluded
    ].join(" ")

    const response = await openai.embeddings.create({
        input,
        model: "text-embedding-ada-002"
    })

    return response.data[0].embedding
}

async function propertyGetEmbeddings(
    commercialSeller: Partial<ICommercialSeller>
): Promise<number[]> {
    const openai = new OpenAI({
        apiKey: chooseOpenAiKey()
    })

    const input = [
        commercialSeller.propertyName,
        commercialSeller?.propertyDescription &&
            commercialSeller?.propertyDescription
                // Remove HTML tags
                .replace(/<[^>]+>/g, "")
                // Replace '&nbsp;' with a space character
                .replace(/&nbsp;/g, " ")
                // Replace '&amp;' with '&'
                .replace(/&amp;/g, "&")
                // Replace '&lt;' with '<'
                .replace(/&lt;/g, "<")
                // Replace '&gt;' with '>'
                .replace(/&gt;/g, ">")
                // Replace '&quot;' with double quotation marks
                // eslint-disable-next-line quotes
                .replace(/&quot;/g, '"')
                // Replace '&#039;' with a single quotation mark
                .replace(/&#039;/g, "'"),
        commercialSeller.propertyType,
        commercialSeller.country,
        commercialSeller.state,
        commercialSeller.zip,
        commercialSeller.location,
        commercialSeller.acres?.toString()
    ].join(" ")

    const response = await openai.embeddings.create({
        input,
        model: "text-embedding-ada-002"
    })

    return response.data[0].embedding
}

export { sellerGetEmbeddings, propertyGetEmbeddings }
