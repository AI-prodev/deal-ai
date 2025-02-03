import mongoose, { Schema } from "mongoose"
import Creation, { ICreation } from "../models/creation"
import { IUser } from "../types/IUser"
import { Request, Response } from "express"

const addCreations = async (
    userId: IUser["_id"],
    type: string,
    input: Schema.Types.Mixed,
    outputs: Schema.Types.Mixed[]
): Promise<ICreation[]> => {
    const creations: ICreation[] = outputs.map((output) => ({
        type,
        user: userId,
        input,
        output
    }))

    return Creation.create(creations)
}

const rateCreation = async (
    creationId: string,
    rating: number,
    userId: IUser["_id"],
    res: Response
) => {
    if (!mongoose.Types.ObjectId.isValid(creationId)) {
        res.status(400).json({ error: "Invalid creationId provided" })
        return
    }

    let creation
    try {
        creation = await Creation.findById(creationId)
    } catch (error) {
        res.status(500).json({ error: "Error fetching creation" })
        return
    }

    if (!creation) {
        res.status(404).json({ error: "Creation not found" })
        return
    }

    if (creation.user.toString() !== userId.toString()) {
        res.status(403).json({ error: "Unauthorized to rate this creation" })
        return
    }

    creation.rating = rating

    try {
        const savedCreation = await creation.save()
        res.json({
            message: "Rating updated successfully",
            data: savedCreation
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error updating rating" })
    }
}
export default {
    addCreations,
    rateCreation
}
