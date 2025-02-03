/* eslint-disable indent */
import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import bcrypt from "bcrypt"
import requestIp from "request-ip"
import UserModel from "../models/user"
import { IPayload, IUser } from "../types/IUser"
import { validationResult } from "express-validator"
import ProfileModel from "../models/profile"
import InvalidatedTokenModel from "../models/invalidatedToken"
import { IProfile } from "../types/IProfile"
import RefreshTokenModel from "../models/refreshToken"
import { token } from "morgan"
import crypto from "crypto"
import Stripe from "stripe"
import mongoose from "mongoose"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { v4 as uuidv4 } from "uuid"

interface InventoryEntry {
    id: string
    customerId: string
    stripeIndex: number
    amount?: number
}

interface UserInventory {
    subscriptions: InventoryEntry[]
    subscriptionSchedules: InventoryEntry[]
    payments: InventoryEntry[]
}

type ValidPurchase = {
    stripeIndex: number
    targetSubscriptions?: string[]
    targetSubscriptionSchedules?: string[]
    targetPurchaseDescriptions?: (
        | string
        | { description: string; amount: number }
    )[]
}

type RoleMap = {
    role: string
    validPurchases: ValidPurchase[]
}[]

type CustomerRoleStripeData = {
    customerId: string
    stripeIndex: number
    roles: string[]
}[]

interface CustomerRoleAccumulator {
    [key: string]: {
        customerId: string
        stripeIndex: number
        roles: Set<string>
    }
}

type PortalUrlInfo = {
    roles: string[]
    portalUrl: string
}

interface UserPurchaseData {
    userInventory: UserInventory
    preparedData: CustomerRoleStripeData
    roles: string[]
    portalUrls: PortalUrlInfo[]
}

const stripeAccounts = [
    process.env.STRIPE_SECRET_KEY,
    process.env.STRIPE2_SECRET_KEY
]

const stripeInstanceCache: Record<string, Stripe> = {}

const getStripeInstance = (secretKey: string): Stripe => {
    if (!stripeInstanceCache[secretKey]) {
        stripeInstanceCache[secretKey] = new Stripe(secretKey, {
            apiVersion: "2023-10-16"
        })
    }
    return stripeInstanceCache[secretKey]
}

const testRoleMap: RoleMap = [
    {
        role: "user",
        validPurchases: [
            {
                stripeIndex: 1,
                targetSubscriptions: [
                    "prod_PDIaFT7w2s7gKd", // AI Marketing Software ($69/month)
                    "prod_PfIl9RHBtNRIgF" // AI Software ($69/month)
                ],
                targetSubscriptionSchedules: []
            }
        ]
    },
    {
        role: "lite",
        validPurchases: [
            {
                stripeIndex: 1,
                targetSubscriptions: [
                    "prod_PEwsrpr7PjcyPx" // Deal.AI Marketing Software LITE ($9.99/month)
                ],
                targetSubscriptionSchedules: []
            }
        ]
    },
    {
        role: "leads",
        validPurchases: [
            {
                stripeIndex: 1,
                targetSubscriptions: [
                    "prod_PDIV6a64Ffcpzk" // Leads for Agencies (Starter Plan) ($199/3 months)
                ],
                targetSubscriptionSchedules: []
            }
        ]
    },
    {
        role: "academy",
        validPurchases: [
            {
                stripeIndex: 0,
                targetPurchaseDescriptions: [
                    "AI Marketing Academy",
                    "AI Marketing Agency",
                    "AI Software Academy",
                    "AI Software Agency",
                    "AI Marketing Training"
                ]
            },
            {
                stripeIndex: 1,
                targetPurchaseDescriptions: [
                    "AI Marketing Academy",
                    "AI Marketing Agency",
                    "AI Software Academy",
                    "AI Software Agency",
                    "AI Marketing Training"
                ]
            }
        ]
    }
]

