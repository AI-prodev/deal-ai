import { Schema, Document } from "mongoose"

export interface IPhoneCall extends Document {
    user: Schema.Types.ObjectId;
    phoneNumber: Schema.Types.ObjectId;
		twilioSid: string;
    from: string;
    fromFormatted: string;
    to: string;
    toFormatted: string;
    duration?: number; // seconds
    startTime: Date;
    endTime?: Date;
    recordingFile?: Schema.Types.ObjectId;
    createdAt: string;
}

