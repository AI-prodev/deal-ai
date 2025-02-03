import { Request, Response, NextFunction } from "express"
import mongoose, { Document, FilterQuery, Model } from "mongoose"
import { IExtendedRequest } from "../types/IExtendedRequest"

// Define custom types

interface PopulateField {
    path: string
    select: string
    from: string
}

interface PaginatedResults {
    next?: { page: number; limit: number }
    previous?: { page: number; limit: number }
    currentPage?: number
    totalPages?: number
    totalData?: number
    results?: Document[]
}

interface RequestWithPagination extends Request {
    paginatedResults?: PaginatedResults
    additionalFilters?: FilterQuery<Document>
}

// Pagination middleware
const paginateAndFilter = (
    model: Model<any>,
    populateField?: PopulateField,
    selectFields?: string,
    rateLimt?: boolean
) => {
    return async (
        req: RequestWithPagination,
        res: Response,
        next: NextFunction
    ) => {
        const funnelId = req.params.funnelId || undefined
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 15
        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        const filters = { ...req.query }
        if (funnelId) {
            filters.funnel = funnelId
        }
        delete filters.page
        delete filters.limit

        const sortField = filters.sort
        delete filters.sort

        const complexFilters: FilterQuery<Document> = {
            ...(req.additionalFilters || {})
        }
        const orConditions: any[] = []

        const operators: Record<string, string> = {
            "gt:": "$gt",
            "lt:": "$lt",
            "gte:": "$gte",
            "lte:": "$lte",
            "ne:": "$ne",
            "in:": "$in",
            "all:": "$all",
            "regex:": "$regex",
            "or:": "$or",
            "exists:": "$exists"
        }
        const keysToRemove: string[] = []

        for (const key in filters) {
            const value = filters[key]

            if (Array.isArray(value) || typeof value === "object") {
                continue
            }

            const stringValue = value as string

            // Handle the case where the value is a boolean
            if (
                stringValue.toLowerCase() === "true" ||
                stringValue.toLowerCase() === "false"
            ) {
                complexFilters[key] = stringValue.toLowerCase() === "true"
                continue
            }

            // Handle the case where the value is a number
            if (!isNaN(Number(stringValue))) {
                complexFilters[key] = Number(stringValue)
                continue
            }

            if (typeof stringValue === "string") {
                const operator = Object.keys(operators).find((op) =>
                    stringValue.startsWith(op)
                )
                if (operator) {
                    const actualValue: string = stringValue.slice(
                        operator.length
                    )

                    if (operator === "or:") {
                        if (typeof actualValue === "string") {
                            const fields = actualValue.split(",")

                            complexFilters["$or"] = fields.map((field) => ({
                                [field]: value
                            }))
                        } else {
                            throw new Error("Invalid value for 'or:' operator")
                        }
                    } else if (operator === "exists:") {
                        complexFilters[key] = {
                            [operators[operator]]:
                                actualValue.toLowerCase() === "true"
                        }
                    } else if (operator === "regex:") {
                        // List of special regex characters that need escaping
                        const specialCharacters = [
                            "\\",
                            "^",
                            "$",
                            ".",
                            "|",
                            "?",
                            "*",
                            "+",
                            "(",
                            ")",
                            "[",
                            "]",
                            "{",
                            "}"
                        ]

                        // Escape any special characters in the provided string
                        const escapedValue = actualValue
                            .split("")
                            .map((char) =>
                                specialCharacters.includes(char)
                                    ? `\\${char}`
                                    : char
                            )
                            .join("")

                        if (!escapedValue) {
                            return res.status(400).json({
                                message: "Invalid regex pattern provided."
                            })
                        }

                        complexFilters[key] = {
                            [operators[operator]]: escapedValue,
                            $options: "i" // for case insensitivity
                        }
                    } else {
                        complexFilters[key] = {
                            [operators[operator]]:
                                operator === "in:" || operator === "all:"
                                    ? typeof actualValue === "string"
                                        ? actualValue.split(",")
                                        : actualValue
                                    : actualValue
                        }
                    }

                    // for operator $or ,  mulitiple value search

                    if (key.startsWith("or:")) {
                        const actualKey = key.slice(3) // Remove the 'or:' prefix

                        const condition: any = {}
                        condition[actualKey] = complexFilters[key]

                        orConditions.push(condition)
                        keysToRemove.push(key)
                    }
                } else {
                    // Check if the value is a valid ObjectId
                    if (mongoose.Types.ObjectId.isValid(stringValue)) {
                        complexFilters[key] = new mongoose.Types.ObjectId(
                            stringValue
                        )
                    } else {
                        complexFilters[key] = stringValue
                    }
                }
            }
        }

        for (const key in complexFilters) {
            const value = complexFilters[key]
            if (
                typeof value === "string" &&
                mongoose.Types.ObjectId.isValid(value)
            ) {
                complexFilters[key] = new mongoose.Types.ObjectId(value)
            }
        }

        const sort: { [key: string]: 1 | -1 } = {}

        let sortFieldLower = null
        let sortDirection = 1
        if (sortField && typeof sortField === "string") {
            if (sortField.startsWith("-")) {
                sortFieldLower = sortField.slice(1)
                sortDirection = -1 // Descending
            } else {
                sortFieldLower = req.query.sort
                sortDirection = 1 // Ascending
            }
        }
        if (complexFilters["and:imported"]?.["$exists"] === false) {
            delete complexFilters["and:imported"]
            complexFilters["$or"] = [
                { imported: { $exists: false } },
                { imported: false }
            ]
        }
        // Remove keys from filters
        for (const key of keysToRemove) {
            delete complexFilters[key]
        }
        if (orConditions.length > 0) {
            complexFilters.$or = orConditions
        }

        try {
            const aggregationPipeline: any[] = [{ $match: complexFilters }]

            if (rateLimt) {
                aggregationPipeline.push(
                    {
                        $lookup: {
                            from: "ratelimitdatas",
                            localField: "_id",
                            foreignField: "userId",
                            as: "rateLimit"
                        }
                    },
                    {
                        $unwind: {
                            path: "$rateLimit",
                            preserveNullAndEmptyArrays: true
                        }
                    }
                )
            }
            if (
                req.query.sort === "-rateLimit" ||
                req.query.sort === "rateLimit"
            ) {
                aggregationPipeline.push(
                    {
                        $lookup: {
                            from: "ratelimitdatas", // Assuming your rate limit collection is named 'ratelimits'
                            localField: "_id",
                            foreignField: "userId",
                            as: "rateLimit"
                        }
                    },
                    {
                        $unwind: {
                            path: "$rateLimit",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $sort: {
                            "rateLimit.currentUsage":
                                req.query.sort === "-rateLimit" ? -1 : 1
                        }
                    }
                )
            } else if (
                req.query.sort === "-totaltokensused" ||
                req.query.sort === "totaltokensused"
            ) {
                aggregationPipeline.push(
                    {
                        $lookup: {
                            from: "ratelimitdatas", // Assuming your rate limit collection is named 'ratelimits'
                            localField: "_id",
                            foreignField: "userId",
                            as: "rateLimit"
                        }
                    },
                    {
                        $unwind: {
                            path: "$rateLimit",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $sort: {
                            "rateLimit.totalTokensUsed":
                                req.query.sort === "-totaltokensused" ? -1 : 1
                        }
                    }
                )
            } else if (sortFieldLower && sortFieldLower !== "_id") {
                aggregationPipeline.push(
                    {
                        $addFields: {
                            sortFieldLower: {
                                $cond: [
                                    {
                                        $eq: [
                                            { $type: `$${sortFieldLower}` },
                                            "string"
                                        ]
                                    },
                                    { $toLower: `$${sortFieldLower}` },
                                    `$${sortFieldLower}`
                                ]
                            }
                        }
                    },
                    { $sort: { sortFieldLower: sortDirection, _id: 1 } },
                    { $project: { sortFieldLower: 0 } }
                )
            }
            if (populateField && populateField.path && populateField.from) {
                aggregationPipeline.push(
                    {
                        $lookup: {
                            from: populateField.from,
                            localField: populateField.path,
                            foreignField: "_id",
                            as: populateField.path
                        }
                    },
                    {
                        $unwind: {
                            path: `$${populateField.path}`,
                            preserveNullAndEmptyArrays: true
                        }
                    }
                )
            }
            aggregationPipeline.push({ $skip: startIndex }, { $limit: limit })

            if (selectFields && selectFields.trim() !== "") {
                const fields: any = {}
                const selectArray = selectFields.split(" ")

                selectArray.forEach((field) => {
                    if (field.startsWith("-")) {
                        const fieldName = field.slice(1)
                        fields[fieldName] = 0 // Exclude field
                    } else {
                        fields[field] = 1 // Include field
                    }
                })

                if (Object.keys(fields).length > 0) {
                    aggregationPipeline.push({ $project: fields })
                }
            }

            const [count, results] = await Promise.all([
                model.countDocuments(complexFilters).exec(),
                model.aggregate(aggregationPipeline).exec()
            ])
            const totalPages = Math.ceil(count / limit)
            const totalData = count

            const paginatedResults = {
                results,
                currentPage: page,
                totalPages,
                totalData,
                next: endIndex < count ? { page: page + 1, limit } : undefined,
                previous: startIndex > 0 ? { page: page - 1, limit } : undefined
            }

            req.paginatedResults = paginatedResults
            next()
        } catch (e) {
            res.status(500).json({ message: e.message })
            next(e)
        }
    }
}

export { paginateAndFilter }

const Paths = ["/contacts/all", "/list/"]
// This middleware function sets the userId filter
export const setUserFilter = (
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    const userId = req?.user.id
    if (Paths.includes(req.path)) {
        req.additionalFilters = { user: userId }
    } else {
        req.additionalFilters = { userId }
    }
    next()
}

export const addContactIdFilter = async (
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    const contactId = req.params.id
    if (!req.additionalFilters) {
        req.additionalFilters = {}
    }
    req.additionalFilters.contact = contactId
    next()
}

export const createSetListIdsFilter = (model: Model<any>) => {
    return async (req: IExtendedRequest, res: Response, next: NextFunction) => {
        try {
            const contact = await model.findById(req.params.id).exec()
            if (!contact) {
                return res.status(404).json({ message: "Contact not found" })
            }

            const listIds = contact.listIds

            if (!req.additionalFilters) {
                req.additionalFilters = {}
            }
            req.additionalFilters._id = { $in: listIds }

            next()
        } catch (error) {
            console.error("Error in setListIdsFilter middleware:", error)
            res.status(500).json({ message: "Server error" })
        }
    }
}
