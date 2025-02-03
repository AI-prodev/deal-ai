import { Schema, Document } from "mongoose"

export interface IPageView extends Document {
    user:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    project:{
        type: Schema.Types.ObjectId,
        ref: "Project"
    },
    funnel:{
        type: Schema.Types.ObjectId,
        ref: "Funnel"
    },
    page: {
        type: Schema.Types.ObjectId,
        ref: "Page"
    },
    ipAddr?: string,
    createdAt: Date,
    updatedAt: Date
}
