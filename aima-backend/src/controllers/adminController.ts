// controllers/AdminController.ts
import { NextFunction, Request, Response } from "express"
import UserModel from "../models/user"
import { body, validationResult } from "express-validator"
import bcrypt from "bcrypt"
import { IUser } from "../types/IUser"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { IProfile } from "../types/IProfile"
import ProfileModel from "../models/profile"
import { RateLimitModel } from "../models/RateLimit"
import Papa from "papaparse"
import {
    gatherUserInventory,
    generateStripePortalUrls,
    getUserPurchaseData,
    mapPurchasesToRoles,
    prepareCustomerRoleData,
    updateAccessBusinessLogic
} from "./authController"
import lead, { IInputLead } from "../models/lead"
import { addLead, deleteLead, getLeads } from "../services/lead.service"
import { v4 as uuidv4 } from "uuid"

export const listUsers = async (req: Request, res: Response) => {
    try {
        const paginatedResults = (req as any).paginatedResults
        res.status(200).json(paginatedResults)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}
//For Roles change
export const checkApiKey = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const providedApiKey = req.header("DEAL-REG-API-KEY")
    const storedApiKey = process.env.DEAL_REG_API_KEY

    if (providedApiKey && providedApiKey === storedApiKey) {
        next()
    } else {
        res.status(403).json({ error: "Invalid API Key" })
    }
}
export const listUsersCSV = async (req: Request, res: Response) => {
    try {
        const users = await UserModel.find(
            {},
            "-password -lastLoginIpAddress -__v "
        ).exec()

        const userIds = users.map((user: any) => user._id)

        const rateLimitInfo = await RateLimitModel.find({
            userId: { $in: userIds }
        }).exec()

        const resultsWithRateLimit = users?.map((user: IUser) => {
            const userRateLimit = rateLimitInfo.find(
                (rl) => rl.userId.toString() === user._id.toString()
            ) || {
                exceededCount: "UNLIMITED",
                currentUsage: "UNLIMITED",
                remaining: "UNLIMITED"
            }
            return {
                ...user.toObject(),
                exceededCount: userRateLimit.exceededCount,
                currentUsage: userRateLimit.currentUsage,
                remaining: userRateLimit.remaining
            }
        })

        const csv = Papa.unparse(resultsWithRateLimit)

        res.setHeader("Content-Type", "text/csv")
        res.setHeader("Content-Disposition", "attachment; filename=users.csv")

        res.status(200).send(csv)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const addUser = async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { firstName, lastName, email, password, roles, days } = req.body

    try {
        const existingUser = await UserModel.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ error: "User already exists." })
        }

        if (roles.includes("exempt")) {
            if (!days) {
                return res
                    .status(400)
                    .json({ error: "Expiry date is required for exempt users" })
            } else if (days > 180) {
                return res
                    .status(400)
                    .json({ error: "Maximum of 180 days allowed" })
            }
        }
        let adjustedRoles = [...roles]
        if (
            roles.includes("userfree") &&
            (roles.includes("seller") || roles.includes("user"))
        ) {
            adjustedRoles = adjustedRoles.filter(
                (role: string) => role !== "userfree"
            )
            if (roles.includes("seller") && !adjustedRoles.includes("buyer")) {
                adjustedRoles.push("buyer")
            }
        }

        const saltRounds = process.env.BCRYPT_SALT_ROUNDS || "10"

        const hashedPassword = await bcrypt.hash(
            password,
            parseInt(saltRounds, 10)
        )

        const newUser: IUser = new UserModel({
            firstName: firstName,
            lastName: lastName,

            email: email.toLowerCase(),
            password: hashedPassword,
            roles: adjustedRoles,
            assistKey: uuidv4()
        })
        if (days) {
            const expiryDate = new Date()
            expiryDate.setDate(expiryDate.getDate() + days)
            newUser.expiryDate = expiryDate
        }
        await newUser.save()

        // Call webhook after the user is saved
        try {
            const webhookData = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password
            }

            await fetch(
                "https://hooks.zapier.com/hooks/catch/14242389/3z89dc9/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(webhookData)
                }
            )
            const message = "Onboarding Email sent to User."

            res.status(201).json({
                message: message,
                user: newUser
            })
        } catch (error) {
            console.log("Error calling webhook:", error)
            res.status(500).json({
                error: "Server error, please try again later."
            })
        }

        // Create a new profile instance for the registered user
        const newProfile: IProfile = new ProfileModel({
            user: newUser._id,
            fields: { firstName, lastName, email }
        })
        await newProfile.save()
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error, please try again later." })
    }
}