const liveRoleMap: RoleMap = [
    {
        role: "lite",
        validPurchases: [
            {
                stripeIndex: 0,
                targetSubscriptions: [
                    "prod_P9mqG7GLNLkioR" // AI Marketing Software LITE ($9.99/month)
                ],
                targetSubscriptionSchedules: [
                    "price_1OLTH6BBKo9XrzRo28MLXWoP" // AI Marketing Software LITE ($9.99/month)
                ]
            },
            {
                stripeIndex: 1,
                targetSubscriptions: [
                    "prod_P9pD5ToIRcBVsi", // Deal.AI Marketing Software LITE ($9.99/month)
                    "prod_PABRklSgZ02E47", // Deal.AI Marketing Software LITE ($19.99/month)
                    "prod_PABSQJFoBtSCmy" // Deal.AI Marketing Software LITE ($29.99/month)
                ],
                targetSubscriptionSchedules: [
                    "price_1OLVZGHdGQpsHqInrL3VswuE", // Deal.AI Marketing Software LITE ($9.99/month)
                    "price_1OLr4LHdGQpsHqIn9aMLV9KB", // Deal.AI Marketing Software LITE ($19.99/month)
                    "price_1OLr5JHdGQpsHqIn1xIJOB9m" // Deal.AI Marketing Software LITE ($29.99/month)
                ]
            }
        ]
    },
    {
        role: "user",
        validPurchases: [
            {
                stripeIndex: 0,
                targetSubscriptions: [
                    "prod_Oz2Wi5Fe2DvydM", // AI Marketing Software ($69/month)
                    "prod_OyYhEmK8HFHjK2", // AI Marketing Software ($39/month)
                    "prod_P210POKcY0IS44", // AI Marketing Software ($97/month)
                    "prod_P4MNWMXfAXDhem", // AI Marketing Software (3-day trial)
                    "prod_OzLoyYsWY6AYAu", // AI Marketing Agency Inner Circle ($497 every 3 months)
                    "prod_OxsXVH4K3VkubU" // AIMA - Inner Circle ($997 every 6 months)
                ],
                targetSubscriptionSchedules: [
                    "price_1OB4R4BBKo9XrzRoBcr4O0Sw" // AI Marketing Software ($69/month)
                ]
            },
            {
                stripeIndex: 1,
                targetSubscriptions: [
                    "prod_P9ULoMI1qsTXGw", // Deal.AI Marketing Software ($69/month)
                    "prod_PAIQP8mDlaYnb0", // Deal.AI Marketing Software ($497/year)
                    "prod_PMYF9I4nrwdbn7", // AI Marketing Software (3-day offer)
                    "prod_PWKm1HQesSICMA", // Deal.AI Marketing Software (Annual, Full Access) ($999/year)
                    "prod_PWKmme616MVkFJ", // Deal.AI Marketing Software (Monthly, Full Access) ($199/month)
                    "prod_PfM5ujM6UdaGXf" // Deal.AI Marketing Software ($69/month)
                ],
                targetSubscriptionSchedules: [
                    "price_1OLBMtHdGQpsHqInU1mYun5x", // Deal.AI Marketing Software ($69/month)
                    "price_1OLxpNHdGQpsHqInQcfPScGI", // Deal.AI Marketing Software ($497/year)
                    "price_1Oq1NLHdGQpsHqInHqOdXl6f" // Deal.AI Marketing Software ($69/month)
                ]
            }
        ]
    },
    {
        role: "leads-pro",
        validPurchases: [
            {
                stripeIndex: 0,
                targetSubscriptions: [
                    "prod_OxXJIbph69LIBv" // AIMA - Business Leads ($199/3 months)
                ]
            },
            {
                stripeIndex: 1,
                targetSubscriptions: [
                    "prod_PDWFy6v0Zm9ztM", // Leads for Agencies (Pro Plan) ($59.99/month)
                    "prod_PC2QN41eSTVn1K", // Agency Leads ($47/month)
                    "prod_P9yqZuVkOeBDXO", // Agency Leads ($199/3 months)
                    "prod_PDWF6BnTLVk0cw" // Leads for Agencies (Starter Plan) ($49.95/month)
                ]
            }
        ]
    },
    {
        role: "leads-max",
        validPurchases: [
            {
                stripeIndex: 1,
                targetSubscriptions: [
                    "prod_PDWG4ktZ1l0zk8" // Leads for Agencies (Elite Plan) ($79.95/month)
                ]
            }
        ]
    },
    {
        role: "academy",
        validPurchases: [
            {
                stripeIndex: 0,
                targetSubscriptions: [
                    "prod_OyMazMVP8oO1LQ", // AI Marketing Agency ($47/month)
                    "prod_P1WHp9jErc7LIv" // AI Marketing Agency (AIMA) ($97/3 months)
                ],
                targetPurchaseDescriptions: [
                    "AI Marketing Academy",
                    "AI Marketing Agency",
                    "AI Software Academy",
                    "AI Software Agency",
                    "AI Marketing Training"
                ]
            },
            {
                stripeIndex: 1,
                targetPurchaseDescriptions: [
                    "AI Marketing Academy",
                    "AI Marketing Agency",
                    "AI Software Academy",
                    "AI Software Agency",
                    "AI Marketing Training",
                    "$1 Trial for 3 days",
                    "pass",
                    "Ecom",
                    "Book",
                    "AI Creative Agency",
                    { description: "Subscription Creation", amount: 2700 }
                ]
            }
        ]
    },
    {
        role: "mastermind",
        validPurchases: [
            {
                stripeIndex: 1,
                targetSubscriptions: [
                    "prod_PLHNC4AM4rwnN9" // AI Marketing Mastermind ($197/3 months)
                ]
            }
        ]
    }
]

