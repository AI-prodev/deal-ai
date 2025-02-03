import { IExtendedRequest } from "../types/IExtendedRequest"
import { Response } from "express"
import BroadcastEmailModel from "../models/broadcastEmail"
import { BroadcastEmailStatus, IBroadcastEmail } from "../types/IBroadcastEmail"
import mongoose from "mongoose"
import List from "../models/list"
import Integration from "../models/integration"
import { SendgridService } from "../services/sendgrid.service"
import BroadcastEmailData from "../models/broadcastEmailData"
import Contact from "../models/contact"
import ContactModel from "../models/contact"

export const create = async (req: IExtendedRequest, res: Response) => {
    try {
        const { body } = req

        if (
            !Object.values(body)?.length ||
            !body.lists?.length ||
            !body.sendgridAccount ||
            !body.status ||
            !body.subject ||
            !body.title ||
            !body.html
        ) {
            return res
                .status(400)
                .json({ error: "Please provide all required fields" })
        }

        if (!body.from || !body.from.email || !body.from.name) {
            return res
                .status(400)
                .json({ error: "Please provide a from email and name" })
        }

        if (body.status === BroadcastEmailStatus.report) {
            return res.status(400).json({ error: "Invalid status" })
        }

        if (
            body.status === BroadcastEmailStatus.scheduled &&
            (!body.scheduledAt || new Date(body.scheduledAt) < new Date())
        ) {
            return res
                .status(400)
                .json({ error: "Please provide a scheduled date" })
        }

        if (body.status === BroadcastEmailStatus.sendNow) {
            body.scheduledAt = null
            body.sentAt = null
        }

        if (
            body.lists &&
            Array.isArray(body.lists) &&
            body.lists.some((listId: string) => listId === "All Contacts")
        ) {
            body.lists = "All Contacts"
        } else {
            const lists = await List.find({ _id: { $in: body.lists } })
                .lean()
                .exec()
            if (lists.length !== body.lists.length) {
                return res
                    .status(400)
                    .json({ error: "One or more lists do not exist" })
            }

            body.lists = body.lists.map(
                (listId: string) => new mongoose.Types.ObjectId(listId)
            )
        }

        const sendgridAccount = await Integration.findOne({
            _id: body.sendgridAccount,
            type: "sendgrid"
        })
            .lean()
            .exec()
        if (!sendgridAccount) {
            return res
                .status(400)
                .json({ error: "Sendgrid account does not exist" })
        }

        body.sendgridAccount = new mongoose.Types.ObjectId(body.sendgridAccount)

        const newBroadcastEmail = await BroadcastEmailModel.create({
            user: req.user.id,
            sendgridAccount: body.sendgridAccount,
            lists: body.lists === "All Contacts" ? [] : body.lists,
            status: body.status,
            subject: body.subject,
            title: body.title,
            html: body.html,
            from: body.from,
            ...(body.status === BroadcastEmailStatus.scheduled && {
                scheduledAt: body.scheduledAt
            }),
            ...(body.status === BroadcastEmailStatus.sendNow && {
                sentAt: new Date()
            })
        })

        if (body.status === BroadcastEmailStatus.sendNow) {
            // Send email now to all contacts in the lists
            const sendgrid = new SendgridService(sendgridAccount.data.apiKey)

            sendgrid
                .sendEmailToListContacts({
                    data: {
                        from: body.from,
                        subject: body.subject,
                        html: body.html
                    },
                    lists: body.lists,
                    broadcastEmailId: newBroadcastEmail._id,
                    userId: req.user.id,
                    sendgridAccount: body.sendgridAccount,
                    title: body.title
                })
                .then(({ recipientsCount, deliveredCount }) => {
                    // Update the email status to report
                    BroadcastEmailModel.findOneAndUpdate(
                        { _id: newBroadcastEmail._id },
                        {
                            recipientsCount: recipientsCount || 0,
                            deliveredCount: deliveredCount || 0,
                            status: BroadcastEmailStatus.report,
                            sentAt: new Date()
                        }
                    )
                        .lean()
                        .exec()
                })
        } else if (body.status === BroadcastEmailStatus.scheduled) {
            // TODO: Schedule the email to be sent at the scheduled date
        }

        res.status(200).json({ message: "Email created", newBroadcastEmail })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

export const get = async (req: IExtendedRequest, res: Response) => {
    try {
        const { status = BroadcastEmailStatus.draft } = req.params as {
            status: BroadcastEmailStatus
        }
        const { sort = "-createdAt", limit = 10, page = 1, search } = req.query
        const skip = (+page - 1) * +limit

        if (
            !Object.values(BroadcastEmailStatus).includes(status) ||
            status === BroadcastEmailStatus.sendNow
        ) {
            return res.status(400).json({ error: "Invalid status" })
        }

        const query = { status, user: req.user.id } as {
            status: Omit<BroadcastEmailStatus, "sendNow">
            $or?: object[]
            user: string
        }

        if (search) {
            query["$or"] = [
                { title: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } }
            ]
        }

        const [data, totalCount] = await Promise.all([
            BroadcastEmailModel.find(query)
                .sort(sort as string)
                .limit(+limit)
                .skip(skip)
                .lean()
                .exec(),
            BroadcastEmailModel.countDocuments(query)
        ])

        return res.status(200).json({
            results: data,
            currentPage: +page,
            totalCount,
            totalPages: Math.ceil(totalCount / +limit),
            next: {
                page:
                    +page + 1 > Math.ceil(totalCount / +limit)
                        ? null
                        : +page + 1,
                limit: +page * +limit > totalCount ? null : +limit
            }
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

export const getOne = async (req: IExtendedRequest, res: Response) => {
    try {
        const { id } = req.params

        const bEmail = await BroadcastEmailModel.findOne({
            _id: id,
            user: req.user.id
        })
            .populate("lists sendgridAccount")
            .lean()
            .exec()

        if (!bEmail) return res.status(404).json({ error: "Email not found" })

        if (bEmail.lists?.length) {
            // TODO: do that in a better way (with a virtual field in the model)
            await Promise.all(
                bEmail.lists.map((list: any) => {
                    return ContactModel.countDocuments({
                        listIds: list._id,
                        unsubscribed: { $ne: true }
                    })
                        .then((subscribedContactsCount) => {
                            list.subscribedContactsCount =
                                subscribedContactsCount
                        })
                        .catch(() => {
                            list.subscribedContactsCount = 0
                        })
                })
            )
        }

        return res.status(200).json(bEmail)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

export const getBroadcastEmailStats = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const { broadcastEmailId } = req.params

        const [data, opensCount, clickCount] = await Promise.all([
            BroadcastEmailModel.findOne({ _id: broadcastEmailId })
                .select(
                    "title sentAt recipientsCount opensCount bounceCount clickCount deliveredCount"
                )
                .lean()
                .exec(),
            BroadcastEmailData.count({
                broadcastEmail: broadcastEmailId,
                opensCount: { $gt: 0 }
            }),
            BroadcastEmailData.count({
                broadcastEmail: broadcastEmailId,
                clickCount: { $gt: 0 }
            })
        ])

        if (!data) return res.status(404).json({ error: "Email not found" })

        const openRate = data.recipientsCount
            ? ((opensCount / data.recipientsCount) * 100).toFixed(2)
            : 0
        const clickRate = clickCount
            ? ((clickCount / opensCount) * 100).toFixed(2)
            : "0.00"

        data.opensCount = opensCount
        data.clickCount = clickCount

        return res.status(200).json({ ...data, openRate, clickRate })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

export const getBroadcastEmailData = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const { broadcastEmailId } = req.params
        const { sort = "-createdAt", limit = 10, page = 1 } = req.query
        const skip = (+page - 1) * +limit

        const [data, totalCount] = await Promise.all([
            BroadcastEmailData.find({ broadcastEmail: broadcastEmailId })
                .select("status to opensCount clickCount sentAt")
                .sort(sort as string)
                .limit(+limit)
                .skip(skip)
                .lean()
                .exec(),
            BroadcastEmailData.countDocuments({
                broadcastEmail: broadcastEmailId
            })
        ])

        return res.status(200).json({
            results: data,
            currentPage: +page,
            totalCount,
            totalPages: Math.ceil(totalCount / +limit),
            next: {
                page:
                    +page + 1 > Math.ceil(totalCount / +limit)
                        ? null
                        : +page + 1,
                limit: +page * +limit > totalCount ? null : +limit
            }
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

export const update = async (req: IExtendedRequest, res: Response) => {
    try {
        const { id } = req.params

        const checkEmail = await BroadcastEmailModel.findOne({
            _id: id,
            user: req.user.id
        })
            .lean()
            .exec()

        if (!checkEmail) {
            return res.status(404).json({ error: "Email not found" })
        }

        if (
            [
                BroadcastEmailStatus.sendNow,
                BroadcastEmailStatus.report
            ].includes(checkEmail.status)
        ) {
            return res.status(400).json({ error: "Email cannot be updated" })
        }

        const { body } = req
        const updateData = {} as Partial<Omit<IBroadcastEmail, "user">>

        if (!Object.keys(body).length) {
            return res
                .status(400)
                .json({ error: "Please provide one or more fields to update" })
        }

        if (body.status) {
            if (body.status === BroadcastEmailStatus.report) {
                return res.status(400).json({ error: "Invalid status" })
            }

            if (
                body.status === BroadcastEmailStatus.scheduled &&
                (!body.scheduledAt || new Date(body.scheduledAt) < new Date())
            ) {
                return res
                    .status(400)
                    .json({ error: "Please provide a valid scheduled date" })
            }

            if (body.status === BroadcastEmailStatus.sendNow) {
                updateData.scheduledAt = null
                updateData.sentAt = new Date()
            }

            if (body.status === BroadcastEmailStatus.scheduled) {
                updateData.scheduledAt = body.scheduledAt
                updateData.sentAt = null
            }

            updateData.status = body.status
        }

        if (body.lists?.length) {
            if (
                body.lists &&
                Array.isArray(body.lists) &&
                body.lists.some((listId: string) => listId === "All Contacts")
            ) {
                updateData.lists = []
            } else {
                const lists = await List.find({ _id: { $in: body.lists } })
                    .lean()
                    .exec()
                if (lists.length !== body.lists.length) {
                    return res
                        .status(400)
                        .json({ error: "One or more lists do not exist" })
                }
                updateData.lists = body.lists.map(
                    (listId: string) => new mongoose.Types.ObjectId(listId)
                )
            }
        }

        if (body.sendgridAccount) {
            const sendgridAccount = await Integration.findOne({
                _id: body.sendgridAccount,
                type: "sendgrid"
            })
                .lean()
                .exec()
            if (!sendgridAccount) {
                return res
                    .status(400)
                    .json({ error: "Sendgrid account does not exist" })
            }
            updateData.sendgridAccount = new mongoose.Types.ObjectId(
                body.sendgridAccount
            ) as any
        }

        if (body.subject) updateData.subject = body.subject
        if (body.title) updateData.title = body.title
        if (body.html) updateData.html = body.html
        if (body.from && !!Object.keys(body.from).length)
            updateData.from = body.from

        const updatedEmail: any = await BroadcastEmailModel.findOneAndUpdate(
            { _id: id },
            updateData,
            { returnDocument: "after", populate: "sendgridAccount" }
        )
            .lean()
            .exec()

        if (updatedEmail.status === BroadcastEmailStatus.sendNow) {
            // Send email now to all contacts in the lists
            const apiKey = updatedEmail.sendgridAccount.data?.apiKey
            const sendgrid = new SendgridService(apiKey as any)

            sendgrid
                .sendEmailToListContacts({
                    data: {
                        from: updatedEmail.from,
                        subject: updatedEmail.subject,
                        html: updatedEmail.html
                    },
                    lists: updatedEmail.lists?.length
                        ? updatedEmail.lists
                        : "All Contacts",
                    broadcastEmailId: id,
                    userId: req.user.id,
                    sendgridAccount: updatedEmail.sendgridAccount._id,
                    title: updatedEmail.title
                })
                .then(({ recipientsCount, deliveredCount }) => {
                    // Update the email status to report
                    BroadcastEmailModel.findOneAndUpdate(
                        { _id: id },
                        {
                            recipientsCount: recipientsCount || 0,
                            deliveredCount: deliveredCount || 0,
                            status: BroadcastEmailStatus.report,
                            sentAt: new Date()
                        }
                    )
                        .lean()
                        .exec()
                })
        }

        return res.status(200).json({ message: "Email updated" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

export const deleteEmail = async (req: IExtendedRequest, res: Response) => {
    try {
        const { id } = req.params

        await BroadcastEmailModel.findOneAndDelete({
            _id: id,
            user: req.user.id
        }).exec()

        return res.status(200).json({ message: "Email deleted" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

export const getVerifiedSenders = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const { accountId } = req.params

        const sendgridAccount = await Integration.findOne({
            _id: accountId,
            type: "sendgrid"
        })
            .lean()
            .exec()

        if (!sendgridAccount) {
            return res
                .status(400)
                .json({ error: "Sendgrid account does not exist" })
        }

        const sendgrid = new SendgridService(sendgridAccount.data.apiKey)

        const verifiedSenders = await sendgrid.getVerifiedSenders()

        return res.status(200).json(verifiedSenders)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

export const checkContactSubscribedStatus = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const { broadcastId, contactId } = req.query

        const contact = await Contact.findOne({ _id: contactId }).lean().exec()

        if (!contact) {
            return res.status(404).json({ error: "Contact not found" })
        }

        return res
            .status(200)
            .json({ unsubscribed: contact.unsubscribed || false })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

export const updateContactSubscribedStatus = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const { unsubscribed, contactId, broadcastId } = req.body

        const contact = await Contact.findOneAndUpdate(
            {
                _id: contactId
            },
            {
                unsubscribed
            }
        )
            .lean()
            .exec()

        if (!contact) {
            return res.status(404).json({ error: "Contact not found" })
        }

        return res.status(200).json({ message: "Contact status updated" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

export const getAllUserContactsCount = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const query = { unsubscribed: { $ne: true }, user: req.user.id }

        const totalCount = await Contact.countDocuments(query)

        return res.status(200).json({ totalCount })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}
