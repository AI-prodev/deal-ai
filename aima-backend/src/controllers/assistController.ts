import { Response } from "express"
import { validationResult } from "express-validator"
import AssistService from "../services/assist.service"
import assistSettingsService from "../services/assistSettings.service"
import { getRedis } from "../services/redis.service"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { ITicket, TicketStatusEnum } from "../types/ITicket"

export const generateAssistKey = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const { id } = req.user
        const { assistKey } = await AssistService.generateAssistKey(id)
        return res.status(201).json({ assistKey })
    } catch (error) {
        return res.status(400).json({
            error: `Error generating assist key: ${error?.message}`,
            message: error.message
        })
    }
}

export const createVisitorTicket = async (
    req: IExtendedRequest,
    res: Response
): Promise<{ data: ITicket; message: string } | Record<string, any>> => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { assistKey, visitorId } = req.query as unknown as Record<
            string,
            string
        >

        const { message, name, email, language, location } = req.body

        const visitor = {
            _id: visitorId,
            name,
            email,
            language,
            location
        }

        const createdTicket = await AssistService.createVisitorTicket(
            visitor,
            assistKey
        )

        await AssistService.createVisitorMessage(
            createdTicket?._id?.toString(),
            visitorId,
            assistKey,
            message
        )

        return res.status(201).json({
            message: "Ticket created successfully",
            data: createdTicket
        })
    } catch (error) {
        return res.status(400).json({
            error: `Error creating ticket: ${error?.message}`,
            message: error.message
        })
    }
}

export const createMessage = async (req: IExtendedRequest, res: Response) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const { id: userId } = req.user
        const { id } = req.params
        const { message } = req.body
        const ticket = await AssistService.createMessage(id, userId, message)

        // const key = await getRedis(
        //     `online_visitors:${ticket.appKey}:${ticket.visitor._id}`
        // )
        // if (!key) {
        //     const assistSettings =
        //         await assistSettingsService.getAssistSettings(
        //             ticket.appKey as unknown as string
        //         )
        //     const webhookData = {
        //         toEmail: ticket.visitor.email,
        //         firstName: ticket.visitor.name,
        //         siteName: assistSettings.name,
        //         siteUrl: `${assistSettings.url}?resumeTicket=${id}`
        //     }
        //     await fetch(
        //         "https://hooks.zapier.com/hooks/catch/14242389/3pux5as/",
        //         {
        //             method: "POST",
        //             headers: {
        //                 "Content-Type": "application/json"
        //             },
        //             body: JSON.stringify(webhookData)
        //         }
        //     )
        // }

        return res.status(201).json({ message: "Message created successfully" })
    } catch (error) {
        return res.status(404).json({
            error: `Error creating message: ${error}`,
            message: error.message
        })
    }
}

export const createImageMessage = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const { id: userId } = req.user
        const { id } = req.params

        const files = req.files
        if (!files.length) throw new Error("Files not found")

        await AssistService.createImageMessage(
            id,
            userId,
            files as Express.Multer.File[]
        )

        return res.status(201).json({ message: "Message created successfully" })
    } catch (error) {
        return res.status(404).json({
            error: `Error creating message: ${error}`,
            message: error.message
        })
    }
}

export const createVisitorMessage = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const { id } = req.params
        const { visitorId, assistKey } = req.query
        const { message } = req.body
        await AssistService.createVisitorMessage(
            id,
            visitorId as string,
            assistKey as string,
            message
        )

        return res.status(201).json({ message: "Message created successfully" })
    } catch (error) {
        return res.status(404).json({
            error: `Error creating message: ${error}`,
            message: error.message
        })
    }
}

export const createVisitorImageMessage = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const { id } = req.params
        const { visitorId, assistKey } = req.query

        const files = req.files
        if (!files.length) throw new Error("Files not found")

        await AssistService.createVisitorImageMessage(
            id,
            visitorId as string,
            assistKey as string,
            files as Express.Multer.File[]
        )

        return res.status(201).json({ message: "Message created successfully" })
    } catch (error) {
        return res.status(404).json({
            error: `Error creating message: ${error}`,
            message: error.message
        })
    }
}

