import express, { Request, Response, NextFunction } from "express"
import AcademyModel from "../models/academy"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { getCurrentDateFormatted, getNextDayOfWeek } from "../utils/date"
import moment from "moment-timezone"

export function isDaylightSavingTime(dateString: string) {
    // Parse the input date in New York's time zone
    const inputDate = moment.tz(dateString, "America/New_York")
    const year = inputDate.year()

    // Create dates for January 1st and July 1st in the input year in New York's time zone
    const jan = moment.tz(`${year}-01-01`, "America/New_York")
    const jul = moment.tz(`${year}-07-01`, "America/New_York")

    // Get the UTC offset for January and July (in minutes)
    const standardTimeOffset = Math.min(jan.utcOffset(), jul.utcOffset())

    // Since standard time has a greater (less negative) offset than DST in the northern hemisphere,
    // the input date is in DST if its offset is less than the standard time offset
    return inputDate.utcOffset() > standardTimeOffset
}


export const isDaylightSavings = async (req: IExtendedRequest, res: Response) => {
    try {
        const dates = req.query.dates as string[]

        const result: { [date: string]: boolean } = {}
        for (const date of dates) {
            result[date] = isDaylightSavingTime(date)
        }

        res.status(200).json(result)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getAcademyBySlug = async (req: IExtendedRequest, res: Response) => {
    try {
        const academy = await AcademyModel.findOne({ slug: req.params.academySlug }).exec()

        res.status(200).json(academy)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getAcademyInvite = async (req: IExtendedRequest, res: Response) => {
    try {
        const academySlug = req.params.academySlug
        let email = req.query.email

        if (academySlug == "ai-marketing-academy") {
            const currentDay = getCurrentDateFormatted()
            const nextSunday = getNextDayOfWeek(currentDay, 0)
            const nextTuesday = getNextDayOfWeek(currentDay, 2)
    
            const liveCalls = [
                {
                    title: "Grow any business with AI - Free Live Training by deal.ai",
                    startTime: `\nDTSTART;TZID=America/New_York:${nextSunday.split("-").join("")}T140000`,
                    endTime: `\nDTEND;TZID=America/New_York:${nextSunday.split("-").join("")}T150000`,
                    meetingLink: "https://deal.ai/zoom",
                    descriptionHTML: "Grow any business with AI! Free live Zoom training on leveraging AI (and particularly deal.ai software platform) to market and boost your business.<br/><br/>Zoom link:<br/><a href=\"https://deal.ai/zoom\">https://deal.ai/zoom</a>",
                    recurIcs: "\nRRULE:FREQ=WEEKLY;BYDAY=TU,SU"
                },
                {
                    title: "Grow any business with AI - Free Live Training by deal.ai",
                    startTime: `\nDTSTART;TZID=America/New_York:${nextTuesday.split("-").join("")}T140000`,
                    endTime: `\nDTEND;TZID=America/New_York:${nextTuesday.split("-").join("")}T150000`,
                    meetingLink: "https://deal.ai/zoom",
                    descriptionHTML: "Grow any business with AI! Free live Zoom training on leveraging AI (and particularly deal.ai software platform) to market and boost your business.<br/><br/>Zoom link:<br/><a href=\"https://deal.ai/zoom\">https://deal.ai/zoom</a>",
                    recurIcs: "\nRRULE:FREQ=WEEKLY;BYDAY=TU,SU"
                },
            ]
            liveCalls.sort((a, b) => (a.startTime > b.startTime ? 1 : -1))

            let emailSection = ""
            if (email) {
                email = (email as string).replace(/\s/g, "+")
                emailSection = `\nATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=\n TRUE;CN=${email};X-NUM-GUESTS=0:mailto:${email}`
            }
    
            const invite = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nMETHOD:REQUEST\nORGANIZER;CN=deal.ai:mailto:support@deal.ai\nSEQUENCE:0\nSTATUS:CONFIRMED\nTRANSP:OPAQUE${liveCalls[0].startTime}${liveCalls[0].endTime}\nSUMMARY:${liveCalls[0].title}\nDESCRIPTION:${liveCalls[0].descriptionHTML}\nLOCATION:${liveCalls[0].meetingLink}${liveCalls[0].recurIcs}${emailSection}\nEND:VEVENT\nEND:VCALENDAR`
            
            res.status(200).type("text/calendar").send(invite)
        } else {
            throw new Error("Invalid event")
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

