import { PipelineStage } from "mongoose"
import AssistModel from "../models/assist"

export const sendMailWhenUnreadMessages = async () => {
    const pipeline: PipelineStage[] = [
        {
            $unwind: "$messages"
        },
        {
            $match: {
                $expr: {
                    $not: {
                        $in: ["$visitor._id", "$messages.seenBy"]
                    }
                },
                "visitor.receivedMail": false
            }
        },
        {
            $lookup: {
                from: "assistssettings",
                localField: "appKey",
                foreignField: "appKey",
                as: "settings"
            }
        },
        {
            $addFields: {
                settings: {
                    $arrayElemAt: ["$settings", 0]
                }
            }
        },
        {
            $group: {
                _id: "$_id",
                appKey: {
                    $first: "$appKey"
                },
                visitor: {
                    $first: "$visitor"
                },
                settings: {
                    $first: "$settings"
                },
                messages: {
                    $push: "$messages"
                }
            }
        }
    ]
    const data = await AssistModel.aggregate(pipeline)
    const ticketsIds = data?.map((ticket) => ticket._id)

    if (ticketsIds.length) {
        await AssistModel.updateMany(
            { _id: { $in: ticketsIds } },
            { $set: { "visitor.receivedMail": true } },
            { multi: true }
        )
    }

    for (const ticket of data) {
        console.log("[ASSIST] Sending an email to:", ticket?.visitor?.email)
        if (!ticket?.settings?.url) continue

        const webhookData = {
            toEmail: ticket?.visitor?.email,
            firstName: ticket?.visitor?.name,
            siteName: ticket?.settings?.name,
            siteUrl: `${ticket?.settings?.url}?resumeTicket=${ticket._id}`
        }
        await fetch("https://hooks.zapier.com/hooks/catch/14242389/3pux5as/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(webhookData)
        })
    }
}
