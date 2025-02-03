import { Response } from "express"
import EmailUserModel from "../models/emailUser"
import DomainModel from "../models/domain"
import UserModel from "../models/user"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { IEmailUser } from "../types/IEmailUser"
import Stripe from "stripe"
import * as fs from "fs"
import path from "path"

const DEFAULT_EMAIL_FREE_QUOTA = 10
const DEFAULT_EMAIL_PAID_QUOTA = 0
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const emailBlocklist = fs.readFileSync(path.join(__dirname, "/../../data/email_blocklist.txt"), {encoding: "utf-8"})
const restrictedEmailPrefixes = emailBlocklist.split(",").map(name => name.trim().toLowerCase())

const stripe = new Stripe(process.env.STRIPE2_SECRET_KEY)

export const getConfig = async (req: IExtendedRequest, res: Response) => {
    res.status(200).json({
        defaultDomainName: process.env.EMAIL_APP_DOMAIN
    })
}

export const getQuotas = async (req: IExtendedRequest, res: Response) => {
    const user = await UserModel.findById(req.user.id).exec()
    if (!user) {
        return res.status(400).json({ error: "User not found" })
    }

    const existingEmailUsers = await EmailUserModel.find({ user: req.user.id }).lean().exec()

    res.status(200).json({
        emailFreeQuota: user.emailFreeQuota || DEFAULT_EMAIL_FREE_QUOTA,
        emailPaidQuota: user.emailPaidQuota || DEFAULT_EMAIL_PAID_QUOTA,
        existingEmailUsers: existingEmailUsers.length
    })
}


