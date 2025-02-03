import { Request, Response } from "express"
import mongoose from "mongoose"
import { v4 as uuidv4 } from "uuid"
import { validationResult } from "express-validator"
import { processRequest } from "../utils/processRequest"
import { generatePassword } from "../utils/passwordGenerator"
import {
    createUserWithTempPassword,
    getUser,
    getUserById
} from "../services/user.service"
import { NewtonInput } from "../types/newTonTypes"
import { createProfileFromAutomation } from "../services/profile.service"
import {
    createNewBusiness,
    getBusiness,
    getBusinessByMultipleQueryMetadata,
    getBusinessListByUserId,
    updateBusiness
} from "../services/business.service"
import {
    createNewBusinessInformationRequest,
    createNewPropertyInformationRequest,
    getAllBusinessInformationRequests,
    getBusinessInformationRequestsList,
    getInformationRequestById,
    patchInformationRequestById
} from "../services/newton.service"
import { getPutPreSignedUrlFromS3Service } from "../services/files.service"
import {
    createNewProperty,
    getProperty,
    updateProperty
} from "../services/property.service"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { setRedis } from "../services/redis.service"

export const newTonStartRequest = async (req: IExtendedRequest, res: Response) => {
    const token = `pending-request:${uuidv4()}`

    let newtonInput: NewtonInput

    try {
        newtonInput = req.body
    } catch (err) {
        console.error("Couldn't parse NewtonInput")
        console.error(err)
    }

    // res.locals.pendingRequests.set(token, { status: "processing", progress: 0 })
    await setRedis(token, JSON.stringify({ status: "processing", progress: 0 }))

    const userId = req.user.id
    processRequest(token, newtonInput, userId).catch(async (err) => {
        console.error(err)
        await setRedis(token, JSON.stringify({
            status: "error",
            error: err.message
        }))
    })

    res.json({ token })
}

export const getBusinessInformationRequestById = async (
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
        const biRequest = await getInformationRequestById(
            new mongoose.Types.ObjectId(id)
        )

        if (!biRequest)
            return res
                .status(404)
                .json({ message: "No Business Information Request found." })
        res.status(200).json({ response: biRequest })
    } catch (error) {
        console.log("Error getting business informations request:", error)
        res.status(500).json({
            error: `Error getting business informations request:  ${error}`,
            message: error.message
        })
    }
}

export const patchBusinessInformationRequestById = async (
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
        const biRequest = await patchInformationRequestById(
            new mongoose.Types.ObjectId(id),
            update
        )

        if (!biRequest)
            return res
                .status(404)
                .json({ message: "No Business Information Request found." })
        res.status(200).json({ response: biRequest })
    } catch (error) {
        console.log("Error getting business informations request:", error)
        res.status(500).json({
            error: `Error getting business informations request:  ${error}`,
            message: error.message
        })
    }
}

export const getBusinessInformationRequestsBySellerId = async (
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
    let listOfBusinessUnderSellerName

    try {
        listOfBusinessUnderSellerName = await getBusinessListByUserId(
            new mongoose.Types.ObjectId(sellerId),
            null,
            {
                _id: 1,
                businessName: 1
            }
        )
        if (listOfBusinessUnderSellerName?.length === 0)
            return res.status(404).json({
                message: "No business informations requests found."
            })
    } catch (error) {
        console.log("Error getting business informations requests:", error)
        res.status(500).json({
            error: `Error getting business informations requests:  ${error}`,
            message: error.message
        })
    }

    try {
        for (const business of listOfBusinessUnderSellerName) {
            const results = await getBusinessInformationRequestsList(
                {
                    "business.userId": new mongoose.Types.ObjectId(sellerId),
                    "business.id": business._id
                },
                {
                    firstName: "$buyer.firstName",
                    lastName: "$buyer.lastName",
                    email: "$buyer.email",
                    businessId: "$business.id",
                    businessPrice: "$business.listingPrice",
                    requestId: "$_id",
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    _id: 0
                }
            )
            listOfBiRequests.push({
                businessName: business.businessName,
                requests: results
            })
        }
        if (listOfBiRequests.length === 0) {
            return res.status(404).json({
                message: "No business information requests found."
            })
        }
        res.status(200).json({ response: listOfBiRequests })
    } catch (error) {
        console.log("Error getting business informations requests:", error)
        res.status(500).json({
            error: `Error getting business informations requests:  ${error}`,
            message: error.message
        })
    }
}

