import mongoose from "mongoose"
import { IApp } from "../types/IApp"

export const AppSchema = new mongoose.Schema<IApp>(
    {
        roles: [String],
        link: String,
        title: String,
        description: String,
        isUnreleased: Boolean,
        isForced: Boolean,
        isDefault: Boolean,
        ordering: Number,
        icon: String,
        isFullIcon: Boolean,
        gradient: String
    },
    {
        timestamps: true
    }
)


export const AppModel: mongoose.Model<IApp> = mongoose.model(
    "App",
    AppSchema
)

export default AppModel