const roleMap = stripeAccounts.some((account) => account?.startsWith("sk_test"))
    ? testRoleMap
    : liveRoleMap

export const gatherUserInventory = async (
    email: string,
    includeOverdueSubscriptions = false
): Promise<UserInventory> => {
    const userInventory: UserInventory = {
        subscriptions: [],
        subscriptionSchedules: [],
        payments: []
    }

    await Promise.all(
        stripeAccounts.map(async (stripeSecretKey, index) => {
            if (!stripeSecretKey) return

            const stripe = getStripeInstance(stripeSecretKey)
            const customers = await stripe.customers.search({
                query: `email:"${email}"`
            })

            if (customers.data.length === 0) return
            ;(
                await Promise.all(
                    customers.data.map(async (customer) => {
                        const [subscriptions, subscriptionSchedules, charges] =
                            await Promise.all([
                                stripe.subscriptions.list({
                                    customer: customer.id
                                }),
                                stripe.subscriptionSchedules.list({
                                    customer: customer.id
                                }),
                                stripe.charges.list({
                                    customer: customer.id,
                                    limit: 100
                                })
                            ])

                        return {
                            subscriptions: subscriptions.data
                                .filter(
                                    (sub) =>
                                        sub.status === "active" ||
                                        sub.status === "trialing" ||
                                        includeOverdueSubscriptions
                                )
                                .flatMap((subscription) =>
                                    subscription.items.data.map((item) =>
                                        typeof item.price.product === "string"
                                            ? {
                                                  id: item.price.product,
                                                  customerId: customer.id,
                                                  stripeIndex: index
                                              }
                                            : null
                                    )
                                ),
                            subscriptionSchedules:
                                subscriptionSchedules.data.flatMap((schedule) =>
                                    schedule.phases.flatMap((phase) =>
                                        phase.items.map((item) =>
                                            typeof item.price === "string"
                                                ? {
                                                      id: item.price,
                                                      customerId: customer.id,
                                                      stripeIndex: index
                                                  }
                                                : null
                                        )
                                    )
                                ),
                            payments: charges.data
                                .filter(
                                    (charge) =>
                                        charge.status === "succeeded" &&
                                        charge.amount_refunded == 0 &&
                                        charge.disputed == false
                                )
                                .map((charge) => ({
                                    id: charge.description || "No description",
                                    customerId: customer.id,
                                    stripeIndex: index,
                                    amount: charge.amount
                                }))
                        }
                    })
                )
            ).forEach((data) => {
                if (data) {
                    userInventory.subscriptions.push(...data.subscriptions)
                    userInventory.subscriptionSchedules.push(
                        ...data.subscriptionSchedules
                    )
                    userInventory.payments.push(...data.payments)
                }
            })
        })
    )

    return userInventory
}

