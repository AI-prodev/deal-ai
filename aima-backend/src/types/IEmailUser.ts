import { Schema, Document } from "mongoose"

export interface IEmailUser extends Document {
    user: Schema.Types.ObjectId;
    domain: Schema.Types.ObjectId;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

