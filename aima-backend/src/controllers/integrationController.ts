import { Response } from "express"
import IntegrationModel from "../models/integration"
import { IExtendedRequest } from "../types/IExtendedRequest"
import axios from "axios"

export const addIntegration = async (req: IExtendedRequest, res: Response) => {
    try {
        const { type, data } = req.body
        if(!type || ["sendgrid", "stripe", "zapier"].indexOf(type) === -1) {
            return res.status(400).json({ error: "Invalid integration type" })
        }

        if (!data) {
            return res.status(400).json({ error: "Invalid integration data" })
        }

        if (type === "sendgrid") {
            const { email, first_name, last_name, state, city, company, country, phone } = await checkSendgridApiKey(data.apiKey)
            data.email = email
            data.first_name = first_name
            data.last_name = last_name
            data.state = state
            data.city = city
            data.company = company
            data.country = country
            data.phone = phone
        }

        const checkIntegration = await IntegrationModel.findOne({ user: req.user.id, type, "data.apiKey": data.apiKey }).exec()
        if (checkIntegration) {
            throw new Error("Sendgrid API key already exists")
        }

        const integration = new IntegrationModel({ user: req.user.id, type, data })
        await integration.save()

        return res.status(201).json(integration)
    } catch (error) {
        return res.status(500).json({ error: error.message || "Server error" })
    }
}

export const getIntegration = async (req: IExtendedRequest, res: Response) => {
    try {
        const integrations = await IntegrationModel.find({ user: req.user.id, type: req.params.type })
        
        return res.status(200).json(integrations)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

export const deleteIntegration = async (req: IExtendedRequest, res: Response) => {
    try {
        if (!req.params.id) {
            throw new Error("Invalid integration id")
        }

        await IntegrationModel.deleteOne({ _id: req.params.id, user: req.user.id }).exec()

        return res.status(200).json("Integration Deleted Successfully")
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

const checkSendgridApiKey = async (apiKey: string) => {
    const [email, { first_name, last_name, state, city, company, country, phone }] = await Promise.all([
        getEmailFromSendGridAPIKey(apiKey),
        getSendgridAccountDetails(apiKey)
    ]).catch(() => {
        throw new Error("Invalid API Key")
    })

    return { email, first_name, last_name, state, city, company, country, phone }
}

async function getEmailFromSendGridAPIKey(apiKey: string) {
    try {
        const response = await axios.get("https://api.sendgrid.com/v3/user/email", {
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        })

        return response.data.email
    } catch (error) {
        // Handle any errors that occur during the request
        throw new Error("Invalid SendGrid API Key")
    }
}

async function getSendgridAccountDetails(apiKey: string) {
    try {
        const response = await axios.get("https://api.sendgrid.com/v3/user/profile", {
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        })

        return response.data
    } catch (error) {
        // Handle any errors that occur during the request
        throw new Error("Invalid Sendgrid API Key")
    }
}
