import { NextFunction, Request, Response } from "express"
import UpdateStats, { IUpdateStats } from "../models/Stats"

export const checkApiStatsKey = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const providedApiKey = req.header("UPDATE-STATS-KEY")
    const storedApiKey = process.env.UPDATE_STATS_KEY

    if (providedApiKey && providedApiKey === storedApiKey) {
        next()
    } else {
        res.status(403).json({ error: "Invalid API Key" })
    }
}

export const updateLastUpdated = async (req: Request, res: Response) => {
    const businessesLastUpdated = Number(req.params.businessesLastUpdated)
    const landLastUpdated = Number(req.params.landLastUpdated)

    if (!businessesLastUpdated || !landLastUpdated) {
        return res.status(400).send({ error: "Invalid timestamps provided." })
    }

    try {
        const existingRecord = await UpdateStats.findOne()

        if (existingRecord) {
            existingRecord.businessesLastUpdated = businessesLastUpdated
            existingRecord.landLastUpdated = landLastUpdated
            await existingRecord.save()
        } else {
            const newUpdateTime: IUpdateStats = new UpdateStats({
                businessesVectorCount: 0,
                landVectorCount: 0,
                businessesLastUpdated,
                landLastUpdated
            })

            await newUpdateTime.save()
        }

        return res.send({
            message: "Last updated times recorded successfully."
        })
    } catch (error) {
        return res.status(500).send({ error: "Server error." })
    }
}

export const updateStats = async (req: Request, res: Response) => {
    const businessesVectorCount = Number(req.params.businessesVectorCount)
    const landVectorCount = Number(req.params.landVectorCount)

    // Validation
    if (!businessesVectorCount || !landVectorCount) {
        return res.status(400).send({ error: "Invalid stats provided." })
    }

    try {
        const existingRecord = await UpdateStats.findOne()

        if (existingRecord) {
            existingRecord.businessesVectorCount = businessesVectorCount
            existingRecord.landVectorCount = landVectorCount
            await existingRecord.save()
        } else {
            const newUpdateTime: IUpdateStats = new UpdateStats({
                businessesVectorCount,
                landVectorCount,
                businessesLastUpdated: 0,
                landLastUpdated: 0
            })

            await newUpdateTime.save()
        }

        return res.send({ message: "Stats updated successfully." })
    } catch (error) {
        return res.status(500).send({ error: "Server error." })
    }
}

export const getStats = async (req: Request, res: Response) => {
    try {
        const existingRecord = await UpdateStats.findOne()

        if (!existingRecord) {
            return res.status(404).json({
                error: "No stats available. Please ensure stats have been initialized."
            })
        }

        if (
            !existingRecord.businessesVectorCount ||
            !existingRecord.landVectorCount
        ) {
            return res.status(404).json({
                error: "Incomplete stats. Vector counts for businesses or land are missing.",
                businessesVectorCount:
                    existingRecord.businessesVectorCount || "Not Set",
                landVectorCount: existingRecord.landVectorCount || "Not Set",
                businessesLastUpdated:
                    existingRecord.businessesLastUpdated || "Not Set",
                landLastUpdated: existingRecord.landLastUpdated || "Not Set"
            })
        }

        return res.json({
            businessesVectorCount: existingRecord.businessesVectorCount,
            landVectorCount: existingRecord.landVectorCount,
            businessesLastUpdated: existingRecord.businessesLastUpdated,
            landLastUpdated: existingRecord.landLastUpdated
        })
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(400).json({
                error: "Invalid Object ID format."
            })
        }

        console.error("Internal server error:", error)
        return res.status(500).json({
            error: "Internal server error. Please contact the system administrator."
        })
    }
}
