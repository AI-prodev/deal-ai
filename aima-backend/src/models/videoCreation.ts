import mongoose from "mongoose"
import { IVideoCreation } from "../types/IVideoCreation"

export const VideoCreationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    creationTimes: [{ type: Date, required: true }]
})

export const VideoCreationModel: mongoose.Model<IVideoCreation> =
    mongoose.model("VideoCreation", VideoCreationSchema, "videocreations")

export default VideoCreationModel
