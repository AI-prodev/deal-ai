import dotenv from "dotenv"
import express from "express"
import {
    findLatestStripeByEmail,
    createSubscriptionForDomain,
    createSubscriptionNewUser,
    getProductPrice,
    renewSubscriptions,
    getPriceByStripeId,
    getProductByStripeId,
    purchase
} from "../controllers/stripeController"
import { authenticate } from "../middlewares/auth"
dotenv.config()

const stripeRouter = express.Router()

stripeRouter.get("/stripe/config", authenticate, (req, res) => {
    res.status(200).json({
        publicKey: process.env.STRIPE2_PUBLIC_KEY
    })
})

stripeRouter.get("/config", authenticate, (req, res) => {
    res.status(200).json({
        PublishableKey: process.env.STRIPE2_PUBLIC_KEY
    })
})

stripeRouter.post(
    "/subscription",
    authenticate,
    findLatestStripeByEmail,
    createSubscriptionForDomain
)

stripeRouter.post("/newSubscription", authenticate, createSubscriptionNewUser)

stripeRouter.get("/price", authenticate, getProductPrice)

stripeRouter.get("/stripe/price/:priceId", authenticate, getPriceByStripeId)

stripeRouter.get(
    "/stripe/product/:productId",
    authenticate,
    getProductByStripeId
)

stripeRouter.post(
    "/stripe/purchase",
    authenticate,
    findLatestStripeByEmail,
    purchase
)

stripeRouter.post("/renew", authenticate, renewSubscriptions)

export = stripeRouter