export const prepareCustomerRoleData = (
    userInventory: UserInventory
): CustomerRoleStripeData => {
    const accumulatedData = [
        ...userInventory.subscriptions,
        ...userInventory.subscriptionSchedules,
        ...userInventory.payments
    ].reduce<CustomerRoleAccumulator>((acc, entry) => {
        roleMap.forEach((roleEntry) => {
            const isRoleValid = roleEntry.validPurchases.some(
                (validPurchase) =>
                    entry.stripeIndex === validPurchase.stripeIndex &&
                    (validPurchase.targetSubscriptions?.includes(entry.id) ||
                        validPurchase.targetSubscriptionSchedules?.includes(
                            entry.id
                        ) ||
                        validPurchase.targetPurchaseDescriptions?.some(
                            (desc) => {
                                if (typeof desc === "string") {
                                    return entry.id
                                        .toLowerCase()
                                        .includes(desc.toLowerCase())
                                } else {
                                    return (
                                        entry.id
                                            .toLowerCase()
                                            .includes(
                                                desc.description.toLowerCase()
                                            ) && entry.amount === desc.amount
                                    )
                                }
                            }
                        ))
            )

            if (isRoleValid) {
                const key = `${entry.customerId}-${entry.stripeIndex}`
                if (!acc[key]) {
                    acc[key] = {
                        customerId: entry.customerId,
                        stripeIndex: entry.stripeIndex,
                        roles: new Set<string>()
                    }
                }
                acc[key].roles.add(roleEntry.role)
            }
        })

        return acc
    }, {})

    return Object.values(accumulatedData).map(
        ({ customerId, stripeIndex, roles }) => ({
            customerId,
            stripeIndex,
            roles: Array.from(roles)
        })
    )
}

export const mapPurchasesToRoles = (
    preparedData: CustomerRoleStripeData
): string[] => {
    return Array.from(
        new Set(preparedData.flatMap((data) => data.roles))
    ).sort()
}

export const generateStripePortalUrls = async (
    preparedData: CustomerRoleStripeData,
    urlPrefix: string
): Promise<PortalUrlInfo[]> => {
    return Promise.all(
        preparedData.map(async (info) => {
            const stripe = getStripeInstance(stripeAccounts[info.stripeIndex])
            const portalSession = await stripe.billingPortal.sessions.create({
                customer: info.customerId,
                return_url: "https://marketing.deal.ai/apps/settings/manage"
            })

            return {
                roles: info.roles,
                portalUrl: portalSession.url
            }
        })
    )
}

export const getUserPurchaseData = async (
    email: string,
    urlPrefix: string
): Promise<UserPurchaseData> => {
    const userInventory = await gatherUserInventory(email)
    const preparedData = prepareCustomerRoleData(userInventory)
    const roles = mapPurchasesToRoles(preparedData)
    const portalUrls = await generateStripePortalUrls(preparedData, urlPrefix)

    return {
        userInventory: userInventory,
        preparedData: preparedData,
        roles: roles,
        portalUrls: portalUrls
    }
}

