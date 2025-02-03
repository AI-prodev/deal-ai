import mongoose from "mongoose"
import VideoCreationModel from "../models/videoCreation"

const upsertVideoCreation = async (userId: string): Promise<void> => {
    try {
        await VideoCreationModel.updateOne(
            { userId: new mongoose.Types.ObjectId(userId) },
            { $push: { creationTimes: new Date() } },
            { upsert: true }
        )
    } catch (error) {
        console.error("Error in upserting video creation record: ", error)
        throw error
    }
}

const countVideosCreatedLastWeek = async (
    userId: string
): Promise<number> => {
    const oneWeekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)

    try {
        const result = await VideoCreationModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $unwind: "$creationTimes" },
            { $match: { creationTimes: { $gte: oneWeekAgo } } },
            { $count: "numberOfCreations" }
        ])

        return result.length > 0 ? result[0].numberOfCreations : 0
    } catch (error) {
        console.error("Error counting videos created last week: ", error)
        throw error
    }
}

export {
    upsertVideoCreation,
    countVideosCreatedLastWeek
}