export const createEmailUser = async (req: IExtendedRequest, res: Response) => {
    const emailPrefix = req.body.emailPrefix
    const domainId = req.body.domainId
    const password = req.body.password
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const priceId = req.body.priceId
    const paymentMethodId = req.body.paymentMethodId    

    if (!emailPrefix || emailPrefix.includes("@")) {
        return res.status(400).json({ error: "Invalid email address" })
    }

    if (!domainId && restrictedEmailPrefixes.includes(emailPrefix.trim().toLowerCase())) {
        return res.status(400).json({ error: "Restricted email address" })
    }

    let emailDomain = process.env.EMAIL_APP_DOMAIN
    if (domainId) {
        const domain = await DomainModel.findOne({ _id: domainId, user: req.user.id }).lean().exec()
        if (!domain) {
            return res.status(400).json({ error: "Domain not found" })
        }
        emailDomain = domain.domain
    }

    const emailAddress = `${emailPrefix.trim().toLowerCase()}@${emailDomain.trim().toLowerCase()}`

    const user = await UserModel.findById(req.user.id).exec()
    if (!user) {
        return res.status(400).json({ error: "User not found" })
    }

    if (!emailRegex.test(emailAddress)) {
        return res.status(400).json({ error: "Invalid email address" })
    }
    
    const existingEmailUser = await EmailUserModel.findOne({ email: emailAddress }).lean().exec()
    if (existingEmailUser) {
        return res.status(400).json({ error: "Account already exists" })
    }

    const emailFreeQuota = user.emailFreeQuota || DEFAULT_EMAIL_FREE_QUOTA
    const emailPaidQuota = user.emailPaidQuota || DEFAULT_EMAIL_PAID_QUOTA

    if (priceId) {
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

            
            let backupPaymentMethodId = ""
            if (
                !stripeCustomer?.invoice_settings?.default_payment_method &&
                !stripeCustomer?.default_source &&
                !paymentMethodId
            ) {
                if (stripeCustomer) {
                    const paymentMethods = await stripe.paymentMethods.list({
                        customer: stripeCustomer.id
                    })

                    if (paymentMethods.data.length > 0) {
                        backupPaymentMethodId = paymentMethods.data[paymentMethods.data.length - 1].id
                    } else {
                        throw new Error("No card on file")
                    }

                } else {
                    throw new Error("No card on file")
                }
            }
    
            if (!stripeCustomer) {
                stripeCustomer = await stripe.customers.create({
                    email: user.email,
                    payment_method: paymentMethodId,
                    invoice_settings: {
                        default_payment_method: paymentMethodId,
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
                if (user.emailSubscriptionId) {
                    let existingSubscription = await stripe.subscriptions.retrieve(user.emailSubscriptionId)
                    
                    const subAccountItem = existingSubscription.items.data.find(item => item.price.id === priceId)
                    
                    if (subAccountItem) {
                        console.log("Subscription item for extra sub-accounts was found.")
                        await stripe.subscriptionItems.update(subAccountItem.id, {
                            quantity: subAccountItem.quantity + 1,
                            proration_behavior: "always_invoice"
                        })
                        existingSubscription = await stripe.subscriptions.retrieve(user.emailSubscriptionId)
                        if (existingSubscription.status !== "active") {
                            throw new Error("Payment failed or is incomplete")
                        }
                    } else {
                        console.log("Subscription item for extra sub-accounts not found.")
                        const result = await stripe.subscriptions.create({
                            customer: stripeCustomer.id,
                            items: [{ price: priceId, quantity: 1 }],
                            expand: ["latest_invoice.payment_intent"],
                            default_payment_method:
                                paymentMethodId ||
                                stripeCustomer?.invoice_settings?.default_payment_method?.toString() ||
                                stripeCustomer?.default_source?.toString() ||
                                backupPaymentMethodId
                        })
                        if (result.status !== "active") {
                            throw new Error("Payment failed or is incomplete")
                        }
                        user.emailSubscriptionId = result.id
                    }
                    
                } else {
                    console.log("No previous subscription item.")
                    const result = await stripe.subscriptions.create({
                        customer: stripeCustomer.id,
                        items: [{ price: priceId, quantity: 1 }],
                        expand: ["latest_invoice.payment_intent"],
                        default_payment_method:
                            paymentMethodId ||
                            stripeCustomer?.invoice_settings?.default_payment_method?.toString() ||
                            stripeCustomer?.default_source?.toString() ||
                            backupPaymentMethodId
                    })
                    if (result.status !== "active") {
                        throw new Error("Payment failed or is incomplete")
                    }
                    user.emailSubscriptionId = result.id
                }
            } else {
                console.log("Non-recurring payment.")
                const result = await stripe.paymentIntents.create({
                    customer: stripeCustomer.id,
                    amount: price.unit_amount,
                    currency: price.currency,
                    payment_method:
                        paymentMethodId ||
                        stripeCustomer?.invoice_settings?.default_payment_method?.toString() ||
                        stripeCustomer?.default_source?.toString() ||
                        backupPaymentMethodId,
                    confirm: true,
                    return_url: process.env.FRONT_BASE_URL
                })
                if (result.status !== "succeeded") {
                    throw new Error("Payment failed or is incomplete")
                }
            }
    
            // payment has succeeded
            user.emailPaidQuota = emailPaidQuota + 1
            user.save()
        } catch (error) {
            console.error(error)
            return res.status(200).json({ error: error.message })
        }
        
    } else {
        const existingEmailUsers = await EmailUserModel.find({ user: req.user.id }).lean().exec()
        if (existingEmailUsers?.length >= (emailFreeQuota + emailPaidQuota)) {
            return res.status(400).json({ error: "Max email users reached" })
        }
    }

    try {
        // check if domain was already added to mailu
        const emailCheckResponse = await fetch(`https://${process.env.EMAIL_APP_DOMAIN}/api/v1/domain/${emailDomain}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.EMAIL_APP_API_KEY}`
            },
        })
        const emailCheckData = await emailCheckResponse.json()
        if (!emailCheckData || !emailCheckData.name || emailCheckData.name !== emailDomain) {
            // add new domain to mailu
            await fetch(`https://${process.env.EMAIL_APP_DOMAIN}/api/v1/domain`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.EMAIL_APP_API_KEY}`
                },
                body: JSON.stringify({
                    "name": emailDomain,
                    "comment": emailDomain,
                    "max_users": -1,
                    "max_aliases": -1,
                    "max_quota_bytes": 0,
                    "signup_enabled": false,
                    "alternatives": []
                })
            })
        }

        // create mailu user
        await fetch(`https://${process.env.EMAIL_APP_DOMAIN}/api/v1/user`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.EMAIL_APP_API_KEY}`
            },
            body: JSON.stringify({
                "email": emailAddress,
                "raw_password": password,
                "comment": emailAddress,
                "quota_bytes": 16_106_127_360, // 15 GB
                "global_admin": false,
                "enabled": true,
                "enable_imap": true,
                "enable_pop": true,
                "allow_spoofing": true,
                "forward_enabled": false,
                "forward_destination": undefined,
                "forward_keep": true,
                "reply_enabled": false,
                "reply_subject": "Out of office",
                "reply_body": "Hello, I am out of office. I will respond when I am back.",
                "reply_startdate": "2024-01-01",
                "reply_enddate": "2024-02-01",
                "displayed_name": firstName + " " + lastName,
                "spam_enabled": true,
                "spam_mark_as_read": true,
                "spam_threshold": 80
            })
        })
    } catch (err) {
        console.error(err)
        return res.status(400).json({ error: "There was a problem making your account" })
    }

    const newEmailUser: IEmailUser = new EmailUserModel({
        user: req.user.id,
        email: emailAddress,
        password,
        firstName,
        lastName,
        domain: domainId || undefined
    })
    await newEmailUser.save()
    
    res.status(200).json({
        emailUserId: newEmailUser._id
    })
}


