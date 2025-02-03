import WebhookModel from "../models/webhook"
import { IFunnel } from "../types/IFunnel"
import { IPage } from "../types/IPage"
import { IContact } from "../types/IContact"


export const sendWebhook = async ({
    url,
    funnel,
    page,
    contact,
    payload,
}: {
    url: string
    funnel?: IFunnel
    page?: IPage
    contact?: IContact
    payload: any
}) => {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })

    const newWebhook = new WebhookModel({
        user: funnel ? funnel.user : undefined,
        project: funnel ? funnel.project : undefined,
        funnel: funnel ? funnel._id : undefined,
        page: page ? page._id : undefined,
        contact: contact ? contact._id : undefined,
        payload,
        url,
        status: response.status,
        succeeded: (response.status && response.status > 0 && response.status < 400) ? new Date() : undefined,
        failed: (!response.status || response.status === 0 || response.status >= 400) ? new Date() : undefined,
    })
    await newWebhook.save()
}