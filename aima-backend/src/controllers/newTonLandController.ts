import { Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"
import { validationResult } from "express-validator"
import mongoose from "mongoose"

import { processRequest } from "../utils/processRequest"
import { NewtonLandInput } from "../types/newTonTypes"
import {
    getAllPropertyInformationRequests,
    getPropertyInformationRequestById,
    getPropertyInformationRequestsList,
    patchPropertyInformationRequestById
} from "../services/newtonProperty.service"
import {
    getPropertyByMultipleQueryMetadata,
    getPropertyListByUserId
} from "../services/property.service"
import { getUserById } from "../services/user.service"
import { setRedis } from "../services/redis.service"
import { IExtendedRequest } from "../types/IExtendedRequest"

export const newTonStartRequest = async (req: IExtendedRequest, res: Response) => {
    const token = `pending-request:${uuidv4()}`

    let newtonInput: NewtonLandInput

    try {
        newtonInput = req.body
    } catch (err) {
        console.error("Couldn't parse Newton Land Input")
        console.error(err)
    }
    const userId = req.user.id

    // res.locals.pendingRequests.set(token, { status: "processing", progress: 0 })
    await setRedis(token, JSON.stringify({ status: "processing", progress: 0 }))

    processRequest(token, newtonInput, userId).catch(async (err) => {
        console.error(err)
        await setRedis(token, JSON.stringify({
            status: "error",
            error: err.message
        }))
    })

    res.json({ token })
}

export const getPropertyInformationRequestsById = async (
    req: Request,
    res: Response
) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const id = req.params?.id

    if (!id) return res.status(400).json({ message: "Missing id param." })

    try {
        const biRequest = await getPropertyInformationRequestById(
            new mongoose.Types.ObjectId(id)
        )

        if (!biRequest)
            return res.status(404).json({
                message: "No Commercial Property  Information Request found."
            })
        res.status(200).json({ response: biRequest })
    } catch (error) {
        console.log(
            "Error getting commercial property  informations request:",
            error
        )
        res.status(500).json({
            error: `Error getting commercial property  informations request:  ${error}`,
            message: error.message
        })
    }
}

export const patchPropertyInformationRequestsById = async (
    req: Request,
    res: Response
) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.body
    const update = req.body

    if (!id) return res.status(400).json({ message: "Missing id param." })
    if (!update) return res.status(400).json({ message: "Missing body." })

    try {
        const biRequest = await patchPropertyInformationRequestById(
            new mongoose.Types.ObjectId(id),
            update
        )

        if (!biRequest)
            return res.status(404).json({
                message: "No commercial property Information Request found."
            })
        res.status(200).json({ response: biRequest })
    } catch (error) {
        console.log(
            "Error getting commercial property informations request:",
            error
        )
        res.status(500).json({
            error: `Error getting commercial property informations request:  ${error}`,
            message: error.message
        })
    }
}

export const getPropertyInformationRequestsByBuyerId = async (
    req: Request,
    res: Response
) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const buyerId = req.params?.id

    if (!buyerId) return res.status(400).json({ error: "Missing buyer id." })

    try {
        const results = await getPropertyInformationRequestsList(
            {
                "buyer._id": new mongoose.Types.ObjectId(buyerId)
            },
            {
                firstName: "$seller.firstName",
                lastName: "$seller.lastName",
                email: "$seller.email",
                propertyId: "$property.id",
                propertyPrice: "$property.listingPrice",
                propertyName: "$property.propertyName",
                requestId: "$_id",
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                _id: 0
            }
        )

        if (!results) {
            return res.status(404).json({
                message: "No Commercial Property Information Requests Found."
            })
        }

        res.status(200).json({ response: results })
    } catch (error) {
        console.log(
            "Error getting commercial property informations requests:",
            error
        )
        res.status(500).json({
            error: `Error getting commercial property informations requests:  ${error}`,
            message: error.message
        })
    }
}
export const getPropertyInformationRequestsBySellerId = async (
    req: Request,
    res: Response
) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const sellerId = req.params?.id

    if (!sellerId) return res.status(400).json({ error: "Missing seller id." })

    const listOfBiRequests = []
    let listOfPropertyUnderSellerName

    try {
        listOfPropertyUnderSellerName = await getPropertyListByUserId(
            new mongoose.Types.ObjectId(sellerId),
            null,
            {
                _id: 1,
                propertyName: 1
            }
        )
        if (listOfPropertyUnderSellerName?.length === 0)
            return res.status(404).json({
                message: "No commercial property informations requests found."
            })
    } catch (error) {
        console.log(
            "Error getting commercial property informations requests:",
            error
        )
        res.status(500).json({
            error: `Error getting commercial property informations requests:  ${error}`,
            message: error.message
        })
    }

    try {
        for (const property of listOfPropertyUnderSellerName) {
            const results = await getPropertyInformationRequestsList(
                {
                    "property.userId": new mongoose.Types.ObjectId(sellerId),
                    "property.id": property._id
                },
                {
                    firstName: "$buyer.firstName",
                    lastName: "$buyer.lastName",
                    email: "$buyer.email",
                    propertyId: "$property.id",
                    propertyPrice: "$property.listingPrice",
                    requestId: "$_id",
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    _id: 0
                }
            )
            listOfBiRequests.push({
                propertyName: property.propertyName,
                requests: results
            })
        }
        if (listOfBiRequests.length === 0) {
            return res.status(404).json({
                message: "No commercial property information requests found."
            })
        }
        res.status(200).json({ response: listOfBiRequests })
    } catch (error) {
        console.log(
            "Error getting commercial property informations requests:",
            error
        )
        res.status(500).json({
            error: `Error getting commercial property informations requests:  ${error}`,
            message: error.message
        })
    }
}