export const shareEmailCredentials = async (req: IExtendedRequest, res: Response) => {
    const emailUserId = req.body.emailUserId
    const toEmail = req.body.toEmail

    if (!toEmail || !emailRegex.test(toEmail)) {
        return res.status(400).json({ error: "Invalid email address" })
    }

    const emailUser = await EmailUserModel.findOne({ user: req.user.id, _id: emailUserId }).lean().exec()
    if (!emailUser) {
        return res.status(400).json({ error: "Email account not found" })
    }

    const webhookData = {
        toEmail,
        username: emailUser.email,
        password: emailUser.password,
        firstName: emailUser.firstName,
        lastName: emailUser.lastName,
        loginUrl: `https://${process.env.EMAIL_APP_DOMAIN}`
    }

    await fetch("https://hooks.zapier.com/hooks/catch/14242389/30pixtu/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(webhookData)
    })

    res.status(200).json({
        success: true
    })
}


export const changeEmailPassword = async (req: IExtendedRequest, res: Response) => {
    const emailUserId = req.body.emailUserId
    const newPassword = req.body.newPassword

    if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ error: "Must be at least 8 characters" })
    }

    const emailUser = await EmailUserModel.findOne({ _id: emailUserId, user: req.user.id }).exec()
    if (!emailUser) {
        return res.status(400).json({ error: "Email account not found" })
    }

    try {
        // patch mailu user
        await fetch(`https://${process.env.EMAIL_APP_DOMAIN}/api/v1/user/${encodeURIComponent(emailUser.email)}`, {
            method: "PATCH",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.EMAIL_APP_API_KEY}`
            },
            body: JSON.stringify({
                "raw_password": newPassword,
            })
        })
    } catch (err) {
        console.error(err)
        return res.status(400).json({ error: "There was a problem making your account" })
    }

    emailUser.password = newPassword
    emailUser.save()

    res.status(200).json({
        success: true
    })
}



export const getMyEmailUsers = async (req: IExtendedRequest, res: Response) => {
    try {
        const existingEmailUsers = await EmailUserModel.find({ user: req.user.id }).lean().exec()

        res.status(200).json(existingEmailUsers)
        // res.status(200).json([]) // for testing the banner
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}


export const deleteEmailUser = async (req: IExtendedRequest, res: Response) => {
    try {
        const emailUserId = req.params.emailUserId

        const emailUser = await EmailUserModel.findById(emailUserId).lean().exec()
        if (!emailUser) {
            return res.status(400).json({ error: "Account not found" })
        }

        const user = await UserModel.findById(req.user.id).exec()
        if (!user) {
            return res.status(400).json({ error: "User not found" })
        }

        try {
            await fetch(`https://${process.env.EMAIL_APP_DOMAIN}/api/v1/user/${encodeURIComponent(emailUser.email)}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.EMAIL_APP_API_KEY}`
                },
            })
        } catch (err) {
            console.error(err)
            return res.status(400).json({ error: "There was a problem deleting the account" })
        }

        await EmailUserModel.deleteOne({ _id: emailUserId, user: req.user.id }).exec()

        // if there is a paid subscription with at least 1 paid email quantity, decrease the quantity by 1
        if (user.emailSubscriptionId) {
            const existingSubscription = await stripe.subscriptions.retrieve(user.emailSubscriptionId)
            
            const subAccountItem = existingSubscription.items.data.length > 0 ? existingSubscription.items.data[0] : null
            
            if (subAccountItem && subAccountItem.quantity > 0) {
                console.log("Subscription item for extra sub-accounts was found.")
                await stripe.subscriptionItems.update(subAccountItem.id, {
                    quantity: subAccountItem.quantity - 1,
                    proration_behavior: "none"
                })

                if (subAccountItem.quantity <= 1) {
                    await stripe.subscriptions.cancel(user.emailSubscriptionId)
                    user.emailSubscriptionId = null
                    user.emailPaidQuota = 0
                    user.save()
                } else {
                    if (user.emailPaidQuota) {
                        user.emailPaidQuota = user.emailPaidQuota - 1
                        user.save()
                    }
                }
            } else {
                console.log("Deleting stripe subscription")
                await stripe.subscriptions.cancel(user.emailSubscriptionId)
                user.emailSubscriptionId = null
                user.emailPaidQuota = 0
                user.save()
            }
        }

        res.status(200).json({ success: true })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}