export const updateAccessBusinessLogic = async (
    user: IUser,
    simulate = false
): Promise<void | string[]> => {
    console.log("[AUTH] [ROLES] User's current roles:", user.roles)

    if (
        user.roles.includes("admin") ||
        user.email.toLowerCase().endsWith("@deal.ai") ||
        user.email.toLowerCase() === "alex@mehr.us"
    ) {
        console.log(
            `[AUTH] [EXEMPT] Admin or company email exempt ${user.email}`
        )

        if (!simulate) {
            return
        } else {
            return user.roles
        }
    }

    if (!process.env.STRIPE_SECRET_KEY && !process.env.STRIPE2_SECRET_KEY) {
        console.log(`[AUTH] [EXEMPT] Debug mode exempt ${user.email}`)

        return
    }

    try {
        const userInventory = await gatherUserInventory(user.email)

        const roleMap = prepareCustomerRoleData(userInventory)

        console.log("[AUTH] [ROLES] Role map:", roleMap)

        const eligibleRoles = mapPurchasesToRoles(roleMap)

        console.log(
            "[AUTH] [ROLES] Eligible roles (pre-business-logic):",
            eligibleRoles
        )

        if ("nosub" === user.status) user.status = "active"

        if (user.roles.includes("exempt")) {
            user.roles.forEach((role) => {
                if (!eligibleRoles.includes(role)) {
                    eligibleRoles.push(role)
                }
            })

            console.log(`[AUTH] [EXEMPT] Exempt due to override ${user.email}`)

            if (1 === eligibleRoles.length) {
                eligibleRoles.push("")
            }

            user.roles = eligibleRoles

            console.log("[AUTH] [ROLES] User's new roles:", user.roles)

            if (!simulate) {
                user.roles = eligibleRoles

                await user.save()
            } else {
                return eligibleRoles
            }

            return
        }

        if (user.roles.includes("3dayfreetrial")) {
            console.log(`[AUTH] [FREE-TRIAL] ${user.email}`)

            eligibleRoles.push("3dayfreetrial")
        }

        if (0 === eligibleRoles.length) {
            eligibleRoles.push("")
        }

        if (!simulate) {
            user.roles = eligibleRoles

            await user.save()
        } else {
            return eligibleRoles
        }
    } catch (error) {
        if (error instanceof mongoose.Error.VersionError) {
            console.log(
                `[AUTH] [DATABASE_ERROR] User ${user.email} database document is being concurrently modified, skipping update`,
                error
            )
            return
        }

        console.log(
            `[AUTH] [STRIPE_ERROR] Error checking and updating roles for ${user.email}`,
            error
        )
    }

    console.log("[AUTH] [ROLES] User's new roles:", user.roles)
}

//  to store invalidated tokens in-memory
export const tokenBlacklist: Set<string> = new Set()
function isJwtPayload(payload: string | JwtPayload): payload is JwtPayload {
    return (payload as JwtPayload).exp !== undefined
}

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body
    try {
        const user = await UserModel.findOne({ email: email.toLowerCase() })

        if (!user) {
            console.log(`[AUTH] [FAIL] User not found ${email}`)
            return res.status(401).json({ error: "Invalid email or password" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            console.log(`[AUTH] [FAIL] Wrong password ${email}`)
            return res.status(401).json({ error: "Invalid email or password" })
        }

        if (user.status === "suspended") {
            console.log(`[AUTH] [FAIL] User suspended ${email}`)
            return res.status(401).json({
                error: "Your account is suspended. Email <a style='text-decoration: underline;' href='mailto:support@deal.ai'>support@deal.ai</a> to get help"
            })
        }

        console.log("[AUTH] User email:", email)

        try {
            await updateAccessBusinessLogic(user)
        } catch (error) {
            console.log("[AUTH] Error updating user access", error)
        }

        const payload = {
            id: user._id,
            email: user.email,
            roles: user.roles
        }

        const tokenExpiryTime = process.env.JWT_EXPIRATION
            ? process.env.JWT_EXPIRATION
            : "1d"
        const refreshTokenExpiryTime = process.env.REFRESH_TOKEN_EXPIRATION
            ? process.env.REFRESH_TOKEN_EXPIRATION
            : "7d"

        const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
            expiresIn: tokenExpiryTime
        })

        const refreshToken = jwt.sign(
            payload,
            process.env.REFRESH_TOKEN_SECRET as string,
            {
                expiresIn: refreshTokenExpiryTime
            }
        )

        const newRefreshToken = new RefreshTokenModel({
            token: refreshToken,
            userId: user._id,
            expiresAt: new Date((jwt.decode(refreshToken) as any).exp * 1000)
        })
        await newRefreshToken.save()

        const decodedToken = jwt.decode(refreshToken)
        let expirationTimestamp

        if (isJwtPayload(decodedToken)) {
            expirationTimestamp = decodedToken.exp * 1000
        } else {
            throw new Error("Invalid token format")
        }

        try {
            const ip = req.clientIp
            console.log(`[AUTH] [SUCCESS] User logged in ${email} from ${ip}`)
            user.lastLoginDate = new Date()
            // user.lastLoginIpAddress = clientIp

            await user.save()
        } catch (error) {
            console.error("Error getting IP address:", error)
            res.status(500).send("Error getting IP address")
        }

        res.status(200).json({
            token,
            refreshToken,
            expiresIn: tokenExpiryTime,
            expirationTimestamp,
            user
        })
    } catch (error) {
        res.status(500).json({ error: "Server error" })
    }
}