export const getBusinessInformationRequestsByBuyerId = async (
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
        const results = await getBusinessInformationRequestsList(
            {
                "buyer._id": new mongoose.Types.ObjectId(buyerId)
            },
            {
                firstName: "$seller.firstName",
                lastName: "$seller.lastName",
                email: "$seller.email",
                businessId: "$business.id",
                businessPrice: "$business.listingPrice",
                businessName: "$business.businessName",
                requestId: "$_id",
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                _id: 0
            }
        )
        if (!results) {
            return res.status(404).json({
                message: "No business information requests found."
            })
        }
        res.status(200).json({ response: results })
    } catch (error) {
        console.log("Error getting business informations requests:", error)
        res.status(500).json({
            error: `Error getting business informations requests:  ${error}`,
            message: error.message
        })
    }
}

// For Counsulting Roles

export const getBusinessInformationRequestsForConsulting = async (
    req: Request,
    res: Response
) => {
    const errors = validationResult(req).array()
    if (errors.length > 0) {
        return res.status(400).json({ errors })
    }

    try {
        const results = await getAllBusinessInformationRequests({
            "buyer.firstName": 1,
            "buyer.lastName": 1,
            "buyer.email": 1,
            "seller.firstName": 1,
            "seller.lastName": 1,
            "seller.email": 1,
            "business.id": 1,
            "business.listingPrice": 1,
            "business.businessName": 1,
            "business.documents": 1,
            _id: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1
        })

        if (!Array.isArray(results) || results.length === 0) {
            return res
                .status(404)
                .json({ message: "No business information requests found." })
        }

        const groupedByBusiness = results.reduce((acc: any, curr: any) => {
            if (
                !curr.business ||
                typeof curr.business.businessName !== "string"
            ) {
                return acc
            }
            const businessName = curr.business.businessName
            if (!acc[businessName]) {
                acc[businessName] = []
            }
            const request = {
                status: curr.status,
                createdAt: curr.createdAt,
                updatedAt: curr.updatedAt,
                firstName: curr.buyer?.firstName,
                lastName: curr.buyer?.lastName,
                email: curr.buyer?.email,
                businessId: curr.business.id,
                businessPrice: curr.business.listingPrice,
                requestId: curr?._id
            }
            acc[businessName].push(request)
            return acc
        }, {})

        const finalResult = Object.entries(groupedByBusiness).map(
            ([businessName, requests]) => ({
                businessName,
                requests
            })
        )

        res.status(200).json({ response: finalResult })
    } catch (error) {
        console.error("Error getting business information requests:", error)
        res.status(500).json({
            error: `Error getting business information requests: ${error}`,
            message: error.message
        })
    }
}

