import mongoose, { Schema, Types } from "mongoose"
import { IUser } from "../types/IUser"

export interface IFavorite {
    type: string
    data: Schema.Types.Mixed
    user: IUser["_id"]
}

const FavoriteSchema: Schema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ["socrates", "socrates-land", "apollo", "apollo-land"]
    },
    data: {
        type: Schema.Types.Mixed,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})

export default mongoose.model<IFavorite>("Favorite", FavoriteSchema)