export const register = async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { firstName, lastName, password, roles } = req.body
    const email = req.body.email.toLowerCase()
    try {
        const existingUser = await UserModel.findOne({
            email: email.toLowerCase()
        })
        if (existingUser) {
            return res.status(400).json({ error: "User already exists." })
        }

        const saltRounds = process.env.BCRYPT_SALT_ROUNDS || "10"

        const hashedPassword = await bcrypt.hash(
            password,
            parseInt(saltRounds, 10)
        )

        const defaultRoles = roles ? [roles] : ["buyer"]

        const newUser: IUser = new UserModel({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            roles: defaultRoles,
            assistKey: uuidv4()
        })

        await newUser.save()

        // Create a new profile instance for the registered user
        const newProfile: IProfile = new ProfileModel({
            user: newUser._id,
            fields: { firstName, lastName, email }
        })

        await newProfile.save()

        const payload = {
            id: newUser._id,
            email: newUser.email,
            roles: newUser.roles
        }

        const tokenExpiryTime = process.env.JWT_EXPIRATION
            ? process.env.JWT_EXPIRATION
            : "1d"
        const refreshTokenExpiryTime = process.env.REFRESH_TOKEN_EXPIRATION
            ? process.env.REFRESH_TOKEN_EXPIRATION
            : "7d"

        const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
            expiresIn: tokenExpiryTime
        })

        const refreshToken = jwt.sign(
            payload,
            process.env.REFRESH_TOKEN_SECRET as string,
            {
                expiresIn: refreshTokenExpiryTime
            }
        )

        const decodedToken = jwt.decode(refreshToken)
        let expirationTimestamp

        if (isJwtPayload(decodedToken)) {
            expirationTimestamp = decodedToken.exp * 1000
        } else {
            throw new Error("Invalid token format")
        }
        res.status(201).json({
            message: "User and profile created successfully",
            token: token,
            user: newUser,
            refreshToken,
            expiresIn: tokenExpiryTime,
            expirationTimestamp
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error, please try again later." })
    }
    return
}

export const logout = async (req: Request, res: Response) => {
    // Get the refresh token from the request body
    const { refreshToken } = req.body

    if (!refreshToken) {
        return res.status(400).json({ message: "No refresh token provided" })
    }

    try {
        const decodedRefreshToken = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as IPayload

        await RefreshTokenModel.deleteOne({ token: refreshToken })

        res.status(200).json({ message: "User logged out successfully" })
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ message: "Refresh token expired" })
        } else if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: "Invalid refresh token" })
        } else {
            res.status(500).json({ message: "Server error" })
        }
    }
}

export const changePassword = async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params
    const { oldPassword, newPassword } = req.body

    try {
        const user = await UserModel.findById(id)

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password)

        if (!isMatch) {
            return res.status(401).json({ error: "Incorrect old password" })
        }

        const saltRounds = process.env.BCRYPT_SALT_ROUNDS || "10"
        const hashedPassword = await bcrypt.hash(
            newPassword,
            parseInt(saltRounds, 10)
        )

        user.password = hashedPassword
        await user.save()

        res.status(200).json({
            message: "Password changed successfully",
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                roles: user.roles
            }
        })
    } catch (error) {
        res.status(500).json({ error: "Server error" })
    }
}

//For REGISTRATION
export const verifyAPIKey = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const apiKey = req.header("DEAL-REG-API-KEY")

    if (!apiKey) {
        return res
            .status(401)
            .json({ error: "No API key, authorization denied" })
    }

    if (apiKey !== process.env.DEAL_REG_API_KEY) {
        return res.status(401).json({ error: "Invalid API key" })
    }

    next()
}