export const getSellerByBusinessMetadata = async (
    req: Request,
    res: Response
) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() })

    if (!req?.body || Object.keys(req?.body).length === 0)
        return res.status(400).json({ errors: "Missing business params." })

    let sellerBusiness, seller
    const { businessName, location: country, price: listingPrice } = req.body
    try {
        const filter = Object.fromEntries(
            Object.entries({ businessName, country, listingPrice }).filter(
                ([_, v]) => v !== null || v !== ""
            )
        )
        sellerBusiness = await getBusinessByMultipleQueryMetadata(filter)
    } catch (error) {
        console.log("Error verifying if seller business exists:", error)
        res.status(500).json({
            error: `Error verifying if seller business exists:  ${error}`,
            message: error.message
        })
    }

    if (!sellerBusiness) {
        return res.status(404).json({
            error: "Business not found, hence, no seller data to link in the invite."
        })
    }

    try {
        seller = await getUserById(sellerBusiness.userId)
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

export const sendSellerChecklist = async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { seller, checklist, business, buyer, responses } = req.body
    if (!seller) {
        return res.status(400).json({ error: "Seller email is required" })
    }

    let addedSeller,
        interestedBuyer,
        newSellerBusiness,
        isExistingSeller,
        password

    try {
        addedSeller = await getUser(seller.email)
    } catch (error) {
        console.log("Error getting seller user:", error)
        res.status(500).json({
            error: `Error getting seller user:  ${error}`,
            message: error.message
        })
    }

    if (!addedSeller) {
        password = generatePassword(6)
        try {
            addedSeller = await createUserWithTempPassword({
                ...seller,
                password,
                roles: ["externalseller"]
            })
        } catch (error) {
            console.log("Error creating seller user:", error)
            res.status(500).json({
                error: `Error creating seller user:  ${error}`,
                message: error.message
            })
        }

        try {
            await createProfileFromAutomation(addedSeller)
        } catch (error) {
            console.log("Error creating seller profile:", error)
            res.status(500).json({
                error: `Error creating seller profile:  ${error}`,
                message: error.message
            })
        }
    } else isExistingSeller = true

    // console.log("Will get existing buyer")
    try {
        interestedBuyer = await getUser(buyer)
    } catch (error) {
        console.log("Error getting interested buyer:", error)
        res.status(500).json({
            error: `Error getting interested buyer:  ${error}`,
            message: error.message
        })
    }

    try {
        newSellerBusiness = await getBusiness({
            userId: addedSeller?._id,
            businessName: business.businessName
        })
    } catch (error) {
        console.log("Error verifying if seller business exists:", error)
        res.status(500).json({
            error: `Error verifying if seller business exists:  ${error}`,
            message: error.message
        })
    }

    if (!newSellerBusiness) {
        try {
            newSellerBusiness = await createNewBusiness({
                ...business,
                purchaseType: "",
                userId: addedSeller?._id,
                country: business.location,
                state: "",
                zip: "",
                listingPrice: business.price ?? 0,
                assetsIncluded: business.includedAssets,
                imported: true,
                enabled: false,
                biRequests: []
            })
        } catch (error) {
            console.log("Error creating seller business:", error)
            res.status(500).json({
                error: `Error creating seller business:  ${error}`,
                message: error.message
            })
        }
    }

    const newBiRequest = {
        buyer: {
            firstName: interestedBuyer.firstName,
            lastName: interestedBuyer.lastName,
            email: interestedBuyer.email,
            status: interestedBuyer.status,
            _id: interestedBuyer._id
        },
        seller: {
            firstName: addedSeller.firstName,
            lastName: addedSeller.lastName,
            email: addedSeller.email,
            status: addedSeller.status,
            _id: addedSeller._id
        },
        business: {
            id: newSellerBusiness._id,
            userId: addedSeller._id,
            businessName: business.businessName,
            businessDescription: business.businessDescription,
            listingPrice: business.price ?? 0
        },
        responses,
        checklist: JSON.stringify(checklist)
    }
    if (newSellerBusiness.biRequests?.length === 0)
        newSellerBusiness.biRequests = [newBiRequest]
    else newSellerBusiness.biRequests.push(newBiRequest)
    const { biRequests } = newSellerBusiness

    try {
        await createNewBusinessInformationRequest(newBiRequest)
    } catch (error) {
        console.log(
            "Error creating seller business information request:",
            error
        )
        res.status(500).json({
            error: `Error creating seller business information request:  ${error}`,
            message: error.message
        })
    }

    try {
        await updateBusiness({
            business: {
                ...newSellerBusiness,
                biRequests
            },
            userId: addedSeller._id,
            _id: newSellerBusiness._id
        })
    } catch (error) {
        console.log(
            "Error updating seller business information request:",
            error
        )
        res.status(500).json({
            error: `Error updating seller business information request:  ${error}`,
            message: error.message
        })
    }

    try {
        const webhookData = {
            email: seller.email,
            preferredName: seller.preferredName,
            checklist,
            businessName: business.businessName,
            dealLink: "https://go.deal.ai/auth/cover-login",
            businessLink: business.url,
            buyerName: `${interestedBuyer.firstName} ${interestedBuyer.lastName}`,
            password
        }
        if (!isExistingSeller)
            await fetch(
                "https://hooks.zapier.com/hooks/catch/15280994/364i3pb/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(webhookData)
                }
            )
        else
            await fetch(
                "https://hooks.zapier.com/hooks/catch/15280994/36zqdjn/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(webhookData)
                }
            )
        const message = "Checklist Email sent to seller."

        res.status(200).json({
            message: message
        })
    } catch (error) {
        console.log("Error calling seller invitation webhook:", error)
        res.status(500).json({
            error: "Server error, please try again later."
        })
    }
}

