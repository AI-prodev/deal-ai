import { Response } from "express"
import PhoneNumberModel from "../models/phoneNumber"
import PhoneCallModel from "../models/phoneCall"
import { IExtendedRequest } from "../types/IExtendedRequest"
import Twilio from "twilio"
import { IPhoneNumber } from "../types/IPhoneNumber"
import { IPhoneCall } from "../types/IPhoneCall"
import axios from "axios"
import stream from "stream"
import { createFileAndPipeUpload, findOrCreateFolder } from "./fileController"
import UserModel from "../models/user"
import Stripe from "stripe"
import * as fs from "fs"
import { putObjectBuffer } from "../services/files.service"
import { randomUUID } from "crypto"
import ffmpeg from "fluent-ffmpeg"


export const DEFAULT_PHONE_FREE_QUOTA = 1
export const DEFAULT_PHONE_PAID_QUOTA = 0
export const MAX_UNPAID_PHONE_NUMBERS = 10

const ALLOWED_PHONE_ROLES = [
    "admin",
    "user",
    "lite"
]

const client = Twilio(process.env.TWILIO_KEY_SID, process.env.TWILIO_KEY_SECRET, { accountSid: process.env.TWILIO_ACCOUNT_SID })

const stripe = new Stripe(process.env.STRIPE2_SECRET_KEY)

function isValidE164PhoneNumber(number: string) {
    const e164Regex = /^\+[1-9]\d{1,14}$/
    return e164Regex.test(number)
}

export const getQuotas = async (req: IExtendedRequest, res: Response) => {
    const user = await UserModel.findById(req.user.id).exec()
    if (!user) {
        return res.status(400).json({ error: "User not found" })
    }

    const existingPhoneNumbers = await PhoneNumberModel.find({ user: req.user.id, releasedAt: null }).lean().exec()

    res.status(200).json({
        phoneFreeQuota: user.phoneFreeQuota || DEFAULT_PHONE_FREE_QUOTA,
        phonePaidQuota: user.phonePaidQuota || DEFAULT_PHONE_PAID_QUOTA,
        existingPhoneNumbers: existingPhoneNumbers.length
    })
}

export const createPhoneNumber = async (req: IExtendedRequest, res: Response) => {
    const title = req.body.title
    const record = req.body.record
    const isGreetingAudio = req.body.isGreetingAudio
    const greetingAudio = req.body.greetingAudio
    const greetingText = req.body.greetingText
    const number = req.body.number
    const numberFormatted = req.body.numberFormatted
    const extensions = req.body.extensions
    const priceId = req.body.priceId
    const paymentMethodId = req.body.paymentMethodId

    console.log("req.body=", req.body)
    
    const user = await UserModel.findById(req.user.id).exec()
    if (!user) {
        return res.status(400).json({ error: "User not found" })
    }

    if (!title || !numberFormatted) {
        return res.status(400).json({ error: "A title is required" })
    }
    if (!extensions || extensions.length < 1) {
        return res.status(400).json({ error: "At least 1 extension is required" })
    }
    if (!number || !isValidE164PhoneNumber(number)) {
        return res.status(400).json({ error: "Invalid phone number" })
    }
    for (const extension of extensions) {
        if (!extension.title || !extension.number || !isValidE164PhoneNumber(extension.number)) {
            return res.status(400).json({ error: "Invalid extension" })
        }
    }

    // Check the number one last time
    const availableNumbers = await client.availablePhoneNumbers("US").local.list({
        contains: number.replace("+", ""),
        limit: 1
    })
    console.log("availableNumbers=", availableNumbers.length)

    if (!availableNumbers || availableNumbers.length == 0) {
        return res.status(400).json({ error: "Number no longer available" })
    }

    const phoneFreeQuota = user.phoneFreeQuota || DEFAULT_PHONE_FREE_QUOTA
    const phonePaidQuota = user.phonePaidQuota || DEFAULT_PHONE_PAID_QUOTA

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
                    customer: stripeCustomer.id,
                })
                const paymentMethods = await stripe.paymentMethods.list({
                    customer: stripeCustomer.id
                })
                await stripe.customers.update(stripeCustomer.id, {
                    invoice_settings: {
                        default_payment_method: paymentMethods.data[paymentMethods.data.length - 1].id
                    }
                })
            }
    
            if (price.type === "recurring") {
                if (user.phoneSubscriptionId) {
                    let existingSubscription = await stripe.subscriptions.retrieve(user.phoneSubscriptionId)
                    
                    const subAccountItem = existingSubscription.items.data.find(item => item.price.id === priceId)
                    
                    if (subAccountItem) {
                        console.log("Subscription item for extra sub-accounts was found.")
                        await stripe.subscriptionItems.update(subAccountItem.id, {
                            quantity: subAccountItem.quantity + 1,
                            proration_behavior: "always_invoice",
                        })
                        existingSubscription = await stripe.subscriptions.retrieve(user.phoneSubscriptionId)
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
                        user.phoneSubscriptionId = result.id
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
                    user.phoneSubscriptionId = result.id
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
            user.phonePaidQuota = phonePaidQuota + 1
            user.save()
        } catch (error) {
            console.error(error)
            return res.status(200).json({ error: error.message })
        }
        
    } else {
        const existingUnreleasedPhoneNumbers = await PhoneNumberModel.find({ user: req.user.id, releasedAt: null }).lean().exec()
        const existingTotalPhoneNumbers = await PhoneNumberModel.find({ user: req.user.id }).lean().exec()
        if (existingUnreleasedPhoneNumbers?.length >= (phoneFreeQuota + phonePaidQuota) || existingTotalPhoneNumbers.length > MAX_UNPAID_PHONE_NUMBERS) {
            return res.status(400).json({ error: "Max phone numbers reached" })
        }
    }

    console.log("Buying number...")
    const createdNumber = await client.incomingPhoneNumbers.create({ phoneNumber: number })
    console.log("sid=", createdNumber.sid)

    const newPhoneNumber: IPhoneNumber = new PhoneNumberModel({
        user: req.user.id,
        twilioSid: createdNumber.sid,
        title,
        record,
        isGreetingAudio,
        greetingAudio,
        greetingText,
        number,
        numberFormatted,
        extensions
    })
    await newPhoneNumber.save()

    console.log("Assigning friendly name...")
    await client.incomingPhoneNumbers(createdNumber.sid).update({ friendlyName: "phoneNumber_" + newPhoneNumber._id })
    console.log("Assigning voice url...")
    await client.incomingPhoneNumbers(createdNumber.sid).update({
        voiceUrl: `${process.env.BACK_BASE_URL}/phones/calls/accept`,
        statusCallback: `${process.env.BACK_BASE_URL}/phones/calls/status`
    })
    
    res.status(200).json({
        phoneNumberId: newPhoneNumber._id
    })
}


