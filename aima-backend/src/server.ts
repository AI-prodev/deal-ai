/* eslint-disable no-case-declarations */
/* eslint-disable indent */
/* eslint-disable no-prototype-builtins */
/* eslint-disable quotes */
/**
 * API Server Documentation
 *
 * This API server provides endpoints for processing requests related to
 * business acquisition theses, fetching business matches, and generating
 * recommendations.
 */

import express from "express"
import bodyParser from "body-parser"
import http from "http"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import path from "path"
import compression from "compression"
import cron from "node-cron"
import requestIp from "request-ip"
import apiRoutes from "./routes"
import { errorHandler, notFound } from "./middlewares/errorHandler"
import { connectDB } from "./config/db"
import { configEnv } from "./config/env"
import { checkDomain } from "./middlewares/domain"
import { domainRequest } from "./middlewares/domainRequest"
import { IExtendedRequest } from "./types/IExtendedRequest"
import {
    proxyWebhook,
    renderPage,
    renderPreview,
    renderVersion
} from "./controllers/pageController"
import stripeRouter from "./routes/stripe"
import Stripe from "stripe"
import { updateAccessBusinessLogic } from "./controllers/authController"
import UserModel from "./models/user"
import { clearFileDownloadSize } from "./utils/clearFileDownloadSize"
import SocketServer from "./services/socket.service"
import { checkPhoneNumbers } from "./utils/checkPhoneNumbers"
import { noteSocket } from "./noteSocket"
// import { getInsightsBackground } from "./utils/integrations/backgroundJobs"
import { sendMailWhenUnreadMessages } from "./utils/sendMailWhenUnreadMessages"

configEnv()

const app = express()
const server = http.createServer(app)

// Connect to the MongoDB database
connectDB()

// Socket
const socketServerInstance = new SocketServer(server)

// Stripe webhooks. Need to be defined before the middleware

const processStripeWebhook = async (
    secretKey: string,
    endpointSecret: string,
    request: express.Request,
    response: express.Response,
    index: number
) => {
    console.log(`[STRIPE] [WEBHOOK] Stripe ${index} webhook received!`)

    const stripe = new Stripe(secretKey, {
        apiVersion: "2023-10-16"
    })

    const sig = request.headers["stripe-signature"]

    let event

    try {
        event = stripe.webhooks.constructEvent(
            request.body,
            sig,
            endpointSecret
        )
    } catch (err) {
        console.log(
            "[STRIPE] [WEBHOOK] Couldn't reconstruct webhook",
            err.message
        )
        response
            .status(400)
            .send(
                `[STRIPE] [WEBHOOK] Couldn't reconstruct webhook", ${err.message}`
            )
        return
    }

    switch (event.type) {
        case "invoice.payment_succeeded":
        case "invoice.payment_failed":
        case "invoice.paid":
        case "invoice.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
        case "customer.subscription.created":
        case "charge.captured":
        case "charge.refunded":
        case "charge.succeeded":
            const eventObject:
                | Stripe.Charge
                | Stripe.Invoice
                | Stripe.Subscription = event.data.object

            if (!eventObject.customer) {
                console.log(
                    `[STRIPE] [WEBHOOK] No customer on event object ${eventObject.id}`
                )
                response
                    .status(200)
                    .send(
                        `[STRIPE] [WEBHOOK] No customer on event object ${eventObject.id}`
                    )
                return
            }

            const customer = (await stripe.customers.retrieve(
                eventObject.customer as string
            )) as Stripe.Customer

            if (!customer) {
                console.log(
                    `[STRIPE] [WEBHOOK] Customer not found for event object ${eventObject.id}`
                )
                response
                    .status(400)
                    .send(
                        `[STRIPE] [WEBHOOK] Customer not found for event object ${eventObject.id}`
                    )
                return
            }

            const user = await UserModel.findOne({
                email: customer.email.toLowerCase()
            })

            console.log(`[STRIPE] [WEBHOOK] For ${customer.email}`)

            if (!user) {
                console.log(
                    `[STRIPE] [WEBHOOK] User not found for email ${customer.email}`
                )
                response
                    .status(200)
                    .send(
                        `[STRIPE] [WEBHOOK] User not found for email ${customer.email}`
                    )
                return
            }

            try {
                await updateAccessBusinessLogic(user)
            } catch (err) {
                console.log(
                    "[STRIPE] [WEBHOOK] Error updating user access",
                    err.message
                )
                response
                    .status(400)
                    .send(
                        `[STRIPE] [WEBHOOK] Error updating user access", ${err.message}`
                    )
                return
            }

            break
        default:
            console.log(`[STRIPE] [WEBHOOK] Unhandled event type ${event.type}`)

            response
                .status(200)
                .send(`[STRIPE] [WEBHOOK] Unhandled event type ${event.type}`)

            return
    }

    console.log(`[STRIPE] [WEBHOOK] All done`)
    response.status(200).send(`[STRIPE] [WEBHOOK] All done`)
}