export const getSellerByPropertyMetadata = async (
    req: Request,
    res: Response
) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() })

    if (!req?.body || Object.keys(req?.body).length === 0)
        return res.status(400).json({ errors: "Missing property params." })

    let sellerProperty, seller
    const { propertyName, location: country, price: listingPrice } = req.body
    try {
        const filter = Object.fromEntries(
            Object.entries({ propertyName, country, listingPrice }).filter(
                ([_, v]) => v !== null || v !== ""
            )
        )
        sellerProperty = await getPropertyByMultipleQueryMetadata(filter)
    } catch (error) {
        console.log("Error verifying if seller property exists:", error)
        res.status(500).json({
            error: `Error verifying if seller property exists:  ${error}`,
            message: error.message
        })
    }

    if (!sellerProperty) {
        return res.status(404).json({
            error: "Commercial Property not found, hence, no seller data to link in the invite."
        })
    }

    try {
        seller = await getUserById(sellerProperty.userId)
    } catch (error) {
        console.log("Error getting seller user:", error)
        res.status(500).json({
            error: `Error getting seller user:  ${error}`,
            message: error.message
        })
    }

    const { email, firstName, lastName } = seller

    return res.status(200).json({ email, firstName, lastName })
}

export const getPropertyInformationRequestsForConsulting = async (
    req: Request,
    res: Response
) => {
    const errors = validationResult(req).array()
    if (errors.length > 0) {
        return res.status(400).json({ errors })
    }

    try {
        const results = await getAllPropertyInformationRequests({
            "buyer.firstName": 1,
            "buyer.lastName": 1,
            "buyer.email": 1,
            "seller.firstName": 1,
            "seller.lastName": 1,
            "seller.email": 1,
            "property.id": 1,
            "property.listingPrice": 1,
            "property.propertyName": 1,
            "property.documents": 1,
            _id: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1
        })

        if (!Array.isArray(results) || results.length === 0) {
            return res.status(404).json({
                message: "No commercial property information requests found."
            })
        }

        const groupedByProperty = results.reduce((acc: any, curr: any) => {
            if (
                !curr.property ||
                typeof curr.property.propertyName !== "string"
            ) {
                return acc
            }
            const propertyName = curr.property.propertyName
            if (!acc[propertyName]) {
                acc[propertyName] = []
            }
            const request = {
                status: curr.status,
                createdAt: curr.createdAt,
                updatedAt: curr.updatedAt,
                firstName: curr.buyer?.firstName,
                lastName: curr.buyer?.lastName,
                email: curr.buyer?.email,
                propertyId: curr.property.id,
                propertyPrice: curr.property.listingPrice,
                requestId: curr._id
            }
            acc[propertyName].push(request)
            return acc
        }, {})

        const finalResult = Object.entries(groupedByProperty).map(
            ([propertyName, requests]) => ({
                propertyName,
                requests
            })
        )

        res.status(200).json({ response: finalResult })
    } catch (error) {
        console.error(
            "Error getting commercial property information requests:",
            error
        )
        res.status(500).json({
            error: `Error getting commercial propery information requests: ${error}`,
            message: error.message
        })
    }
}
