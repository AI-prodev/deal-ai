import { Schema, Document } from "mongoose"

export interface IPhoneExtension extends Document {
    title: string;
    number: string;
}

export interface IPhoneNumber extends Document {
    user: Schema.Types.ObjectId;
    twilioSid: string;
    title: string;
    number: string;
    numberFormatted: string;
    extensions: IPhoneExtension[];
    record: boolean;
    isGreetingAudio: boolean;
    greetingAudio: string;
    greetingText: string;
    checkedAt: Date;
    releasedAt: Date;
}

