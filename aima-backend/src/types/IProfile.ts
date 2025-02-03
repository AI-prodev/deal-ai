import { Schema, Document } from "mongoose"

export interface IProfile extends Document {
    user: Schema.Types.ObjectId
    fields: Record<string, unknown>
    profileImage: Buffer
}

export interface IProfileResponse extends Omit<IProfile, "profileImage"> {
    profileImage?: string
}
