import mongoose, { Schema } from "mongoose"
import { IPhoneNumber } from "../types/IPhoneNumber"

const schema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        twilioSid: String,
        title: String,
        number: String,
        numberFormatted: String,
        extensions: [{
            title: String,
            number: String
        }],
        record: Boolean,
        isGreetingAudio: Boolean,
        greetingAudio: String,
        greetingText: String,
        checkedAt: Date,
        releasedAt: Date
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IPhoneNumber>("PhoneNumber", schema)
