import { v4 as uuidv4 } from "uuid"
import mongoose, { PipelineStage } from "mongoose"
import TicketModel from "../models/assist"
import UserModel from "../models/user"
import {
    IMessage,
    ITicket,
    IVisitor,
    MessageTypeEnum,
    TicketStatusEnum
} from "../types/ITicket"
import assistSettingsService from "./assistSettings.service"
import * as fs from "fs"
import { randomUUID } from "crypto"
import { putObject } from "./files.service"

const generateAssistKey = async (
    id: string
): Promise<{ assistKey: string }> => {
    try {
        const key = uuidv4()
        const userFound = await UserModel.findOne({ _id: id })
        if (!userFound) throw new Error("User not found")
        if (userFound.assistKey) throw new Error("Key already exists")

        userFound.assistKey = key
        await userFound.save()
        await assistSettingsService.createAssistSettings(key)
        return { assistKey: userFound.assistKey }
    } catch (error) {
        throw new Error(error)
    }
}

const createVisitorTicket = async (
    visitor: IVisitor,
    assistKey: string
): Promise<ITicket & { user: { firstName: string; lastName: string } }> => {
    try {
        const userFound = await UserModel.findOne(
            { assistKey },
            "id firstName lastName"
        )
        if (!userFound) throw new Error("Key not found")

        const ticket = await TicketModel.create({
            visitor,
            appKey: assistKey
        })
        return {
            ...ticket.toObject(),
            user: {
                firstName: userFound.firstName,
                lastName: userFound.lastName
            }
        } as ITicket & { user: { firstName: string; lastName: string } }
    } catch (error) {
        throw new Error(error)
    }
}

const createMessage = async (
    id: string,
    userId: string,
    message: string,
    isBot: boolean = false
): Promise<Omit<ITicket, "messages">> => {
    try {
        if (isBot) {
            await TicketModel.updateOne(
                { _id: id },
                {
                    $push: {
                        messages: { sentBy: userId, message, isBot }
                    }
                }
            )
            return
        }

        const userFound = await UserModel.findOne({ _id: userId })
        if (!userFound) throw new Error("User not found")

        const updatedTicket = await TicketModel.findOneAndUpdate(
            {
                _id: id,
                appKey: userFound.assistKey
            },
            {
                $push: {
                    messages: { sentBy: userId, message, seenBy: [userId] }
                }
            },
            { new: true, projection: "-messages" }
        )
        if (updatedTicket.status === TicketStatusEnum.CLOSED) {
            updatedTicket.status = TicketStatusEnum.OPEN
            updatedTicket.save()
        }
        return updatedTicket
    } catch (error) {
        throw new Error(error)
    }
}

const createImageMessage = async (
    id: string,
    userId: string,
    files: Express.Multer.File[]
): Promise<void> => {
    try {
        const userFound = await UserModel.findOne({ _id: userId })
        if (!userFound) throw new Error("User not found")

        const images: string[] = await new Promise((resolve) => {
            const promises = files?.map(async (file) => {
                const fileContent = fs.readFileSync(file.path)
                const fileKey = `${id}_${randomUUID()}_${file.originalname}`
                await putObject({
                    Bucket: process.env.S3_UPLOADS_BUCKET,
                    Key: fileKey,
                    Body: fileContent,
                    ContentType: file.mimetype
                })

                return process.env.CLOUDFRONT_UPLOADS_PREFIX + `/${fileKey}`
            })

            Promise.all(promises).then((imageUrls) => {
                resolve(imageUrls)
            })
        })

        if (!images.length) throw new Error("Failed to create message")

        const updatedTicket = await TicketModel.findOneAndUpdate(
            {
                _id: id,
                appKey: userFound.assistKey
            },
            {
                $push: {
                    messages: {
                        sentBy: userId,
                        type: MessageTypeEnum.IMAGE,
                        images,
                        seenBy: [userId]
                    }
                }
            },
            {
                new: true,
                projection: "-messages"
            }
        )

        if (!updatedTicket) throw new Error("Ticket not found")
    } catch (error) {
        throw new Error(error)
    }
}
const createVisitorMessage = async (
    id: string,
    visitorId: string,
    assistKey: string,
    message: string
): Promise<void> => {
    try {
        const ticket = await TicketModel.findOne({
            _id: id,
            "visitor._id": visitorId,
            appKey: assistKey
        })
        if (!ticket) throw new Error("Ticket not found")

        ticket.messages.push({
            sentBy: {
                _id: ticket.visitor._id,
                name: ticket.visitor.name
            },
            message,
            seenBy: [ticket.visitor._id]
        })
        if (ticket.status === TicketStatusEnum.CLOSED)
            ticket.status = TicketStatusEnum.OPEN
        await ticket.save()
    } catch (error) {
        throw new Error(error)
    }
}

