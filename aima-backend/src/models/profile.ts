import mongoose, { Schema } from "mongoose"
import { IProfile } from "../types/IProfile"

const ProfileSchema: Schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    fields: {
        type: Schema.Types.Mixed
    },
    profileImage: {
        type: Buffer
    }
})

export default mongoose.model<IProfile>("Profile", ProfileSchema)
