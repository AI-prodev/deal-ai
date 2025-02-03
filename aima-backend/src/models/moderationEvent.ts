import mongoose, { Schema } from "mongoose"
import { IModerationEvent } from "../types/IModerationEvent"

const ModerationEventSchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        input: String,
        flags: {
            type: Schema.Types.Mixed
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IModerationEvent>(
    "ModerationEvent",
    ModerationEventSchema,
    "moderationevents"
)