export const updateTicketStatus = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const { id: userId } = req.user
        const { id } = req.params
        await AssistService.updateTicketStatus(id, userId)
        return res.status(200).json({ message: "Status updated successfully" })
    } catch (error) {
        return res.status(404).json({
            error: `Error updating ticket status: ${error?.message}`,
            message: error.message
        })
    }
}

export const updateVisitorData = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const { id } = req.params
        const { assistKey, visitorId } = req.query as unknown as Record<
            string,
            string
        >
        const { name, email } = req.body

        const data = await AssistService.updateVisitorData(
            id,
            visitorId,
            assistKey,
            {
                name,
                email
            }
        )
        return res
            .status(200)
            .json({ message: "Ticket visitor data updated successfully", data })
    } catch (error) {
        return res.status(404).json({
            error: `Error updating ticket visitor data: ${error?.message}`,
            message: error.message
        })
    }
}

export const getAssistKey = async (req: IExtendedRequest, res: Response) => {
    try {
        const { id } = req.user
        const { assistKey } = await AssistService.getAssistKey(id)

        return res.status(200).json({ assistKey })
    } catch (error) {
        return res.status(404).json({
            error: `Error fetching assist key: ${error?.message}`,
            message: error.message
        })
    }
}

export const getTickets = async (req: IExtendedRequest, res: Response) => {
    try {
        const { id } = req.user
        const { limit = 10, page = 1, search, status } = req.query
        const skip = (+page - 1) * +limit

        const { data, totalCount } = await AssistService.getTickets(
            id,
            skip as number,
            limit as number,
            status as TicketStatusEnum,
            search as string
        )

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
        return res.status(500).json({
            error: `Error fetching tickets: ${error?.message}`,
            message: error.message
        })
    }
}

export const getVisitorTickets = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const { visitorId, assistKey, limit = 10, page = 1, search } = req.query
        const skip = (+page - 1) * +limit

        const { data, totalCount } = await AssistService.getVisitorTickets(
            visitorId as string,
            assistKey as string,
            skip as number,
            limit as number,
            search as string
        )

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
        return res.status(500).json({
            error: `Error fetching tickets: ${error?.message}`,
            message: error.message
        })
    }
}

export const getTicketById = async (req: IExtendedRequest, res: Response) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const { id: userId } = req.user
        const { id } = req.params
        const data = await AssistService.getTicketById(id, userId)
        return res.status(200).json(data)
    } catch (error) {
        return res.status(404).json({
            error: `Error fetching ticket: ${error?.message}`,
            message: error.message
        })
    }
}

export const getVisitorTicketById = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const { id } = req.params
        const { assistKey } = req.query as Record<string, string>
        const data = await AssistService.getVisitorTicketById(id, assistKey)
        return res.status(200).json(data)
    } catch (error) {
        return res.status(404).json({
            error: `Error fetching ticket: ${error?.message}`,
            message: error.message
        })
    }
}

export const getVisitorIdByTicketId = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const { id } = req.params
        const data = await AssistService.getVisitorIdByTicketId(id)
        return res.status(200).json(data)
    } catch (error) {
        return res.status(404).json({
            error: `Error fetching visitor by ticket id: ${error?.message}`,
            message: error.message
        })
    }
}

export const getTicketMessagesById = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const { id: userId } = req.user
        const { id } = req.params
        const { limit = 10, page = 1, search } = req.query
        const skip = (+page - 1) * +limit

        const { data, totalCount } = await AssistService.getTicketMessagesById(
            id,
            userId,
            skip as number,
            limit as number,
            search as string
        )

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
        return res.status(404).json({
            error: `Error fetching ticket messages: ${error?.message}`,
            message: error.message
        })
    }
}

export const getVisitorTicketMessagesById = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const { id } = req.params
        const { limit = 10, page = 1, search, visitorId, assistKey } = req.query
        const skip = (+page - 1) * +limit

        const { data, totalCount } =
            await AssistService.getVisitorTicketMessagesById(
                id,
                visitorId as string,
                assistKey as string,
                skip as number,
                limit as number,
                search as string
            )

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
        return res.status(404).json({
            error: `Error fetching ticket messages: ${error?.message}`,
            message: error.message
        })
    }
}
