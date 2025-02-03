import { Request, Response } from "express"
import ContactModel from "../models/contact"
import IntegrationModel from "../models/integration"
import FunnelModel from "../models/funnel"
import ListModel from "../models/list"
import { OrderModel } from "../models/order"
import { IExtendedRequest } from "../types/IExtendedRequest"
import Papa from "papaparse"
import { IContact, IContactExtended } from "../types/IContact"
import { sendWebhook } from "./webhookController"
import { getFunnelAndPageFromUrl } from "../utils/funnelUtils"
import { Types } from "mongoose"

export const createContact = async (req: IExtendedRequest, res: Response) => {
    try {
        const url = req.body.url
        const nameTokens = req.body.name.split(" ")
        const firstName = nameTokens[0]
        let lastName = ""
        if (nameTokens.length > 1) {
            lastName = nameTokens.slice(1).join(" ")
        }

        const { funnel, page, path } = await getFunnelAndPageFromUrl(url)

        if (!funnel || path === null) {
            throw new Error("Invalid funnel or path")
        }

        if (!page) {
            throw new Error("Invalid page")
        }

        const email = (req.body.email || "").toLowerCase().trim()

        const existingContact = await ContactModel.findOne({ email }).exec()

        if (existingContact) {
            existingContact.firstName = firstName
            existingContact.lastName = lastName
            existingContact.ip = req.ip

            await existingContact.save()

            return res.status(200).json(existingContact)
        }

        const listName = funnel.title + " - " + page.title
        let contactList = await ListModel.findOne({
            title: listName,
        })

        if (!contactList) {
            contactList = await ListModel.create({
                userId: funnel.user,
                title: listName,
                numContacts: 0,
            })
        }

        const newContact: IContact = new ContactModel({
            user: funnel.user,
            project: funnel.project,
            funnel: funnel._id,
            page: page._id,
            firstName,
            lastName,
            email,
            ...(req.body.phoneNumber && { phoneNumber: req.body.phoneNumber }),
            ...(req.body.address && { address: req.body.address }),
            ...(req.body.shippingAddress && { shippingAddress: req.body.shippingAddress }),
            ip: req.ip,
            listIds: [contactList._id]
        })
        await newContact.save()
        await contactList
            .updateOne({ numContacts: contactList.numContacts + 1 })
            .lean()
            .exec()

        if (funnel.webhooks) {
            for (const webhook of funnel.webhooks) {
                if (!webhook || webhook.length == 0) {
                    continue
                }
                console.log("Sending webhook=", webhook)

                sendWebhook({
                    url: webhook,
                    payload: newContact,
                    contact: newContact,
                    funnel,
                    page
                })
            }
        }

        const integrations = await IntegrationModel.find({
            $or: [
                {
                    type: "zapier",
                    "data.funnelId": funnel._id
                },
                {
                    type: "zapier",
                    "data.allFunnels": true,
                    user: funnel.user
                }
            ]
        })
            .lean()
            .exec()

        if (integrations) {
            for (const integration of integrations) {
                console.log("Sending zapier hook=", integration.data.hook)

                sendWebhook({
                    url: integration.data.hook,
                    payload: newContact,
                    contact: newContact,
                    funnel,
                    page
                })
            }
        }
        return res.status(200).json(newContact)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Server error" })
    }
}

