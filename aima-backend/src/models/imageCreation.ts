import mongoose from "mongoose"
import { IImageCreation } from "../types/IImageCreation"

export const ImageCreationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    creationTimes: [{ type: Date, required: true }]
})

export const ImageCreationModel: mongoose.Model<IImageCreation> =
    mongoose.model("ImageCreation", ImageCreationSchema, "imagecreations")

export default ImageCreationModel