export const uploadGreeting = async (req: IExtendedRequest, res: Response) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.")
    }
    
    try {
        const fileKey = `${req.user.id}_greeting_${randomUUID()}`

        const outputFilePath = `${req.file.path.split(".")[0]}_converted.wav`
        // Convert MP3 to μ-law WAV format
        await new Promise((resolve, reject) => {
            ffmpeg(req.file.path)
                .audioCodec("pcm_mulaw")
                .audioChannels(1)
                .audioFrequency(8000)
                .format("wav")
                .on("error", (err) => {
                    console.error("Conversion error:", err)
                    reject(err)
                })
                .on("end", () => {
                    console.log("File has been converted successfully.")
                    resolve(true)
                })
                .save(outputFilePath)
        })

        const fileContent = fs.readFileSync(outputFilePath)
        
        await putObjectBuffer({
            Bucket: process.env.S3_UPLOADS_BUCKET,
            Key: fileKey,
            Body: fileContent,
            ContentType: "audio/wav"
        })

        res.send({
            greetingUrl: process.env.CLOUDFRONT_UPLOADS_PREFIX + `/${fileKey}`
        })
    } catch (error) {
        console.error("Error uploading file:", error)
        res.status(500).send("Error uploading file")
    } finally {
        fs.unlinkSync(req.file.path) // Delete the file from local storage
    }
}



