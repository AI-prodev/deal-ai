import sgMail from "@sendgrid/mail"
import sgClient from "@sendgrid/client"
import { MailDataRequired } from "@sendgrid/helpers/classes/mail"
import Contact from "../models/contact"
import { BroadcastEmailDataStatus } from "../types/IBroadcastEmailData"
import BroadcastEmailData from "../models/broadcastEmailData"
import mongoose from "mongoose"
import User from "../models/user"

export type SendgridSentEmailToListContactsInput = {
    data: Omit<MailDataRequired, "to">
    lists: string[] | "All Contacts"
    broadcastEmailId: string
    userId: string
    sendgridAccount: string
    title: string
}

export class SendgridService {
    private readonly _client: typeof sgMail
    private readonly _sgClient: typeof sgClient

    constructor(apiKey: string) {
        sgMail.setApiKey(apiKey)
        sgClient.setApiKey(apiKey)

        this._client = sgMail
        this._sgClient = sgClient
    }

    async sendEmail(data: MailDataRequired): Promise<string> {
        return this._client
            .send({
                ...data,
                trackingSettings: {
                    openTracking: {
                        enable: true
                    },
                    clickTracking: {
                        enable: true
                    }
                }
            })
            .then(([response]) => {
                if (response) {
                    return response.headers["x-message-id"]
                }
            })
            .catch((error) => {
                console.error(error.response.body, "sendEmail")
                throw new Error("Couldn't send email")
            })
    }

    async sendEmailToListContacts({
        data,
        lists,
        broadcastEmailId,
        userId,
        sendgridAccount,
        title
    }: SendgridSentEmailToListContactsInput): Promise<{
        recipientsCount: number
        deliveredCount: number
    }> {
        const query =
            lists === "All Contacts" ? {} : { listIds: { $in: lists } }

        const [contacts, business] = await Promise.all([
            Contact.find({
                ...query,
                unsubscribed: { $ne: true },
                user: userId
            })
                .select("email firstName lastName unsubscribed")
                .lean()
                .exec(),
            User.findOne({ _id: userId })
                .select("businessName businessAddress")
                .lean()
                .exec()
        ])

        if (!contacts.length) {
            return Promise.resolve({ recipientsCount: 0, deliveredCount: 0 })
        }

        const mailData = contacts.map((contact) => ({
            ...data,
            to: {
                _id: contact._id,
                email: contact.email,
                name: contact.firstName + " " + contact.lastName
            }
        }))

        const sentEmailData = await Promise.all(
            mailData.map(async (mData) => {
                if (business) {
                    mData.html += "<hr>"
                    mData.html += `<p>${business.businessName}, ${business.businessAddress?.addressStreet}</p>`
                    mData.html += `<p>${business.businessAddress?.addressCity}, ${business.businessAddress?.addressState}, ${business.businessAddress?.addressCountry}</p>`
                    mData.html += "<hr>"
                }
                mData.html += `<p>If you wish to unsubscribe from future email broadcasts, please <a href="${process.env.FRONT_BASE_URL}/crm/broadcast/unsubscribe?broadcastId=${broadcastEmailId}&contactId=${mData.to._id}">click here.</a></p>`
                delete mData.to._id

                return this.sendEmail(mData as MailDataRequired)
                    .then(async (messageId) => {
                        return BroadcastEmailData.create({
                            user: userId,
                            sendgridAccount: new mongoose.Types.ObjectId(
                                sendgridAccount
                            ),
                            broadcastEmail: new mongoose.Types.ObjectId(
                                broadcastEmailId
                            ),
                            title,
                            ...mData,
                            messageId,
                            status: BroadcastEmailDataStatus.sent,
                            sentAt: new Date()
                        })
                    })
                    .catch(async () => {
                        return BroadcastEmailData.create({
                            user: userId,
                            sendgridAccount: new mongoose.Types.ObjectId(
                                sendgridAccount
                            ),
                            broadcastEmail: new mongoose.Types.ObjectId(
                                broadcastEmailId
                            ),
                            title,
                            ...mData,
                            status: BroadcastEmailDataStatus.failed,
                            sentAt: new Date()
                        })
                    })
            })
        )

        return {
            recipientsCount: mailData.length,
            deliveredCount: sentEmailData.filter(
                (data) => data.status === BroadcastEmailDataStatus.sent
            ).length
        }
    }

    async getVerifiedSenders() {
        return this._sgClient
            .request({
                method: "GET",
                url: "/v3/senders"
            })
            .then(([response]) => {
                if (response) {
                    return response.body
                }
            })
            .catch((error) => {
                console.error(error)
                throw new Error("Couldn't get verified senders")
            })
    }
}
