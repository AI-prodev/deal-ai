/* eslint-disable indent */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { chooseOpenAiKey } from "../utils/chooseOpenAiKey"
import Lead, { IInputLead, ILead, ILeadStatus } from "../models/lead"
import OpenAI from "openai"

export const addLead = async (lead: IInputLead): Promise<ILead> => {
    lead.businessEmail = lead.businessEmail.toLowerCase()

    const leadStatus: ILeadStatus = {
        isModerated: false,
        isDuplicate: false
    }

    const openai = new OpenAI({
        apiKey: chooseOpenAiKey()
    })

    try {
        const moderation = await openai.moderations.create({
            input: `
        ${lead.businessName}
        ${lead.businessWebsite}
        ${lead.businessDescription}
        ${lead.monthlyMarketingBudget}
        ${lead.location}
        ${lead.workingWithAgency}
        ${lead.currentChallenges}
        ${lead.businessEmail}
        ${lead.howSoonGrowth}
        `
        })

        if (moderation.results[0].flagged) {
            leadStatus.isModerated = true
            leadStatus.flags = moderation.results[0].categories as any
        }
    } catch (error) {
        console.error("Unable to moderate lead", error)

        leadStatus.isModerated = true
        leadStatus.flags = {
            error: "Unable to moderate content due to" + error
        } as any
    }

    const duplicates = await Lead.aggregate([
        { $match: { businessEmail: lead.businessEmail } },
        {
            $match: {
                createdAt: {
                    $gte: new Date(
                        new Date().getTime() - 60 * 24 * 60 * 60 * 1000
                    )
                }
            }
        },
        { $limit: 1 }
    ])

    if (duplicates.length > 0) {
        leadStatus.isDuplicate = true
    }

    const newLead = new Lead({
        ...lead,
        ...leadStatus
    })

    return await newLead.save()
}

const parseBudgetValue = (budgetString: string): number => {
    if (budgetString === "Under $1,000") {
        budgetString = "Under $999"
    }
    console.log("budgetString", budgetString)
    const result = budgetString.match(/(\d+),?(\d*)/)
    console.log("result", parseInt(result[0].replace(/,/g, ""), 10))
    return result ? parseInt(result[0].replace(/,/g, ""), 10) : 0
}

const dynamicSort = (leads: ILead[], sort: any): ILead[] => {
    const sortField = Object.keys(sort)[0]
    const sortOrder = sort[sortField]

    if (sortField === "monthlyMarketingBudget") {
        return leads.sort((a, b) => {
            const valueA = parseBudgetValue(a.monthlyMarketingBudget)
            console.log("Value A", a.monthlyMarketingBudget)
            const valueB = parseBudgetValue(b.monthlyMarketingBudget)
            console.log("Value B", a.monthlyMarketingBudget)
            return sortOrder * (valueA - valueB)
        })
    } else {
        return leads.sort(
            //@ts-ignore
            (a, b) => sortOrder * (a[sortField] < b[sortField] ? -1 : 1)
        )
    }
}

export const getLeads = async (
    additionalFilters: any,
    page: number,
    limit: number,
    sort: any = { createdAt: -1 },
    roles: string[]
): Promise<{ leads: IInputLead[]; totalData: number }> => {
    try {
        const defaultFilters = {
            createdAt: {
                $gte: new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000)
            },
            isDuplicate: false,
            isModerated: false
        }

        const filters = { ...defaultFilters, ...additionalFilters }
        const startIndex = (page - 1) * limit

        const budgetSortOrder = sort.monthlyMarketingBudget
            ? sort.monthlyMarketingBudget
            : sort.createdAt
            ? sort.createdAt
            : -1

        const pipeline = [
            { $match: filters },
            {
                $addFields: {
                    numericBudget: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$monthlyMarketingBudget",
                                            "Under $1,000"
                                        ]
                                    },
                                    then: 999
                                },
                                {
                                    case: {
                                        $regexMatch: {
                                            input: "$monthlyMarketingBudget",
                                            regex: /^\$1,000 - \$5,000$/
                                        }
                                    },
                                    then: 1000
                                },
                                {
                                    case: {
                                        $regexMatch: {
                                            input: "$monthlyMarketingBudget",
                                            regex: /^\$5,000 - \$10,000$/
                                        }
                                    },
                                    then: 5000
                                },
                                {
                                    case: {
                                        $regexMatch: {
                                            input: "$monthlyMarketingBudget",
                                            regex: /^\$10,000 - \$50,000$/
                                        }
                                    },
                                    then: 10000
                                },
                                {
                                    case: {
                                        $regexMatch: {
                                            input: "$monthlyMarketingBudget",
                                            regex: /^\$50,000 - \$100,000$/
                                        }
                                    },
                                    then: 50000
                                },
                                {
                                    case: {
                                        $regexMatch: {
                                            input: "$monthlyMarketingBudget",
                                            regex: /^\$100,000\+$/
                                        }
                                    },
                                    then: 100000
                                }
                            ],
                            default: 0
                        }
                    }
                }
            },

            {
                $sort: sort.monthlyMarketingBudget
                    ? { numericBudget: budgetSortOrder }
                    : sort
            },
            { $skip: startIndex },
            { $limit: limit }
        ]

        const leads = await Lead.aggregate(pipeline)
        const totalData = await Lead.countDocuments(filters)

        const sortedLeads = leads

        const allowedTiers: string[] = []

        if (roles.includes("leads-max") || roles.includes("admin")) {
            allowedTiers.push(
                "Under $1,000",
                "$1,000 - $5,000",
                "$5,000 - $10,000",
                "$10,000 - $50,000",
                "$50,000 - $100,000",
                "$100,000+"
            )
        } else if (roles.includes("leads-pro")) {
            allowedTiers.push(
                "Under $1,000",
                "$1,000 - $5,000",
                "$5,000 - $10,000",
                "$10,000 - $50,000"
            )
        } else if (roles.includes("leads")) {
            allowedTiers.push("Under $1,000", "$1,000 - $5,000")
        }

        return {
            leads: sortedLeads.map((lead) => {
                if (!allowedTiers.includes(lead.monthlyMarketingBudget)) {
                    return {
                        ...lead,
                        businessName: "<|UPGRADE|>",
                        businessWebsite: "<|UPGRADE|>",
                        businessEmail: "<|UPGRADE|>"
                    }
                }
                return lead
            }),
            totalData
        }
    } catch (error) {
        console.error("Error fetching leads", error)
        throw new Error("Error fetching leads")
    }
}

export const deleteLead = async (leadId: string): Promise<boolean> => {
    try {
        const result = await Lead.deleteOne({ _id: leadId })
        return result.deletedCount > 0
    } catch (error) {
        console.error("Error deleting lead", error)
        throw new Error("Error deleting lead")
    }
}
