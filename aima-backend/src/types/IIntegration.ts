import { Document, Schema } from "mongoose"

export interface IIntegration extends Document {
    user: string;
    type: string;
    data?: any;
}