export const acceptCall = async (req: IExtendedRequest, res: Response) => {
    console.log("req.body=", req.body)

    const twiml = new Twilio.twiml.VoiceResponse()

    if (!req.body || !req.body.To) {
        twiml.reject()
        return res.type("text/xml").send(twiml.toString())
    }
    
    const phoneNumber = await PhoneNumberModel.findOne({ number: req.body.To, releasedAt: null })
    if (!phoneNumber || !phoneNumber.extensions || phoneNumber.extensions.length === 0) {
        twiml.reject()
        return res.type("text/xml").send(twiml.toString())
    }

    const user = await UserModel.findOne({ _id: phoneNumber.user })
    if (!user || !user.roles || (!user.roles.find(role => ALLOWED_PHONE_ROLES.includes(role)))) {
        twiml.reject()
        return res.type("text/xml").send(twiml.toString())
    }

    if (req.body.Digits && req.body.Digits.length > 0) {
        const digit = parseInt(req.body.Digits.substring(0, 1))
        console.log("digit=", digit)

        let redirectNumber = phoneNumber.extensions[0].number
        let redirectTitle = phoneNumber.extensions[0].title
        if (!isNaN(digit) && digit > 0 && digit <= phoneNumber.extensions.length) {
            redirectNumber = phoneNumber.extensions[digit - 1].number
            redirectTitle = phoneNumber.extensions[digit - 1].title
        }

        console.log("redirectNumber=", redirectNumber)
        let transferMessage = `Please wait while I transfer you to ${redirectTitle}...`
        if (phoneNumber.record) {
            transferMessage += " This call is being recorded for quality and training purposes..."
        }
        twiml.say(transferMessage)
        if (phoneNumber.record) {
            twiml.dial({
                record: "record-from-answer",
                recordingStatusCallback: "/phones/calls/recording"
            }, redirectNumber)
        } else {
            twiml.dial(redirectNumber)
        }
        return res.type("text/xml").send(twiml.toString())
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gatherParams: any = {
        input: ["dtmf"],
        numDigits: 1,
        bargeIn: true,
        action: "/phones/calls/accept",
        language: "en-US",
        speechModel: "numbers_and_commands",
        actionOnEmptyResult: true,
    }
    
    if (phoneNumber.isGreetingAudio && phoneNumber.greetingAudio) {
        twiml.gather(gatherParams).play(phoneNumber.greetingAudio)
    } else {
        let greeting = phoneNumber.greetingText
        if (!greeting) {
            greeting = `Hello and welcome to ${phoneNumber.title}...`
            for (let i = 0; i < phoneNumber.extensions.length; i++) {
                if (phoneNumber.extensions[i].title) {
                    greeting += ` Press ${i + 1} to be connected to ${phoneNumber.extensions[i].title}.`
                }
            }
        }
        twiml.gather(gatherParams).say(greeting)
    }
    
    res.type("text/xml").send(twiml.toString())
}

export const processCallStatus = async (req: IExtendedRequest, res: Response) => {
    //console.log("req.body=", req.body)

    if (!req.body || !req.body.CallSid || req.body.CallStatus !== "completed") {
        return res.status(200).json({})
    }

    // make sure the call exists in Twilio before saving the call
    client.calls.get(req.body.CallSid).fetch().then(call => {
        // console.log("call=", call)

        PhoneNumberModel.findOne({ number: call.to, releasedAt: null }).lean().exec().then(number => {
            if (!number) {
                return
            }
            const startTime = new Date(call.startTime)
            const endTime = new Date(call.endTime)
            const duration = Math.ceil((endTime.getTime() - startTime.getTime()) / 1000)
            const newPhoneCall: IPhoneCall = new PhoneCallModel({
                user: number.user,
                phoneNumber: number._id,
                twilioSid: call.sid,
                from: call.from,
                fromFormatted: call.fromFormatted,
                to: call.to,
                toFormatted: call.toFormatted,
                startTime: call.startTime,
                endTime: call.endTime,
                duration
            })
            newPhoneCall.save()
        }).catch(err => {
            console.error(err)
        })
    }).catch(err => {
        console.error(err)
    })

    res.status(200).json({})
}


export const processCallRecording = async (req: IExtendedRequest, res: Response) => {
    console.log("req.body=", req.body)

    if (!req.body || !req.body.CallSid || !req.body.RecordingUrl) {
        return res.status(200).json({})
    }

    // make sure the call exists in Twilio before saving the call
    client.calls.get(req.body.CallSid).fetch().then(call => {
        // console.log("call=", call)
        

        PhoneNumberModel.findOne({ number: call.to, releasedAt: null }).lean().exec().then(async (number) => {
            if (!number) {
                return
            }
            const response = await axios({
                method: "get",
                url: req.body.RecordingUrl,
                responseType: "stream",
                auth: {
                    username: process.env.TWILIO_KEY_SID,
                    password: process.env.TWILIO_KEY_SECRET
                }
            })            

            const pass = new stream.PassThrough()
            response.data.pipe(pass)

            const folder = await findOrCreateFolder(String(number.user), "Call Recordings")
            if (!folder) {
                return
            }

            let fileName = `Call at ${req.body.RecordingStartTime}.mp3`
            fileName = fileName.replace(" +0000", " UTC")
            const file = await createFileAndPipeUpload(
                String(number.user),
                folder._id,
                fileName,
                pass,
                "audio/mpeg"
            )

            const phoneCall = await PhoneCallModel.findOne({ twilioSid: req.body.CallSid }).exec()

            if (phoneCall && file) {
                phoneCall.recordingFile = file._id
                phoneCall.save()

                console.log("File Saved")
            }
        }).catch(err => {
            console.error(err)
        })
    }).catch(err => {
        console.error(err)
    })

    

    res.status(200).json({})
}

export const getMyPhoneNumbers = async (req: IExtendedRequest, res: Response) => {
    const numbers = await PhoneNumberModel.find({ user: req.user.id, releasedAt: null }).lean().exec()

    //res.status(200).json([]) // for testing initial banner
    res.status(200).json(numbers)
}

export const getMyPhoneCalls = async (req: IExtendedRequest, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20
    const offsetCallId = req.query.offsetCallId

    let fromDate = "2099-01-01T00:00:00.000+0000"
    if (offsetCallId) {
        const call = await PhoneCallModel.findById(offsetCallId).lean().exec()
        if (!call) {
            return res.status(400).json({ error: "Call not found" })
        }
        fromDate = call.createdAt
    }

    const calls = await PhoneCallModel
        .find({ user: req.user.id, createdAt: { $lt: new Date(fromDate) } })
        .sort("-createdAt")
        .limit(limit)
        .populate("phoneNumber")
        .lean().exec()

    //res.status(200).json([]) // for testing initial banner
    res.status(200).json(calls)
}


export const getAvailablePhoneNumbers = async (req: IExtendedRequest, res: Response) => {
    const areaCode = req.query.areaCode as string

    console.log("Getting available numbers...")
    const numbers = await client.availablePhoneNumbers("US").local.list({
        areaCode: areaCode ? parseInt(areaCode) : undefined,
        beta: false,
        limit: 20
    })
    console.log("numbers=", numbers.length)

    if (!numbers || numbers.length == 0) {
        return res.status(200).json([])
    }

    res.status(200).json(numbers)
}


export const updatePhoneNumber = async (req: IExtendedRequest, res: Response) => {
    const phoneNumberId = req.params.phoneNumberId
    const title = req.body.title
    const record = req.body.record
    const isGreetingAudio = req.body.isGreetingAudio
    const greetingAudio = req.body.greetingAudio
    const greetingText = req.body.greetingText
    const extensions = req.body.extensions

    const number = await PhoneNumberModel.findOne({ _id: phoneNumberId, user: req.user.id, releasedAt: null }).exec()

    if (!number) {
        return res.status(400).json({ error: "Number not found" })
    }

    if (!title) {
        return res.status(400).json({ error: "A title is required" })
    }
    if (!extensions || extensions.length < 1) {
        return res.status(400).json({ error: "At least 1 extension is required" })
    }
    for (const extension of extensions) {
        if (!extension.title || !extension.number || !isValidE164PhoneNumber(extension.number)) {
            return res.status(400).json({ error: "Invalid extension" })
        }
    }

    number.title = title
    number.record = record
    number.isGreetingAudio = isGreetingAudio
    number.greetingAudio = greetingAudio
    number.greetingText = greetingText
    number.extensions = extensions
    await number.save()

    res.status(200).json({ success: true })
}

export const releasePhoneNumber = async (req: IExtendedRequest, res: Response) => {
    const phoneNumberId = req.params.phoneNumberId

    const number = await PhoneNumberModel.findOne({ _id: phoneNumberId, user: req.user.id, releasedAt: null }).exec()

    if (!number || !number.twilioSid) {
        return res.status(400).json({ error: "Number not found" })
    }

    const user = await UserModel.findById(req.user.id).exec()
    if (!user) {
        return res.status(400).json({ error: "User not found" })
    }

    await client.incomingPhoneNumbers(number.twilioSid).remove()

    number.releasedAt = new Date()
    number.save()

    // if there is a paid subscription with at least 1 paid phone number quantity, decrease the quantity by 1
    if (user.phoneSubscriptionId) {
        const existingSubscription = await stripe.subscriptions.retrieve(user.phoneSubscriptionId)
        
        const subAccountItem = existingSubscription.items.data.length > 0 ? existingSubscription.items.data[0] : null
        
        if (subAccountItem && subAccountItem.quantity > 0) {
            console.log("Subscription item for extra phone numbers was found.")
            await stripe.subscriptionItems.update(subAccountItem.id, {
                quantity: subAccountItem.quantity - 1,
                proration_behavior: "none"
            })

            if (subAccountItem.quantity <= 1) {
                await stripe.subscriptions.cancel(user.phoneSubscriptionId)
                user.phoneSubscriptionId = null
                user.phonePaidQuota = 0
                user.save()
            } else {
                if (user.phonePaidQuota) {
                    user.phonePaidQuota = user.phonePaidQuota - 1
                    user.save()
                }
            }
        } else {
            console.log("Deleting stripe subscription")
            await stripe.subscriptions.cancel(user.phoneSubscriptionId)
            user.phoneSubscriptionId = null
            user.phonePaidQuota = 0
            user.save()
        }
    }

    res.status(200).json({ success: true })
}