app.post(
    "/stripeWebhook",
    express.raw({ type: "application/json" }),
    async (request, response) => {
        try {
            await processStripeWebhook(
                process.env.STRIPE_SECRET_KEY as string,
                process.env.STRIPE_ENDPOINT_SECRET as string,
                request,
                response,
                1
            )
        } catch (err) {
            console.log(
                "[STRIPE] [WEBHOOK] Stripe 1 outer webhook error",
                err.message
            )
        }
    }
)

app.post(
    "/stripe2Webhook",
    express.raw({ type: "application/json" }),
    async (request, response) => {
        try {
            await processStripeWebhook(
                process.env.STRIPE2_SECRET_KEY as string,
                process.env.STRIPE2_ENDPOINT_SECRET as string,
                request,
                response,
                2
            )
        } catch (err) {
            console.log(
                "[STRIPE] [WEBHOOK] Stripe 2 outer webhook error",
                err.message
            )
        }
    }
)

// Schedule the cron job
// cron.schedule("*/30 * * * *", async () => {
//    try {
//        getInsightsBackground()
//    } catch (error) {
//        console.error("Error updating events:", error)
//    }
// })

// once a day
cron.schedule("0 0 * * *", async () => {
    try {
        // clear out the download limit for the Files app
        clearFileDownloadSize()
    } catch (error) {
        console.error("Error updating events:", error)
    }
})

// once per hour
cron.schedule("0 * * * *", async () => {
    try {
        // check phone numbers for inactive subscriptions
        checkPhoneNumbers()
    } catch (error) {
        console.error("Error updating events:", error)
    }
})

cron.schedule("*/10 * * * *", async () => {
    try {
        // check for unread messages in assist and send mails to visitors
        await sendMailWhenUnreadMessages()
    } catch (error) {
        console.error("Error sending emails")
    }
})

// Middleware
app.use(bodyParser.json({ limit: "10mb" }))
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }))
app.use(cors())
app.use(morgan("combined"))
app.use(express.static("public"))
app.use(helmet())
app.use(compression())
app.use(requestIp.mw())

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// For caddyserver, to see if a domain is valid before issuing an SSL certificate
app.get("/checkDomain", checkDomain)

app.use(apiRoutes)
app.use(stripeRouter)
app.get("/", domainRequest, (req: IExtendedRequest, res) => {
    if (req.domain || req.sharedBlogDomain) {
        return renderPage(req, res)
    } else {
        return res.send("API is running")
    }
})

app.get("/p/:funnelId/:path", renderPreview)
app.get("/p/:funnelId", renderPreview)
app.get("/p/version/:funnelId/:versionId/:path", renderVersion)
app.get("/p/version/:funnelId/:versionId", renderVersion)
app.post("/proxy/webhook", proxyWebhook)
app.get("/:path", domainRequest, renderPage)
app.get("/:path/:postSlug", domainRequest, renderPage)

// send back a 404 error for any unknown api request
app.use(notFound)

// handle error
app.use(errorHandler)

const port = process.env.PORT || 3000
server.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})

// Handle unhandled promise rejections

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
process.on("unhandledRejection", (err: Error, promise: Promise<any>) => {
    console.log("[UNHANDLED_REJECTION] Message", err.message)
    console.log("[UNHANDLED_REJECTION] Stack", err.stack)
    // Close server & exit process
    //server.close(() => process.exit(1))
})

export { socketServerInstance }