export const sendSellerPropertyChecklist = async (
    req: Request,
    res: Response
) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { seller, checklist, property, buyer, responses } = req.body

    let addedSeller,
        interestedBuyer,
        newSellerProperty,
        isExistingSeller,
        password

    // console.log("Will check if there is an existing seller")

    try {
        addedSeller = await getUser(seller.email)
    } catch (error) {
        console.log("Error getting seller user:", error)
        res.status(500).json({
            error: `Error getting seller user:  ${error}`,
            message: error.message
        })
    }

    if (!addedSeller) {
        password = generatePassword(6)
        try {
            addedSeller = await createUserWithTempPassword({
                ...seller,
                password,
                roles: ["externalseller"]
            })
        } catch (error) {
            console.log("Error creating seller user:", error)
            res.status(500).json({
                error: `Error creating seller user:  ${error}`,
                message: error.message
            })
        }

        try {
            await createProfileFromAutomation(addedSeller)
        } catch (error) {
            console.log("Error creating seller profile:", error)
            res.status(500).json({
                error: `Error creating seller profile:  ${error}`,
                message: error.message
            })
        }
    } else isExistingSeller = true

    // console.log("Will get existing buyer")
    try {
        interestedBuyer = await getUser(buyer)
    } catch (error) {
        console.log("Error getting interested buyer:", error)
        res.status(500).json({
            error: `Error getting interested buyer:  ${error}`,
            message: error.message
        })
    }

    try {
        newSellerProperty = await getProperty({
            userId: addedSeller._id,
            propertyName: property.propertyName
        })
    } catch (error) {
        console.log("Error verifying if seller property exists:", error)
        res.status(500).json({
            error: `Error verifying if seller property exists:  ${error}`,
            message: error.message
        })
    }

    if (!newSellerProperty) {
        try {
            newSellerProperty = await createNewProperty({
                ...property,
                listingPrice: property.price,
                userId: addedSeller._id,
                enabled: false,
                imported: true
            })
        } catch (error) {
            console.log("Error creating seller property:", error)
            res.status(500).json({
                error: `Error creating seller property:  ${error}`,
                message: error.message
            })
        }
    }

    const newBiRequest = {
        buyer: {
            firstName: interestedBuyer.firstName,
            lastName: interestedBuyer.lastName,
            email: interestedBuyer.email,
            status: interestedBuyer.status,
            _id: interestedBuyer._id
        },
        seller: {
            firstName: addedSeller.firstName,
            lastName: addedSeller.lastName,
            email: addedSeller.email,
            status: addedSeller.status,
            _id: addedSeller._id
        },
        property: {
            id: newSellerProperty._id,
            userId: addedSeller._id,
            propertyName: property.propertyName,
            propertyDescription: property.propertyDescription,
            listingPrice: property.price ?? 0
        },
        responses,
        checklist: JSON.stringify(checklist)
    }
    if (newSellerProperty.biRequests?.length === 0)
        newSellerProperty.biRequests = [newBiRequest]
    else newSellerProperty.biRequests.push(newBiRequest)
    const { biRequests } = newSellerProperty

    // console.log("Will create the checklist data persistency")
    try {
        await createNewPropertyInformationRequest(newBiRequest)
    } catch (error) {
        console.log(
            "Error creating seller business information request:",
            error
        )
        res.status(500).json({
            error: `Error creating seller business information request:  ${error}`,
            message: error.message
        })
    }

    // console.log("Will now update the business with the bi requested")
    try {
        await updateProperty({
            property: {
                ...newSellerProperty,
                biRequests
            },
            userId: addedSeller._id,
            _id: newSellerProperty._id
        })
    } catch (error) {
        console.log(
            "Error updating seller business information request:",
            error
        )
        res.status(500).json({
            error: `Error updating seller business information request:  ${error}`,
            message: error.message
        })
    }

    try {
        const webhookData = {
            email: seller.email,
            preferredName: seller.preferredName,
            checklist,
            propertyName: property.propertyName,
            dealLink: "https://go.deal.ai/auth/cover-login",
            buyerName: `${interestedBuyer.firstName} ${interestedBuyer.lastName}`,
            password
        }
        if (!isExistingSeller)
            await fetch(
                "https://hooks.zapier.com/hooks/catch/15280994/3mxy5hd/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(webhookData)
                }
            )
        else
            await fetch(
                "https://hooks.zapier.com/hooks/catch/15280994/3mxy5a3/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(webhookData)
                }
            )
        const message = "Checklist Email sent to seller."

        res.status(200).json({
            message: message
        })
    } catch (error) {
        console.log("Error calling seller invitation webhook:", error)
        res.status(500).json({
            error: "Server error, please try again later."
        })
    }
}

export const getSignedUrlFromS3 = async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() })

    const { fileName, fileType } = req.query

    if (!fileName && !fileType)
        return res
            .status(400)
            .json({ error: "Missing file name and/or file type params" })

    const options = {
        Bucket: process.env.S3_BUCKET,
        Key: encodeURI(fileName as string),
        ContentType: fileType as string
    }

    try {
        const signedUrlsFromS3 = await getPutPreSignedUrlFromS3Service(options)
        res.status(200).json(signedUrlsFromS3)
    } catch (error) {
        console.log("Error getting signed url from S3:", error)
        res.status(500).json({
            error: `Error getting signed url from S3:  ${error}`,
            message: error.message
        })
    }
}
