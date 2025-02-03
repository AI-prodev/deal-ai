import PhoneNumberModel from "../models/phoneNumber"
import UserModel from "../models/user"
import Stripe from "stripe"
import Twilio from "twilio"
import { DEFAULT_PHONE_FREE_QUOTA } from "../controllers/phoneController"

const client = Twilio(process.env.TWILIO_KEY_SID, process.env.TWILIO_KEY_SECRET, { accountSid: process.env.TWILIO_ACCOUNT_SID })

const stripe = new Stripe(process.env.STRIPE2_SECRET_KEY)

const PHONE_CHECK_BATCH_SIZE = 1000
const PHONE_REQUIRED_ROLES = ["admin", "user", "3dayfreetrial", "lite"]

function isDaysAfter(date1: Date, date2: Date, days: number): boolean {
    const millisecondsPerDay = 24 * 60 * 60 * 1000
    const difference = date2.getTime() - date1.getTime()
    return difference === days * millisecondsPerDay
}

export const checkPhoneNumbers = async () => {
    console.log("Checking phone numbers...")
    
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    const uncheckedNumbers = await PhoneNumberModel
        .find({ $or: [{ checkedAt: null }, { checkedAt: { $lt: threeDaysAgo } }], releasedAt: null, user: { $ne: null } })
        .limit(PHONE_CHECK_BATCH_SIZE)
        .exec()

    const userNumbers: { [userId: string]: number } = {}
    for (const number of uncheckedNumbers) {
        if (!userNumbers[String(number.user)]) {
            userNumbers[String(number.user)] = 0
        }
        userNumbers[String(number.user)]++
    }

    console.log("userNumbers=", userNumbers)
    
    const users = await UserModel.find({ _id: { $in: Object.keys(userNumbers) }}).exec()

    for (const user of users) {
        let isUserValid = true

        // check roles
        if (!PHONE_REQUIRED_ROLES.some(role => user.roles?.includes(role))) {
            isUserValid = false
        }

        // check stripe
        if (isUserValid && user.phoneSubscriptionId) {
            let existingSubscription = null
            try {
                existingSubscription = await stripe.subscriptions.retrieve(user.phoneSubscriptionId)
            } catch(err) {
                console.error(err)
            }
            if (!existingSubscription || existingSubscription.status !== "active") {
                isUserValid = false
            }
            
        }
        
        if (isUserValid) {
            // user is valid
            console.log(`User ${user.email} is valid`)
            user.phoneSubscriptionInvalidAt = null
            user.phoneSubscriptionWarnedAt = null
            user.save()
        } else {
            const userPhoneNumbers = await PhoneNumberModel.find({ user: user._id, releasedAt: null }).sort("createdAt").exec()
            
            if (userPhoneNumbers.length > DEFAULT_PHONE_FREE_QUOTA) {

                // send warning email
                if (!user.phoneSubscriptionInvalidAt) {
                    console.log(`User ${user.email} is invalid - setting invalid date`)
                    user.phoneSubscriptionInvalidAt = new Date()
                    user.save()
                } else if (user.phoneSubscriptionInvalidAt && isDaysAfter(user.phoneSubscriptionInvalidAt, new Date(), 14)) {
                    console.log(`User ${user.email} is invalid - sending warning email`)
                    // already set invalid status. now, send warning email
                    if (user.email) {
                        fetch(
                            "https://hooks.zapier.com/hooks/catch/14242389/3xlcfbs/",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    toEmail: user.email
                                })
                            }
                        )
                    }
                    user.phoneSubscriptionWarnedAt = new Date()
                    user.save()
                } else if (user.phoneSubscriptionWarnedAt && isDaysAfter(user.phoneSubscriptionWarnedAt, new Date(), 7)) {
                    console.log(`User ${user.email} is invalid - sending deletion email`)
                    // already sent warning email. now it's time to delete paid numbers
                    if (user.email) {
                        fetch(
                            "https://hooks.zapier.com/hooks/catch/14242389/3xl7mwn/",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    toEmail: user.email
                                })
                            }
                        )
                    }
                    if (user.phoneSubscriptionId) {
                        stripe.subscriptions.cancel(user.phoneSubscriptionId)
                    }
                    user.phoneSubscriptionId = null
                    user.phonePaidQuota = 0
                    user.phoneSubscriptionInvalidAt = null
                    user.phoneSubscriptionWarnedAt = null
                    user.save()

                    // skip free quota numbers, release the rest
                    for (let i = DEFAULT_PHONE_FREE_QUOTA; i < userPhoneNumbers.length; i++) {
                        const number = userPhoneNumbers[i]
                        if (number.twilioSid) {
                            client.incomingPhoneNumbers(number.twilioSid).remove()
                        }
                        number.releasedAt = new Date()
                        number.save()
                    }
                }
            } else {
                // user is valid
                console.log(`User ${user.email} is valid`)
                user.phoneSubscriptionInvalidAt = null
                user.phoneSubscriptionWarnedAt = null
                user.save()
            }
        }

        PhoneNumberModel.updateMany({ user: user._id, releasedAt: null }, { $set: { checkedAt: new Date() }}).exec()
    }
}
