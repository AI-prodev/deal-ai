import mongoose from "mongoose"
import ImageCreationModel from "../models/imageCreation"

const upsertImageCreation = async (userId: string): Promise<void> => {
    try {
        await ImageCreationModel.updateOne(
            { userId: new mongoose.Types.ObjectId(userId) },
            { $push: { creationTimes: new Date() } },
            { upsert: true }
        )
    } catch (error) {
        console.error("Error in upserting image creation record: ", error)
        throw error
    }
}

const countImagesCreatedLastWeek = async (
    userId: string
): Promise<number> => {
    const oneWeekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)

    try {
        const result = await ImageCreationModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $unwind: "$creationTimes" },
            { $match: { creationTimes: { $gte: oneWeekAgo } } },
            { $count: "numberOfCreations" }
        ])

        return result.length > 0 ? result[0].numberOfCreations : 0
    } catch (error) {
        console.error("Error counting images created last week: ", error)
        throw error
    }
}

export {
    upsertImageCreation,
    countImagesCreatedLastWeek
}
