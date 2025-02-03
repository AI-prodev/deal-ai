import { Schema, Document } from "mongoose"

export interface IWebhook extends Document {
    user?: Schema.Types.ObjectId,
    project?: Schema.Types.ObjectId,
    funnel?: Schema.Types.ObjectId,
    page?: Schema.Types.ObjectId,
    contact?: Schema.Types.ObjectId,
    
    url?: string,
    payload?: Schema.Types.Mixed,

    status: number,
    succeeded: Date,
    failed: Date,
}