const createVisitorImageMessage = async (
    id: string,
    visitorId: string,
    assistKey: string,
    files: Express.Multer.File[]
): Promise<void> => {
    try {
        const ticket = await TicketModel.findOne({
            _id: id,
            "visitor._id": visitorId,
            appKey: assistKey
        })
        if (!ticket) throw new Error("Ticket not found")

        const images: string[] = await new Promise((resolve) => {
            const promises = files?.map(async (file) => {
                const fileContent = fs.readFileSync(file.path)
                const fileKey = `${id}_${randomUUID()}_${file.originalname}`
                await putObject({
                    Bucket: process.env.S3_UPLOADS_BUCKET,
                    Key: fileKey,
                    Body: fileContent,
                    ContentType: file.mimetype
                })

                return process.env.CLOUDFRONT_UPLOADS_PREFIX + `/${fileKey}`
            })

            Promise.all(promises).then((imageUrls) => {
                resolve(imageUrls)
            })
        })

        if (!images.length) throw new Error("Failed to create message")

        ticket.messages.push({
            sentBy: {
                _id: ticket.visitor._id,
                name: ticket.visitor.name
            },
            type: MessageTypeEnum.IMAGE,
            images,
            seenBy: [ticket.visitor._id]
        })
        await ticket.save()
    } catch (error) {
        throw new Error(error)
    }
}
const updateTicketStatus = async (
    id: string,
    userId: string
): Promise<void> => {
    try {
        const userFound = await UserModel.findOne({ _id: userId })
        if (!userFound) throw new Error("User not found")

        const ticketFound = await TicketModel.findOne({
            _id: id,
            appKey: userFound.assistKey
        })
        if (!ticketFound) throw new Error("Ticket not found")

        if (ticketFound.status === TicketStatusEnum.OPEN)
            ticketFound.status = TicketStatusEnum.CLOSED
        else ticketFound.status = TicketStatusEnum.OPEN

        await ticketFound.save()
    } catch (error) {
        throw new Error(error)
    }
}

const updateVisitorData = async (
    id: string,
    visitorId: string,
    assistKey: string,
    body: { name: string; email: string }
): Promise<ITicket> => {
    try {
        const ticketFound = await TicketModel.findOne({
            _id: id,
            "visitor._id": visitorId,
            appKey: assistKey
        })
        if (!ticketFound) throw new Error("Ticket not found")

        ticketFound.visitor.name = body.name
        ticketFound.visitor.email = body.email

        ticketFound.messages = ticketFound.messages.map((message) => {
            if (
                !message.isBot &&
                (message.sentBy as IVisitor)?._id === visitorId
            )
                return {
                    ...message,
                    sentBy: {
                        ...message.sentBy,
                        name: body.name
                    } as IVisitor
                }
            else return message
        })
        await ticketFound.save()

        return ticketFound
    } catch (error) {
        throw new Error(error)
    }
}

const getAssistKey = async (id: string): Promise<{ assistKey: string }> => {
    try {
        const userFound = await UserModel.findOne({ _id: id }, "assistKey")
        if (!userFound) throw new Error("User not found")
        return { assistKey: userFound?.assistKey ?? "" }
    } catch (error) {
        throw new Error(error)
    }
}

