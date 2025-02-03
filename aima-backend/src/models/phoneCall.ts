import mongoose, { Schema } from "mongoose"
import { IPhoneCall } from "../types/IPhoneCall"

const schema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        phoneNumber: {
            type: Schema.Types.ObjectId,
            ref: "PhoneNumber"
        },
        twilioSid: String,
        from: String,
        fromFormatted: String,
        to: String,
        toFormatted: String,
        duration: Number, // seconds
        startTime: Date,
        endTime: Date,
        recordingFile: {
            type: Schema.Types.ObjectId,
            ref: "File"
        },
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IPhoneCall>("PhoneCall", schema)