export const refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { refreshToken } = req.body
    // console.log(refreshToken)
    if (!refreshToken) {
        return res.status(400).json({ error: "No token provided" })
    }

    try {
        const decodedRefreshToken = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as IPayload

        const storedRefreshToken = await RefreshTokenModel.findOne({
            token: refreshToken
        })
        if (!storedRefreshToken) {
            console.log("invalid refresh token")
            return res.status(400).json({ error: "Invalid token Not" })
        }

        const user = await UserModel.findById(decodedRefreshToken.id)
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        const newToken = jwt.sign(
            { id: user._id, email: user.email, roles: user.roles },
            process.env.JWT_SECRET as string,
            {
                expiresIn: process.env.JWT_EXPIRATION
                    ? process.env.JWT_EXPIRATION
                    : "1d"
            }
        )

        const newRefreshToken = jwt.sign(
            { id: user._id, email: user.email, roles: user.roles },
            process.env.REFRESH_TOKEN_SECRET as string,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRATION
                    ? process.env.REFRESH_TOKEN_EXPIRATION
                    : "7d"
            }
        )
        const decodedToken = jwt.decode(newRefreshToken)
        let expirationTimestamp

        if (isJwtPayload(decodedToken)) {
            expirationTimestamp = decodedToken.exp * 1000
        } else {
            throw new Error("Invalid token format")
        }

        await RefreshTokenModel.deleteOne({ token: refreshToken })

        const newStoredRefreshToken = new RefreshTokenModel({
            token: newRefreshToken,
            userId: user._id,
            expiresAt: new Date((jwt.decode(newRefreshToken) as any).exp * 1000)
        })
        await newStoredRefreshToken.save()

        res.status(200).json({
            token: newToken,
            refreshToken: newRefreshToken,
            expirationTimestamp
        })
    } catch (error) {
        console.log(error)
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: "Invalid token Exp" })
        } else {
            res.status(500).json({ message: "Server error" })
        }
    }
}

export const requestPasswordReset = async (req: Request, res: Response) => {
    const { email } = req.body
    try {
        const user = await UserModel.findOne({ email: email.toLowerCase() })
        if (!user) {
            return res
                .status(404)
                .json({ error: "User with this email not found" })
        }

        const resetToken = crypto.randomBytes(32).toString("hex")

        const hashedToken = await bcrypt.hash(resetToken, 10)
        user.passwordResetToken = hashedToken
        user.passwordResetExpires = Date.now() + 3600000 * 24

        await user.save()

        const resetURL = `https://marketing.deal.ai/auth/reset-password/${resetToken}`

        const webhookData = {
            resetURL,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        }

        await fetch("https://hooks.zapier.com/hooks/catch/14242389/3z89d8d/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(webhookData)
        })

        // console.log(`Password reset link: ${resetURL}`)

        res.status(200).json({ message: "Password reset link sent to email" })
    } catch (error) {
        res.status(500).json({
            error: "Error resetting password",
            details: error.message
        })
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    const { resetToken, newPassword } = req.body

    try {
        if (!resetToken || !newPassword) {
            return res.status(400).json({
                error: "Reset token and new password must be provided"
            })
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                error: "Password must be at least 8 characters long"
            })
        }

        const users = await UserModel.find({
            passwordResetExpires: { $gt: Date.now() }
        })

        for (const user of users) {
            if (await bcrypt.compare(resetToken, user.passwordResetToken)) {
                const saltRounds = process.env.BCRYPT_SALT_ROUNDS || "10"
                const hashedPassword = await bcrypt.hash(
                    newPassword,
                    parseInt(saltRounds, 10)
                )
                user.password = hashedPassword
                user.passwordResetToken = undefined
                user.passwordResetExpires = undefined

                await user.save()

                return res
                    .status(200)
                    .json({ message: "Password reset successfully" })
            }
        }

        return res.status(400).json({
            error: "Your password reset link has expired or is incorrect, please request a new one"
        })
    } catch (error) {
        res.status(500).json({
            error: "Error resetting password",
            details: error.message
        })
    }
}

export const getAuthResult = async (req: IExtendedRequest, res: Response) => {
    try {
        const user = req.user

        const existingUser = await UserModel.findOne({ _id: req.user.id })
            .lean()
            .exec()
        if (!existingUser) {
            throw new Error("Invalid user")
        }

        res.status(200).json({
            _id: user.id,
            email: existingUser.email,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName
        })
    } catch (error) {
        res.status(500).json({
            error: "Error authenticating",
            details: error.message
        })
    }
}