export const insertContact = async (req: IExtendedRequest, res: Response) => {
    try {
        const funnelId = req.body.funnel_id
        const email = (req.body.email || "").toLowerCase().trim()
        let firstName = req.body.first_name || ""
        let lastName = req.body.last_name || ""
        const fullName = req.body.full_name || ""
        const phoneNumber = req.body.phone_number || ""

        if ((!firstName || !lastName) && fullName) {
            const nameTokens = fullName.split(" ")
            firstName = nameTokens[0]
            lastName = ""
            if (nameTokens.length > 1) {
                lastName = nameTokens.slice(1).join(" ")
            }
        }

        const funnel = await FunnelModel.findOne({
            _id: funnelId,
            user: req.user.id
        })
            .lean()
            .exec()

        if (!funnel) {
            throw new Error("Invalid funnel")
        }

        const existingContact = await ContactModel.findOne({ email }).exec()

        if (existingContact) {
            existingContact.firstName = firstName
            existingContact.lastName = lastName
            await existingContact.save()
        } else {
            const newContact: IContact = new ContactModel({
                user: funnel.user,
                project: funnel.project,
                funnel: funnel._id,
                firstName,
                lastName,
                email,
                ...(phoneNumber && { phoneNumber })
            })
            await newContact.save()
        }

        res.status(200).json({ result: "success" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const listFunnelContacts = async (req: Request, res: Response) => {
    try {
        const paginatedResults = (req as any).paginatedResults
        return res.status(200).json(paginatedResults)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Server error" })
    }
}

export const getAll = async (req: Request, res: Response) => {
    try {
        const paginatedResults = (req as any).paginatedResults
        return res.status(200).json(paginatedResults)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Server error" })
    }
}

export const listFunnelContactsCSV = async (req: Request, res: Response) => {
    try {
        const contacts = await ContactModel.find(
            { funnel: req.params.funnelId },
            "firstName lastName email createdAt"
        )
            .lean()
            .exec()

        const csv = Papa.unparse(contacts)

        res.setHeader("Content-Type", "text/csv")
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=contacts.csv"
        )

        return res.status(200).send(csv)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Server error" })
    }
}

export const listUserContacts = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const { funnel_id } = req.body

        const query =
            funnel_id === "All Funnels"
                ? {
                    user: req.user.id
                }
                : {
                    user: req.user.id,
                    funnel: new Types.ObjectId(funnel_id)
                }

        const contacts = await ContactModel.find(
            query,
            "firstName lastName email createdAt"
        )
            .lean()
            .exec()

        res.status(200).send(contacts)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const deleteContact = async (req: IExtendedRequest, res: Response) => {
    const { id } = req.params

    try {
        const contact = await ContactModel.findOne({
            _id: id,
            user: req.user.id
        }).exec()

        if (!contact) {
            return res.status(404).json({ error: "Contact not found" })
        }

        await contact.deleteOne()

        return res.status(200).json({ message: "Contact deleted successfully" })
    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}

export const createUserContact = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const email = (req.body.email || "").toLowerCase().trim()

        const existingContact = await ContactModel.findOne({ email }).exec()

        if (existingContact) {
            existingContact.firstName = req.body.firstName
            existingContact.lastName = req.body.lastName
            existingContact.address = req.body.address
            existingContact.shippingAddress = req.body.shippingAddress

            await existingContact.save()

            return res.send(existingContact)
        } else {
            const contact = await ContactModel.create({
                user: req.user.id,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                address: req.body.address,
                shippingAddress: req.body.shippingAddress,
                ip: req.ip
            })

            return res.send(contact)
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: `Server error: ${err}` })
    }
}

export const userContactById = async (req: IExtendedRequest, res: Response) => {
    try {
        const contact = await ContactModel.findById(req.params.id)
        if (!contact) {
            return res.status(404).json({ error: "Contact not found" })
        }
        const contactObj: IContactExtended = contact.toObject()
        contactObj.numOfLists = contact.listIds.length
        const numOfPurchases = await OrderModel.countDocuments({
            contact: req.params.id
        })
        contactObj.numOfPurchases = numOfPurchases
        return res.send(contactObj)
    } catch (err) {
        console.log(err)
        return res
            .status(404)
            .json({ error: `error while getting by id : ${err}` })
    }
}

export const userContactByListId = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        if (!req.params.id) {
            return res
                .status(400)
                .json({ error: "listId parameter is required" })
        }
        const contacts = await ContactModel.find({
            listIds: { $in: [req.params.id] }
        })

        if (!contacts || contacts.length === 0) {
            return res
                .status(404)
                .json({ error: "No contacts found for the provided listId" })
        }

        return res.send(contacts)
        // const paginatedResults = (req as any).paginatedResults
        // return res.status(200).json(paginatedResults)
    } catch (err) {
        console.log(err)
        return res
            .status(404)
            .json({ error: `error while getting by id : ${err}` })
    }
}

export const userContactDelete = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const contact = await ContactModel.findById(req.params.id)

        if (!contact) {
            return res.status(404).json({ error: "Contact not found" })
        }

        await contact.deleteOne()
        return res.status(200).json({ message: "Contact deleted successfully" })
    } catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
}

export const updateUserContact = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const contact = await ContactModel.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true }
        )

        if (!contact) {
            return res.status(404).json({ error: "Contact not found" })
        }

        return res.send(contact)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: `Server error: ${err}` })
    }
}
