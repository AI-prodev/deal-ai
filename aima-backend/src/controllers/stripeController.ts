import Stripe from "stripe"
import process from "process"
import Papa from "papaparse"
import { Request, Response, NextFunction } from "express"
import { IExtendedRequest } from "../types/IExtendedRequest"
import IntegrationModel from "../models/integration"
import PageModel from "../models/page"
import { OrderModel } from "../models/order"
import { OrderData } from "../types/IOrder"
import ContactModel from "../models/contact"
import { getFunnelAndPageFromUrl } from "../utils/funnelUtils"
import DomainModel from "../models/domain"
import { IDomain } from "../types/IDomain"
import axios from "axios"
import UserModel from "../models/user"

const stripe = new Stripe(process.env.STRIPE2_SECRET_KEY)

export const createAccount = async (req: IExtendedRequest, res: Response) => {
    try {
        const REDIRECT_URI = `${process.env.BACK_BASE_URL}/user/callback`
        const stripeAuthUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.STRIPE_CLIENT_ID}&scope=read_write&redirect_uri=${REDIRECT_URI}&state=${req.user.id}`
        res.send({ url: stripeAuthUrl })
    } catch (error) {
        res.status(500).send(error)
    }
}

export const callback = async (req: Request, res: Response) => {
    const { code, state: userId } = req.query

    if (typeof code !== "string" || typeof userId !== "string") {
        return res.status(400).send("Invalid request parameters.")
    }

    try {
        const response = await stripe.oauth.token({
            grant_type: "authorization_code",
            code
        })
        const { access_token, stripe_user_id } = response

        await IntegrationModel.findOneAndUpdate(
            { "data.accountId": stripe_user_id, type: "stripe" },
            {
                user: userId,
                type: "stripe",
                data: {
                    userId,
                    accountId: stripe_user_id,
                    accountType: "standard",
                    completed: true,
                    accessToken: access_token
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        res.redirect(`${process.env.FRONT_BASE_URL}/integrations/stripe`)
    } catch (error) {
        console.error(error)
        res.status(500).send("An error occurred during Stripe account setup.")
    }
}

export const returnAccount = async (req: Request, res: Response) => {
    try {
        res.redirect(`${process.env.FRONT_BASE_URL}/integrations/stripe`) // Redirect to a dashboard or relevant page
    } catch (error) {
        res.status(500).send("An error occurred during Stripe account setup.")
    }
}

export const stripeAccounts = async (req: IExtendedRequest, res: Response) => {
    try {
        const accounts = await IntegrationModel.find({
            user: req.user.id,
            type: "stripe"
        })
        return res.send(accounts)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

export const accountProducts = async (req: Request, res: Response) => {
    try {
        const account = await IntegrationModel.findById(req.params.id)
            .lean()
            .exec()
        const accountStripe = new Stripe(account.data.accessToken)
        const productPriceData = await accountStripe.prices.list({
            expand: ["data.product"]
        })
        return res.status(200).json(productPriceData)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

export const deleteIntegration = async (req: Request, res: Response) => {
    try {
        await IntegrationModel.deleteOne({ "data.accountId": req.params.id })
        await PageModel.updateMany(
            {},
            { $pull: { products: { accountId: req.params.id } } }
        )
        return res
            .status(200)
            .json(
                `user with [accountId: ${req.params.id}]  Deleted Successfully`
            )
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

export const findLatestStripeByEmail = async (
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const allowNewCustomer = req.query.allowNewCustomer

        const existingUser = await UserModel.findById(req.user.id).lean().exec()

        const customers = await stripe.customers.search({
            query: `email:"${existingUser.email}"`
        })

        if (customers.data.length === 0) {
            if (!allowNewCustomer || allowNewCustomer !== "yes") {
                throw new Error("Customer not found")
            }
            return next()
        }

        const sortedCustomers = customers.data.sort(
            (a, b) => b.created - a.created
        )
        const latestCustomer = sortedCustomers[0]
        const customerId = latestCustomer.id

        req.customerId = customerId
        req.stripeCustomer = latestCustomer
        next()
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
}

export const createSubscriptionForDomain = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        let priceId = process.env.STRIPE2_DOMAIN_PRICE_ID
        const customerStripeId = req.customerId
        const domain = req.body.domain

        if (!customerStripeId) {
            return res.status(400).json({
                error: "You don't have a card on file"
            })
        }

        // check domain validation
        const userDomains = await DomainModel.find({ user: req.user.id })
            .lean()
            .exec()
        if (userDomains.length >= 100) {
            return res.status(400).json({
                error: "You've reached your maximum number of domains"
            })
        }

        if (userDomains.length >= 3) {
            priceId = null
            // use price chart after the first 3 domains
            const domainResponse = await axios.get(process.env.STRIPE2_DOMAIN_PRICE_ID_LIST)
            const domainData = domainResponse.data
            if (domainData) {
                const extension = domain.split(".").slice(1).join(".")
                const foundDomain = domainData.find((d: any) => d.domain === extension)
                if (foundDomain && foundDomain.priceId) {
                    priceId = foundDomain.priceId
                }
            }
        }

        if (!priceId) {
            return res.status(400).json({
                error: "This domain extension is not available"
            })
        }

        // Create a new subscription
        const subscription = await stripe.subscriptions.create({
            customer: customerStripeId,
            items: [{ price: priceId }],
            expand: ["latest_invoice.payment_intent"],
            metadata: {
                domain: domain
            }
        })
        res.send({ subscriptionId: subscription.id })
    } catch (error) {
        res.status(404).send({
            error: error.message
        })
    }
}

export const getProductPrice = async (req: IExtendedRequest, res: Response) => {
    const domain = req.query.domain as string
    let priceId = process.env.STRIPE2_DOMAIN_PRICE_ID

    try {
        const userDomains = await DomainModel.find({ user: req.user.id })
            .lean()
            .exec()
        if (userDomains.length >= 3) {
            priceId = null
            // use price chart after the first 3 domains
            const domainResponse = await axios.get(process.env.STRIPE2_DOMAIN_PRICE_ID_LIST)
            const domainData = domainResponse.data
            if (domainData && domain) {
                const extension = domain.split(".").slice(1).join(".")
                const foundDomain = domainData.find((d: any) => d.domain === extension)
                if (foundDomain && foundDomain.priceId) {
                    priceId = foundDomain.priceId
                }
            }
        }

        if (!priceId) {
            return res.status(400).json({
                error: "This domain extension is not available"
            })
        }

        const price = await stripe.prices.retrieve(priceId)
        res.status(200).json(price.unit_amount)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const getPriceByStripeId = async (req: Request, res: Response) => {
    const priceId = req.params.priceId

    try {
        const price = await stripe.prices.retrieve(priceId)
        res.status(200).json(price)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const getProductByStripeId = async (req: Request, res: Response) => {
    const productId = req.params.productId

    try {
        const product = await stripe.products.retrieve(productId)
        res.status(200).json(product)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const purchase = async (req: IExtendedRequest, res: Response) => {
    const priceId = req.body.priceId
    const paymentMethodId = req.body.paymentMethodId
    const userId = req.user.id

    try {
        const price = await stripe.prices.retrieve(priceId)
        if (!price || !price.product) {
            throw new Error("Price not found")
        }

        const product = await stripe.products.retrieve(price.product as string)
        if (!product) {
            throw new Error("Product not found")
        }

        let stripeCustomer = req.stripeCustomer
        console.log("stripeCustomer=", stripeCustomer)

        if (
            !stripeCustomer?.invoice_settings?.default_payment_method &&
            !stripeCustomer?.default_source &&
            !paymentMethodId
        ) {
            throw new Error("No card on file")
        }

        const existingUser = await UserModel.findById(userId).lean().exec()
        if (!existingUser || !existingUser.email) {
            throw new Error("Missing user")
        }

        if (!stripeCustomer) {
            stripeCustomer = await stripe.customers.create({
                email: existingUser.email,
                payment_method: paymentMethodId,
                invoice_settings: {
                    default_payment_method: paymentMethodId
                }
            })
        }

        if (!stripeCustomer) {
            throw new Error("Unable to find or create Stripe customer")
        }

        if (paymentMethodId) {
            await stripe.paymentMethods.attach(paymentMethodId, {
                customer: stripeCustomer.id
            })
        }

        if (price.type === "recurring") {
            const result = await stripe.subscriptions.create({
                customer: stripeCustomer.id,
                items: [{ price: priceId }],
                expand: ["latest_invoice.payment_intent"],
                default_payment_method:
                    paymentMethodId ||
                    stripeCustomer?.invoice_settings?.default_payment_method?.toString() ||
                    stripeCustomer?.default_source?.toString()
            })
            if (result.status !== "active") {
                throw new Error("Payment failed or is incomplete")
            }
        } else {
            const result = await stripe.paymentIntents.create({
                customer: stripeCustomer.id,
                amount: price.unit_amount,
                currency: price.currency,
                payment_method:
                    paymentMethodId ||
                    stripeCustomer?.invoice_settings?.default_payment_method?.toString() ||
                    stripeCustomer?.default_source?.toString(),
                confirm: true,
                return_url: process.env.FRONT_BASE_URL
            })
            if (result.status !== "succeeded") {
                throw new Error("Payment failed or is incomplete")
            }
        }

        res.status(200).json({ success: true })
    } catch (error) {
        res.status(200).json({ error: error.message })
    }
}

export const createSubscriptionNewUser = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        let priceId = process.env.STRIPE2_DOMAIN_PRICE_ID
        const customerEmail = req.body.email
        const domain = req.body.domain
        const customer = await stripe.customers.create({
            email: customerEmail,
            payment_method: req.body.payment_method,
            invoice_settings: {
                default_payment_method: req.body.payment_method
            }
        })

        // check domain validation
        const userDomains = await DomainModel.find({ user: req.user.id })
            .lean()
            .exec()
        if (userDomains.length >= 100) {
            return res.status(400).json({
                error: "You've reached your maximum number of domains"
            })
        }

        if (userDomains.length >= 3) {
            priceId = null
            // use price chart after the first 3 domains
            const domainResponse = await axios.get(process.env.STRIPE2_DOMAIN_PRICE_ID_LIST)
            const domainData = domainResponse.data
            if (domainData) {
                const extension = domain.split(".").slice(1).join(".")
                const foundDomain = domainData.find((d: any) => d.domain === extension)
                if (foundDomain && foundDomain.priceId) {
                    priceId = foundDomain.priceId
                }
            }
        }

        if (!priceId) {
            return res.status(400).json({
                error: "This domain extension is not available"
            })
        }

        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            metadata: {
                domain: domain
            }
        })

        res.send({ subscriptionId: subscription.id })
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
}

export const renewSubscriptions = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const accountId = process.env.DNSIMPLE_ACCOUNT_ID
        const domain = req.body.domain
        const domainName = req.body.domainName
        const token = process.env.DNSIMPLE_TOKEN
        const findByDomain = await DomainModel.findOne({
            _id: domain,
            user: req.user.id
        })
        const isRenew = req.body.isRenew

        if (findByDomain !== null && findByDomain !== undefined) {
            const subscripToken = (findByDomain as Document & IDomain)
                .subscriptionId
            if (isRenew === false) {
                const subscription = await stripe.subscriptions.update(
                    subscripToken,
                    {
                        pause_collection: {
                            behavior: "void"
                        }
                    }
                )
                await axios.delete(
                    `${process.env.DNSIMPLE_BASE_URL}/${accountId}/registrar/domains/${domainName}/auto_renewal`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json"
                        }
                    }
                )
                await DomainModel.findByIdAndUpdate(findByDomain._id, {
                    $set: { autoRenew: false }
                })
                res.status(200).json(subscription)
            } else {
                const updatedSubscription = await stripe.subscriptions.update(
                    subscripToken,
                    {
                        pause_collection: ""
                    }
                )
                await axios.put(
                    `${process.env.DNSIMPLE_BASE_URL}/${accountId}/registrar/domains/${domainName}/auto_renewal`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json"
                        }
                    }
                )
                await DomainModel.findByIdAndUpdate(findByDomain._id, {
                    $set: { autoRenew: true }
                })
                res.status(200).json(updatedSubscription)
            }
        } else {
            res.status(404).json({
                error: "No subscription found for the given domain and user."
            })
        }
    } catch (e) {
        console.log(e.message)
        res.status(500).json({ error: e.message })
    }
}

export const createPayment = async (req: Request, res: Response) => {
    try {
        const {
            type,
            paymentId,
            priceId,
            accountId,
            productName,
            contactId,
            url
        } = req.body
        const { funnel, page } = await getFunnelAndPageFromUrl(url)

        let name = ""
        let email = ""
        const contact = await ContactModel.findById(contactId)
        if (contact) {
            name = (contact.firstName + " " + contact.lastName).trim()
            email = contact.email
        }

        const orderData: OrderData = {
            project: funnel?.project?.toString(),
            funnel: funnel?._id,
            page: page?._id,
            type,
            customer: email,
            product: productName,
            contact: contactId
        }
        const customer = await stripe.customers.create(
            { name, email, payment_method: paymentId },
            {
                stripeAccount: accountId
            }
        )

        let result

        if (type === "recurring") {
            result = await stripe.subscriptions.create(
                {
                    customer: customer.id,
                    items: [
                        {
                            price: priceId
                        }
                    ],
                    default_payment_method: paymentId
                },
                {
                    stripeAccount: accountId
                }
            )

            orderData.transaction = result.id
            orderData.amount = result.items.data[0].price.unit_amount
            orderData.interval = result.items.data[0].price.recurring.interval
        } else {
            const account = await IntegrationModel.findOne({
                "data.accountId": accountId
            })
            const accountStripe = new Stripe(account.data.accessToken)
            const price = await accountStripe.prices.retrieve(priceId)
            result = await stripe.paymentIntents.create(
                {
                    customer: customer.id,
                    amount: price.unit_amount,
                    currency: price.currency,
                    payment_method: paymentId,
                    confirm: true,
                    return_url: process.env.FRONT_BASE_URL
                },
                {
                    stripeAccount: accountId
                }
            )
            orderData.transaction = result.id
            orderData.amount = price.unit_amount
        }

        await OrderModel.create(orderData)
        return res.send(result)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: `Server error : ${error}` })
    }
}

export const getPayments = async (req: Request, res: Response) => {
    try {
        const paginatedResults = (req as any).paginatedResults
        res.status(200).json(paginatedResults)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const lintFunnelOrders = async (req: Request, res: Response) => {
    try {
        const orders = await OrderModel.find({ funnel: req.params.id })
            .lean()
            .exec()
        const csv = Papa.unparse(orders)

        res.setHeader("Content-Type", "text/csv")
        res.setHeader("Content-Disposition", "attachment; filename=orders.csv")

        res.status(200).send(csv)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const paymentByContactId = async (req: Request, res: Response) => {
    try {
        const paginatedResults = (req as any).paginatedResults
        res.status(200).json(paginatedResults)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}
