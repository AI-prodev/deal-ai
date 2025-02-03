import { Response } from "express"
import DomainModel from "../models/domain"
import FunnelModel from "../models/funnel"
import EmailUserModel from "../models/emailUser"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { IDomain } from "../types/IDomain"
import axios from "axios"

const blockedExtensions = ["fr", "au", "com.au", "country", "inc", "dealer", "auto", "car", "cars", "protection", "security", "rich", "voting", "storage", "theatre", "new", "game", "hosting", "sport", "tickets", "juegos", "movie", "sucks", "hiv", "creditcard", "casino", "audio", "blackfriday", "diet", "flowers", "guitars", "property", "travel", "jobs", "doctor", "furniture", "law", "accountants", "credit", "energy", "gold", "investments", "loans", "tires", "career", "adult", "ag", "cm", "porn", "sex", "realestate", "reise", "archi"]

function isValidDomain(input: string) {
    const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/
    return domainRegex.test(input)
}

export const createDomain = async (req: IExtendedRequest, res: Response) => {
    let domain = req.body.domain
    const isExternal = req.body.external
    const subscriptionId = req.body.subscriptionId || null
    if (!isValidDomain(domain)) {
        return res.status(400).json({ error: "Invalid domain" })
    }
    domain = domain.toLowerCase()
    const existingDomain = await DomainModel.findOne({ domain }).exec()
    if (existingDomain) {
        return res.status(400).json({ error: "Domain already exists" })
    }

    const userDomains = await DomainModel.find({ user: req.user.id })
        .lean()
        .exec()
    if (userDomains.length >= 100) {
        return res
            .status(400)
            .json({ error: "You've reached your maximum number of domains" })
    }

    const newDomain: IDomain = new DomainModel({
        user: req.user.id,
        domain,
        external: isExternal,
        subscriptionId
    })
    await newDomain.save()

    res.status(200).json(newDomain)
}