export const suspendUser = async (req: IExtendedRequest, res: Response) => {
    const { id } = req.params

    if (req.user && req.user.id === id) {
        return res.status(400).json({ error: "You cannot suspend yourself" })
    }

    try {
        const user = await UserModel.findById(id)

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        if (user.status === "suspended") {
            user.status = "active"
        } else {
            user.status = "suspended"
        }

        await user.save()

        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ error: "Server error" })
    }
}
export const suspendUserByEmail = async (
    req: IExtendedRequest,
    res: Response
) => {
    const { email, shouldSuspend } = req.params

    try {
        const user = await UserModel.findOne({ email: email.toLowerCase() })

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        // Convert shouldSuspend from string to boolean
        const suspend = shouldSuspend === "true"

        user.status = suspend ? "suspended" : "active"

        await user.save()

        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ error: "Server error" })
    }
}

export const updateExpireUser = async (req: Request, res: Response) => {
    const { id } = req.params
    const { expiryDate } = req.body

    try {
        const user = await UserModel.findById(id)
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        if (user.roles.includes("admin")) {
            return res.status(403).json({
                error: "Cannot update expiration date for admin users"
            })
        }

        if (expiryDate) {
            const newExpiryDate = new Date(expiryDate)
            if (isNaN(newExpiryDate.getTime())) {
                return res.status(400).json({ error: "Invalid date format" })
            }
            user.expiryDate = newExpiryDate
        } else {
            user.expiryDate = null
        }

        await user.save()
        res.status(200).json({
            message: "User expiration date updated successfully",
            user
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error while updating user" })
    }
}

export const deleteUser = async (req: IExtendedRequest, res: Response) => {
    const { id } = req.params

    if (req.user && req.user.id === id) {
        return res.status(400).json({ error: "You cannot delete yourself" })
    }

    try {
        const user = await UserModel.findByIdAndRemove(id)

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        res.status(200).json({ message: "User deleted successfully" })
    } catch (error) {
        res.status(500).json({ error: "Server error" })
    }
}

export const deleteUserByEmail = async (
    req: IExtendedRequest,
    res: Response
) => {
    const { email } = req.params

    try {
        const user = await UserModel.findOneAndDelete({
            email: email.toLowerCase()
        })

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        res.status(200).json({ message: "User deleted successfully" })
    } catch (error) {
        res.status(500).json({ error: "Server error" })
    }
}

export const forceRoleUpdate = async (req: IExtendedRequest, res: Response) => {
    const { email } = req.params

    try {
        const user = await UserModel.findOne({
            email: email.toLowerCase()
        })

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        const oldRoles = user.roles

        await updateAccessBusinessLogic(user)

        res.status(200).json({
            message: "User roles updated successfully",
            oldRoles: oldRoles,
            newRoles: user.roles
        })
    } catch (error) {
        res.status(500).json({ error: "Server error" })
    }
}

export const simulateRoleUpdate = async (
    req: IExtendedRequest,
    res: Response
) => {
    const { email } = req.params

    try {
        const user = await UserModel.findOne({
            email: email.toLowerCase()
        })

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        const oldRoles = user.roles

        const newRoles = await updateAccessBusinessLogic(user, true)

        if (!newRoles) {
            return res.status(500).json({ error: "Server error" })
        }

        res.status(200).json({
            message: "User role update simulated successfully",
            oldRoles: oldRoles,
            newRoles: newRoles
        })
    } catch (error) {
        res.status(500).json({ error: "Server error" })
    }
}

export const setUserRoles = async (req: IExtendedRequest, res: Response) => {
    const { id } = req.params
    const { roles } = req.body

    if (req.user && req.user.id === id) {
        return res
            .status(403)
            .json({ error: "You cannot modify your own roles" })
    }

    try {
        const user = await UserModel.findById(id)

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        const hadExempt = user.roles.includes("exempt")
        const hasExempt = roles.includes("exempt")

        const updateFields = { roles: roles } as any

        if (hasExempt && !hadExempt) {
            const newExpiryDate = new Date()
            newExpiryDate.setDate(newExpiryDate.getDate() + 180)
            updateFields.expiryDate = newExpiryDate
        } else if (!hasExempt && hadExempt) {
            updateFields.expiryDate = null
        }

        await UserModel.findByIdAndUpdate(id, updateFields, { new: true })

        res.status(200).json({ message: "User roles updated successfully" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

const VALID_ROLES = [
    "3dayfreetrial",
    "admin",
    "user",
    "exempt",
    "lite",
    "leads",
    "leads-pro",
    "leads-max",
    "academy",
    "mastermind",
    "facebook"
]

export const addRole = async (req: IExtendedRequest, res: Response) => {
    const { email } = req.params
    const { role } = req.body

    if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ error: `Invalid role: ${role}` })
    }

    try {
        const user = await UserModel.findOne({ email: email })
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        const adjustedRoles = [...user.roles]

        if (!adjustedRoles.includes(role)) {
            adjustedRoles.push(role)
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        user.roles = adjustedRoles
        await user.save()

        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const removeRole = async (req: IExtendedRequest, res: Response) => {
    const { email } = req.params
    const { role } = req.body

    if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ error: `Invalid role: ${role}` })
    }

    try {
        const user = await UserModel.findOne({ email: email })
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        if (user.roles.includes(role)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            user.roles = user.roles.filter((r) => r !== role)
            await user.save()
        }

        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const userExists = async (req: IExtendedRequest, res: Response) => {
    const { email } = req.params

    try {
        const user = await UserModel.findOne({ email: email })
        return res.status(200).json({ exists: !!user })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const resetUserPassword = async (req: Request, res: Response) => {
    const { id } = req.params
    const { password } = req.body

    try {
        const saltRounds = process.env.BCRYPT_SALT_ROUNDS || "10"
        const hashedPassword = await bcrypt.hash(
            password,
            parseInt(saltRounds, 10)
        )

        const user = await UserModel.findByIdAndUpdate(
            id,
            { password: hashedPassword },
            { new: true }
        )

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        res.status(200).json({ message: "Password reset successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const pruneUsers = async (req: Request, res: Response) => {
    try {
        // Check for the API key
        const providedApiKey = req.header("DEAL-REG-API-KEY")
        const storedApiKey = process.env.DEAL_REG_API_KEY
        if (!providedApiKey || providedApiKey !== storedApiKey) {
            return res.status(403).json({ error: "Invalid API Key" })
        }

        // Get current date
        const currentDate = new Date()

        // Find and update expired users
        const result = await UserModel.updateMany(
            { expiryDate: { $lt: currentDate }, status: { $ne: "suspended" } },
            { $set: { status: "suspended" } }
        )

        res.status(200).json({ message: "Prune operation completed", result })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const checkSubscription = async (
    req: IExtendedRequest,
    res: Response
) => {
    const { email } = req.params

    try {
        console.log(`API request - Checking subscription for ${email}`)
        const userInventory = await gatherUserInventory(email)
        const eligibleRoles = mapPurchasesToRoles(
            prepareCustomerRoleData(userInventory)
        )

        const hasSubscription =
            eligibleRoles.includes("user") ||
            eligibleRoles.includes("lite") ||
            eligibleRoles.includes("academy")

        console.log(`Result: ${JSON.stringify(userInventory)}`)
        return res.status(200).json({
            status: hasSubscription
        })
    } catch (error) {
        console.log(error)
        res.status(200).json({
            status: true,
            commentary:
                "Stripe error, creating account to not inconvenience user"
        })
    }
}

export const userPurchaseData = async (
    req: IExtendedRequest,
    res: Response
) => {
    const { email } = req.params

    try {
        console.log(`API request - Getting purchase data for ${email}`)

        const userPurchaseData = await getUserPurchaseData(
            email,
            `${req.protocol}://${req.get("Host")}`
        )

        console.log(`Result: ${JSON.stringify(userPurchaseData)}`)
        return res.status(200).json(userPurchaseData)
    } catch (error) {
        console.log("[ERROR] [STRIPE}", error)
        res.status(500).json({ error: error.message })
    }
}

export const stripePortalUrls = async (
    req: IExtendedRequest,
    res: Response
) => {
    const user = await UserModel.findOne({ _id: req.user.id })
    const email = user?.email

    try {
        const userInventory = await gatherUserInventory(email, true)
        const preparedData = prepareCustomerRoleData(userInventory)
        const portalUrls = await generateStripePortalUrls(
            preparedData,
            `${req.protocol}://${req.get("Host")}`
        )

        return res.status(200).json(portalUrls)
    } catch (error) {
        console.log("[ERROR] [STRIPE}", error)
        res.status(500).json({ error: error.message })
    }
}

export const putLead = async (req: IExtendedRequest, res: Response) => {
    const {
        businessName,
        businessWebsite,
        businessDescription,
        monthlyMarketingBudget,
        location,
        workingWithAgency,
        currentChallenges,
        businessEmail,
        howSoonGrowth
    } = req.body

    const inputLead: IInputLead = {
        businessName,
        businessWebsite,
        businessDescription,
        monthlyMarketingBudget,
        location,
        workingWithAgency,
        currentChallenges,
        businessEmail,
        howSoonGrowth
    }

    try {
        const addedLead = await addLead(inputLead)
        return res.status(200).json(addedLead)
    } catch (e) {
        console.log(`Couldn't add lead: ${e}`)
        return res.status(500).json({ error: `Couldn't add lead: ${e}` })
    }
}

export const listLeads = async (req: any, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    const filters: any = {}

    const queryFilters = req.query
    const orConditions: any[] = []

    for (const key in queryFilters) {
        if (
            Object.prototype.hasOwnProperty.call(queryFilters, key) &&
            !["page", "limit", "sort"].includes(key)
        ) {
            if (key.startsWith("or:")) {
                const actualKey = key.slice(3)
                const value = queryFilters[key]

                if (value.startsWith("regex:")) {
                    const regexPattern = value.slice(6)

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

                    const escapedValue = regexPattern
                        .split("")
                        .map((char: string) =>
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

                    orConditions.push({
                        [actualKey]: new RegExp(escapedValue, "i")
                    })
                } else {
                    orConditions.push({ [actualKey]: value })
                }
            } else {
                filters[key] = queryFilters[key]
            }
        }
    }

    if (orConditions.length > 0) {
        filters.$or = orConditions
    }

    // Handle sorting
    let sortField = req.query.sort as string
    let sortDirection = 1
    if (sortField && sortField.startsWith("-")) {
        sortField = sortField.substring(1)
        sortDirection = -1
    }
    const sort = sortField ? { [sortField]: sortDirection } : { createdAt: -1 }
    try {
        const { leads, totalData } = await getLeads(
            filters,
            page,
            limit,
            sort,
            req.roles
        )

        res.status(200).json({
            results: leads,
            totalData,
            currentPage: page,
            totalPages: Math.ceil(totalData / limit)
        })
    } catch (error) {
        console.error("Error in listLeads", error)
        res.status(500).json({ error: "Server error" })
    }
}

export const removeLead = async (req: any, res: Response) => {
    const leadId = req.params.id

    try {
        const isDeleted = await deleteLead(leadId)

        if (isDeleted) {
            res.status(200).json({ message: "Lead successfully deleted." })
        } else {
            res.status(404).json({ message: "Lead not found." })
        }
    } catch (error) {
        console.error("Error in removeLead", error)
        res.status(500).json({ error: "Server error" })
    }
}

export const reportLead = async (req: IExtendedRequest, res: Response) => {
    try {
        const userId = req.user.id
        const user = await UserModel.findById(userId)
        const userEmail = user?.email
        console.log(user)
        const { leadsId } = req.body
        const leadData = await lead.findById(leadsId)
        const businessName = leadData?.businessName
        const businessEmail = leadData?.businessEmail
        if (!userEmail || !businessName || !businessEmail) {
            return res
                .status(400)
                .json({ error: "Missing required information" })
        }

        const reportData = {
            userEmail,
            businessName,
            businessEmail
        }
        console.log(reportData)

        try {
            await fetch(
                "https://hooks.zapier.com/hooks/catch/14242389/3a9k78u/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(reportData)
                }
            )

            res.status(200).json({ message: "Report sent successfully" })
        } catch (error) {
            console.error("Error sending data to webhook", error)
            res.status(500).json({
                error: "Server error while sending data to webhook"
            })
        }
    } catch (error) {
        console.error("Error in reportLead", error)
        res.status(500).json({ error: "Server error" })
    }
}