const getTickets = async (
    userId: string,
    skip: number,
    limit: number,
    status?: TicketStatusEnum,
    search?: string
): Promise<{
    data: ITicket[]
    totalCount: number
}> => {
    try {
        const userFound = await UserModel.findOne({ _id: userId })
        let query: Record<string, any> = {
            appKey: userFound.assistKey
        }
        if (status) {
            query["status"] = status
        }
        if (search) {
            query["$or"] = [
                { "visitor.name": { $regex: search, $options: "i" } }
            ]
        }

        const stages: PipelineStage[] = [
            {
                $match: query
            },
            {
                $addFields: {
                    unreadCount: {
                        $size: {
                            $filter: {
                                input: "$messages",
                                cond: {
                                    $not: {
                                        $in: [userId, "$$this.seenBy"]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $sort: {
                    "messages.createdAt": -1,
                    unreadCount: -1
                }
            },
            {
                $skip: +skip
            },
            {
                $limit: +limit
            },
            {
                $project: {
                    _id: 1,
                    appKey: 1,
                    visitor: 1,
                    status: 1,
                    title: "$visitor.name",
                    description: {
                        $last: {
                            $map: {
                                input: "$messages",
                                as: "msg",
                                in: {
                                    $cond: {
                                        if: {
                                            $eq: [
                                                "$$msg.type",
                                                MessageTypeEnum.TEXT
                                            ]
                                        },
                                        then: "$$msg.message",
                                        else: "Image"
                                    }
                                }
                            }
                        }
                    },
                    lastMessageCreatedAt: { $last: "$messages.createdAt" },
                    createdAt: 1,
                    updatedAt: 1,
                    unreadCount: 1
                }
            }
        ]

        const [data, totalCount] = await Promise.all([
            TicketModel.aggregate(stages),
            TicketModel.countDocuments(query)
        ])
        return { data, totalCount }
    } catch (error) {
        throw new Error(error)
    }
}

const getVisitorTickets = async (
    visitorId: string,
    assistKey: string,
    skip: number,
    limit: number,
    search?: string
): Promise<{
    data: (ITicket & { user: Record<string, string> })[]
    totalCount: number
}> => {
    try {
        let query: Record<string, any> = {
            "visitor._id": visitorId,
            appKey: assistKey
        }
        if (search) {
            query["$or"] = [
                { "visitor.name": { $regex: search, $options: "i" } }
            ]
        }
        const stages: PipelineStage[] = [
            {
                $match: query
            },
            // {
            //     $lookup: {
            //         from: "users",
            //         localField: "appKey",
            //         foreignField: "assistKey",
            //         as: "user"
            //     }
            // },
            // {
            //     $unwind: {
            //         path: "$user"
            //     }
            // },
            // {
            //     $match: {
            //         "user.assistKey": assistKey
            //     }
            // },
            {
                $addFields: {
                    unreadCount: {
                        $size: {
                            $filter: {
                                input: "$messages",
                                cond: {
                                    $not: {
                                        $in: [visitorId, "$$this.seenBy"]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $sort: {
                    "messages.createdAt": -1,
                    unreadCount: -1
                }
            },
            {
                $skip: +skip
            },
            {
                $limit: +limit
            },
            {
                $project: {
                    _id: 1,
                    appKey: 1,
                    visitor: 1,
                    status: 1,
                    title: "$visitor.name",
                    lastMessageCreatedAt: { $last: "$messages.createdAt" },
                    createdAt: 1,
                    updatedAt: 1,
                    // user: {
                    //     firstName: "$user.firstName",
                    //     lastName: "$user.lastName"
                    // },
                    unreadCount: 1
                }
            }
        ]
        const [data, totalCount, user] = await Promise.all([
            TicketModel.aggregate(stages),
            TicketModel.countDocuments(query),
            UserModel.findOne({ assistKey })
        ])
        const updatedData = data?.map((ticket) => ({
            ...ticket,
            user: { firstName: user.firstName, lastName: user.lastName }
        }))
        return {
            data: updatedData,
            totalCount
        }
    } catch (error) {
        throw new Error(error)
    }
}

const getTicketById = async (id: string, userId: string): Promise<ITicket> => {
    try {
        const userFound = await UserModel.findOne({ _id: userId })
        if (!userFound) throw new Error("User not found")
        const data = await TicketModel.findOne(
            { _id: id, appKey: userFound.assistKey },
            "-messages"
        )
        if (!data) throw new Error("Ticket not found")
        return data
    } catch (error) {
        throw new Error(error)
    }
}

const getVisitorTicketById = async (
    id: string,
    assistKey: string
): Promise<ITicket> => {
    try {
        const data = await TicketModel.findOne(
            { _id: id, appKey: assistKey },
            "-messages"
        )
        if (!data) throw new Error("Ticket not found")
        return data
    } catch (error) {
        throw new Error(error)
    }
}

const getVisitorIdByTicketId = async (
    id: string
): Promise<{ data: { visitorId: string } }> => {
    try {
        const data = await TicketModel.findOne({ _id: id }, "visitor._id")
        if (!data) throw new Error("Ticket not found")
        return { data: { visitorId: data.visitor._id } }
    } catch (error) {
        throw new Error(error)
    }
}

const getTicketMessagesById = async (
    id: string,
    userId: string,
    skip: number,
    limit: number,
    search?: string
): Promise<{
    data: IMessage[]
    totalCount: number
}> => {
    try {
        await TicketModel.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { $addToSet: { "messages.$[elem].seenBy": userId } },
            {
                multi: true,
                arrayFilters: [
                    { "elem.seenBy": { $not: { $elemMatch: { $eq: userId } } } }
                ]
            }
        )

        const stages: PipelineStage[] = [
            {
                $addFields: {
                    user: {
                        $toObjectId: userId
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: {
                    path: "$user"
                }
            },
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
                    $expr: {
                        $eq: ["$appKey", "$user.assistKey"]
                    }
                }
            },
            {
                $addFields: {
                    messagesCount: {
                        $size: "$messages"
                    }
                }
            },
            {
                $unwind: {
                    path: "$messages"
                }
            },
            {
                $addFields: {
                    "messages.sentByObjectId": {
                        $cond: {
                            if: {
                                $and: [
                                    {
                                        $eq: [
                                            { $type: "$messages.sentBy" },
                                            "string"
                                        ]
                                    },
                                    {
                                        $regexMatch: {
                                            input: "$messages.sentBy",
                                            regex: /^[0-9a-fA-F]{24}$/
                                        }
                                    }
                                ]
                            },
                            then: {
                                $toObjectId: "$messages.sentBy"
                            },
                            else: "$messages.sentBy"
                        }
                    }
                }
            },
            {
                $sort: {
                    "messages.createdAt": -1
                }
            },
            {
                $skip: +skip
            },
            {
                $limit: +limit
            },
            {
                $lookup: {
                    from: "users",
                    localField: "messages.sentByObjectId",
                    foreignField: "_id",
                    as: "messages.sentByUser"
                }
            },
            {
                $addFields: {
                    "messages.sentBy": {
                        $cond: {
                            if: {
                                $eq: [
                                    {
                                        $size: "$messages.sentByUser"
                                    },
                                    0
                                ]
                            },
                            then: "$messages.sentByObjectId",
                            else: {
                                _id: {
                                    $arrayElemAt: [
                                        "$messages.sentByUser._id",
                                        0
                                    ]
                                },
                                firstName: {
                                    $arrayElemAt: [
                                        "$messages.sentByUser.firstName",
                                        0
                                    ]
                                },
                                lastName: {
                                    $arrayElemAt: [
                                        "$messages.sentByUser.lastName",
                                        0
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    messages: {
                        _id: "$messages._id",
                        message: "$messages.message",
                        images: "$messages.images",
                        type: "$messages.type",
                        createdAt: "$messages.createdAt",
                        sentBy: {
                            $cond: {
                                if: {
                                    $eq: [
                                        {
                                            $size: "$messages.sentByUser"
                                        },
                                        0
                                    ]
                                },
                                then: "$messages.sentByObjectId",
                                else: {
                                    _id: "$messages.sentBy._id",
                                    firstName: "$messages.sentBy.firstName",
                                    lastName: "$messages.sentBy.lastName"
                                }
                            }
                        },
                        seenBy: "$messages.seenBy",
                        isBot: "$messages.isBot"
                    },
                    messagesCount: 1
                }
            },
            {
                $group: {
                    _id: "$_id",
                    messages: {
                        $push: "$messages"
                    },
                    messagesCount: {
                        $first: "$messagesCount"
                    }
                }
            }
        ]
        if (search)
            stages.splice(4, 0, {
                $match: {
                    $or: [
                        {
                            "messages.message": {
                                $regex: search,
                                $options: "i"
                            }
                        }
                    ]
                }
            })
        const [ticket] = await TicketModel.aggregate<
            ITicket & { messagesCount: number }
        >(stages)

        const { messagesCount = 0, messages = [] } = ticket || {}

        return { data: messages, totalCount: messagesCount }
    } catch (error) {
        throw new Error(error)
    }
}

const getVisitorTicketMessagesById = async (
    id: string,
    visitorId: string,
    assistKey: string,
    skip: number,
    limit: number,
    search?: string
): Promise<{
    data: IMessage[]
    totalCount: number
}> => {
    try {
        await TicketModel.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            {
                $addToSet: {
                    "messages.$[elem].seenBy": visitorId
                },
                "visitor.receivedMail": false
            },
            {
                multi: true,
                arrayFilters: [
                    {
                        "elem.seenBy": {
                            $not: { $elemMatch: { $eq: visitorId } }
                        }
                    }
                ]
            }
        )

        const stages: PipelineStage[] = [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
                    "visitor._id": visitorId,
                    appKey: assistKey
                }
            },
            {
                $addFields: {
                    messagesCount: {
                        $size: "$messages"
                    }
                }
            },
            {
                $unwind: {
                    path: "$messages"
                }
            },
            {
                $addFields: {
                    "messages.sentByObjectId": {
                        $cond: {
                            if: {
                                $and: [
                                    {
                                        $eq: [
                                            { $type: "$messages.sentBy" },
                                            "string"
                                        ]
                                    },
                                    {
                                        $regexMatch: {
                                            input: "$messages.sentBy",
                                            regex: /^[0-9a-fA-F]{24}$/
                                        }
                                    }
                                ]
                            },
                            then: {
                                $toObjectId: "$messages.sentBy"
                            },
                            else: "$messages.sentBy"
                        }
                    }
                }
            },
            {
                $sort: {
                    "messages.createdAt": -1
                }
            },
            {
                $skip: +skip
            },
            {
                $limit: +limit
            },
            {
                $lookup: {
                    from: "users",
                    localField: "messages.sentByObjectId",
                    foreignField: "_id",
                    as: "messages.sentByUser"
                }
            },
            {
                $addFields: {
                    "messages.sentBy": {
                        $cond: {
                            if: {
                                $eq: [
                                    {
                                        $size: "$messages.sentByUser"
                                    },
                                    0
                                ]
                            },
                            then: "$messages.sentByObjectId",
                            else: {
                                _id: {
                                    $arrayElemAt: [
                                        "$messages.sentByUser._id",
                                        0
                                    ]
                                },

                                firstName: {
                                    $arrayElemAt: [
                                        "$messages.sentByUser.firstName",
                                        0
                                    ]
                                },
                                lastName: {
                                    $arrayElemAt: [
                                        "$messages.sentByUser.lastName",
                                        0
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    messages: {
                        _id: "$messages._id",
                        message: "$messages.message",
                        images: "$messages.images",
                        type: "$messages.type",
                        createdAt: "$messages.createdAt",
                        sentBy: "$messages.sentBy",
                        seenBy: "$messages.seenBy",
                        isBot: "$messages.isBot"
                    },
                    messagesCount: 1
                }
            },
            {
                $group: {
                    _id: "$_id",
                    messages: {
                        $push: "$messages"
                    },
                    messagesCount: {
                        $first: "$messagesCount"
                    }
                }
            }
        ]
        if (search)
            stages.splice(1, 0, {
                $match: {
                    $or: [
                        {
                            "messages.message": {
                                $regex: search,
                                $options: "i"
                            }
                        }
                    ]
                }
            })
        const [ticket] = await TicketModel.aggregate<
            ITicket & { messagesCount: number }
        >(stages)

        const { messagesCount = 0, messages = [] } = ticket || {}
        return { data: messages, totalCount: messagesCount }
    } catch (error) {
        throw new Error(error)
    }
}
export default {
    generateAssistKey,
    createMessage,
    createImageMessage,
    createVisitorMessage,
    createVisitorImageMessage,
    createVisitorTicket,
    updateTicketStatus,
    updateVisitorData,
    getAssistKey,
    getTickets,
    getVisitorTickets,
    getTicketById,
    getVisitorTicketById,
    getVisitorIdByTicketId,
    getTicketMessagesById,
    getVisitorTicketMessagesById
}