export const getDomain = async (req: IExtendedRequest, res: Response) => {
    try {
        const domain = await DomainModel.findOne({
            _id: req.params.domainId
        }).exec()

        res.status(200).json(domain)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const checkDomainRecords = async (req: IExtendedRequest, res: Response) => {
    try {
        const domain = await DomainModel.findOne({
            _id: req.params.domainId
        }).exec()

        if (!domain) {
            return res
                .status(400)
                .json({ error: "Domain not found" })
        }

        const response = await fetch(`https://www.whoisxmlapi.com/whoisserver/DNSService?apiKey=${process.env.DNS_LOOKUP_API_KEY}&domainName=${domain.domain}&type=A,CNAME,TXT,MX&outputFormat=JSON`)
        if (response) {
            const data = await response.json()
            if (data?.DNSData?.dnsRecords) {
                return res.status(200).json(data?.DNSData?.dnsRecords)
            }
        }

        res.status(200).json([])
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const autoRenew = async (req: IExtendedRequest, res: Response) => {
    try {
        const domains = await DomainModel.findOneAndUpdate(
            { _id: req.params.domainId, user: req.user.id },
            { autoRenew: req.body.autoRenew }
        ).exec()
        res.status(200).json(domains)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getMyDomains = async (req: IExtendedRequest, res: Response) => {
    try {
        const domains = await DomainModel.find({ user: req.user.id }).exec()

        res.status(200).json(domains)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const deleteDomain = async (req: IExtendedRequest, res: Response) => {
    try {
        // make sure the domain isn't used by a funnel or email user
        const existingFunnel = await FunnelModel.findOne({
            domain: req.params.domainId
        })
            .lean()
            .exec()
        if (existingFunnel) {
            return res
                .status(400)
                .json({
                    error: "Domain is in use by a funnel. Please remove it from that funnel first."
                })
        }

        const existingEmailUser = await EmailUserModel.findOne({
            domain: req.params.domainId
        })
            .lean()
            .exec()
        if (existingEmailUser) {
            return res
                .status(400)
                .json({
                    error: "Domain is in use by an email account. Please delete that email account first."
                })
        }

        await DomainModel.deleteOne({
            _id: req.params.domainId,
            user: req.user.id
        }).exec()

        res.status(200).json()
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const checkDomain = async (req: IExtendedRequest, res: Response) => {
    const domainName = req.body.domainName
    const token = process.env.DNSIMPLE_TOKEN
    const accountId = process.env.DNSIMPLE_ACCOUNT_ID

    try {
        if (domainName) {
            const extension = domainName.split(".").slice(1).join(".")
            if (blockedExtensions.includes(extension)) {
                return res
                    .status(400)
                    .json({ error: "This domain extension is not available" })
            }
            const response = await axios.get(
                `${process.env.DNSIMPLE_BASE_URL}/${accountId}/registrar/domains/${domainName}/check`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            )

            if (response.status === 200) {
                const data = response.data.data
                res.status(200).json(data)
            } else {
                console.error(
                    "Error fetching domain availability:",
                    response.status,
                    response.statusText
                )
                res.status(response.status).json({
                    error: "Failed to fetch domain availability"
                })
            }
        } else {
            res.status(400).json({
                error: "Missing domainName in the request body"
            })
        }
    } catch (error) {
        console.error("Error during domain check:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

const makeAxiosPostRequest = async (url: string, data: any, token: string) => {
    try {
        const response = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        })
        return response
    } catch (error) {
        console.error("Error making axios post request:", error)
        throw error
    }
}

export const registerDomain = async (req: IExtendedRequest, res: Response) => {
    const token = process.env.DNSIMPLE_TOKEN
    const accountId = process.env.DNSIMPLE_ACCOUNT_ID
    const registrant_id = process.env.DNSIMPLE_REGISTRANT_ID
    const domain = req.body.domain
    try {
        if (domain) {
            const registrationResponse = await makeAxiosPostRequest(
                `${process.env.DNSIMPLE_BASE_URL}/${accountId}/registrar/domains/${domain}/registrations`,
                { registrant_id, auto_renew: true },
                token
            )

            if (registrationResponse.status === 201) {
                makeAxiosPostRequest(
                    `${process.env.DNSIMPLE_BASE_URL}/${accountId}/zones/${domain}/records`,
                    {
                        name: "www",
                        type: "CNAME",
                        content: "cname.deal.ai"
                    },
                    token
                ),
                makeAxiosPostRequest(
                    `${process.env.DNSIMPLE_BASE_URL}/${accountId}/zones/${domain}/records`,
                    { name: "@", type: "A", content: "44.208.221.192" },
                    token
                )
                makeAxiosPostRequest(
                    `${process.env.DNSIMPLE_BASE_URL}/${accountId}/zones/${domain}/records`,
                    { name: "@", type: "TXT", content: `v=spf1 a:${process.env.EMAIL_APP_DOMAIN} ~all` },
                    token
                )
                makeAxiosPostRequest(
                    `${process.env.DNSIMPLE_BASE_URL}/${accountId}/zones/${domain}/records`,
                    { name: "@", type: "MX", content: `${process.env.EMAIL_APP_DOMAIN}` },
                    token
                )
                const registrationData = registrationResponse.data
                res.status(201).json(registrationData)
            } else {
                console.error(
                    "Error registering domain:",
                    registrationResponse.status,
                    registrationResponse.statusText
                )
                res.status(registrationResponse.status).json({
                    error: "Error registering domain"
                })
            }
        } else {
            res.status(400).json({
                error: "Missing domain in the request body"
            })
        }
    } catch (error) {
        console.error("Error during domain registering:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

export const getZoneRecords = async (req: IExtendedRequest, res: Response) => {
    const token = process.env.DNSIMPLE_TOKEN
    const accountId = process.env.DNSIMPLE_ACCOUNT_ID
    const domainId = req.params.id
    try {
        const findDomain = await DomainModel.findOne({ _id: domainId })
        const domain = findDomain.domain
        if (domain) {
            const response = await axios.get(
                `${process.env.DNSIMPLE_BASE_URL}/${accountId}/zones/${domain}/records`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            )
            if (response.status === 200) {
                const data = response.data
                res.status(200).json({ data: data, domain: domain })
            } else {
                console.error(
                    "Error getting records:",
                    response.status,
                    response.statusText
                )
                res.status(response.status).json({
                    error: "Error getting records"
                })
            }
        } else {
            res.status(400).json({
                error: "Missing domain in the request body"
            })
        }
    } catch (error) {
        console.error("Error during getting records:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

export const deleteZoneRecords = async (
    req: IExtendedRequest,
    res: Response
) => {
    const token = process.env.DNSIMPLE_TOKEN
    const accountId = process.env.DNSIMPLE_ACCOUNT_ID
    const id = req.params.id
    const recordString = req.params.record
    const record = parseInt(recordString)
    try {
        if (id) {
            const response = await axios.delete(
                `${process.env.DNSIMPLE_BASE_URL}/${accountId}/zones/${id}/records/${record}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            )
            if (response.status === 204) {
                const data = response.data
                res.status(200).json(data)
            } else {
                console.error(
                    "Error deleting records:",
                    response.status,
                    response.statusText
                )
                res.status(response.status).json({
                    error: "Error deleting records"
                })
            }
        } else {
            res.status(400).json({
                error: "Missing record in the request body"
            })
        }
    } catch (error) {
        console.error("Error during deleting record:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

export const addZoneRecord = async (req: IExtendedRequest, res: Response) => {
    const token = process.env.DNSIMPLE_TOKEN
    const accountId = process.env.DNSIMPLE_ACCOUNT_ID
    const domainName = req.body.domainName
    const name = req.body.name
    const type = req.body.type
    const content = req.body.content

    try {
        if (domainName) {
            const response = await axios.post(
                `${process.env.DNSIMPLE_BASE_URL}/${accountId}/zones/${domainName}/records`,
                { name, type, content },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            )

            if (response.status === 201) {
                const data = response.data
                res.status(201).json(data)
            } else {
                console.error(
                    "Error adding records:",
                    response.status,
                    response.statusText
                )
                res.status(response.status).json({
                    error: "Error adding records"
                })
            }
        } else {
            res.status(400).json({
                error: "Missing record in the request body"
            })
        }
    } catch (error) {
        console.error("Error during adding record:", error)

        if (error.response) {
            console.error("API Response Data:", error.response.data)
            res.status(500).json({ error: error.response.data.errors.base[0] })
        }
    }
}

export const editZoneRecord = async (req: IExtendedRequest, res: Response) => {
    const token = process.env.DNSIMPLE_TOKEN
    const accountId = process.env.DNSIMPLE_ACCOUNT_ID
    const zoneId = req.params.zoneId
    const id = req.params.id
    const name = req.body.name
    const content = req.body.content
    try {
        if (zoneId) {
            const response = await axios.patch(
                `${process.env.DNSIMPLE_BASE_URL}/${accountId}/zones/${zoneId}/records/${id}`,
                { name, content },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            )

            if (response.status === 201) {
                const data = response.data
                res.status(201).json(data)
            } else {
                console.error(
                    "Error edit records:",
                    response.status,
                    response.statusText
                )
                res.status(response.status).json({
                    error: "Error edit records"
                })
            }
        } else {
            res.status(400).json({
                error: "Missing record in the request body"
            })
        }
    } catch (error) {
        console.error("Error during edit record:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
}
