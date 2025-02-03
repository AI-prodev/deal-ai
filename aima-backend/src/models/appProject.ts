import mongoose, { Document, Schema, Types } from "mongoose"

interface IGeneration {
    generationNumber: number
    contentItemsId?: Types.ObjectId
    creations?: Types.ObjectId[]
    contentItems?: IContentItem[]
}

interface IApps {
    appName: string
    generations?: IGeneration[]
    formValues?: Schema.Types.Mixed
}

interface IContentItem {
    name: string
    contentId: Types.ObjectId | string
}
export interface IAppsProject extends Document {
    name: string
    user: Types.ObjectId
    applications: IApps[]
    sharedFormValues?: Schema.Types.Mixed
    createdAt: Date
    updatedAt: Date
}

const ContentItemSchema = new Schema<IContentItem>({
    name: { type: String, required: true },
    contentId: [{ type: Schema.Types.ObjectId, ref: "Creation" }]
})

const GenerationSchema = new Schema<IGeneration>({
    generationNumber: { type: Number, required: true },
    contentItemsId: {
        type: Schema.Types.ObjectId,
        ref: "Creation",
        required: false
    },
    creations: [{ type: Schema.Types.ObjectId, ref: "Creation" }],
    contentItems: [ContentItemSchema]
})

const ApplicationSchema = new Schema<IApps>({
    appName: { type: String, required: true },
    generations: [GenerationSchema],
    formValues: { type: Schema.Types.Mixed }
})

const AppsProjectSchema = new Schema<IAppsProject>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        applications: [ApplicationSchema],
        sharedFormValues: { type: Schema.Types.Mixed },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
)

const AppsProject = mongoose.model<IAppsProject>(
    "AppsProject",
    AppsProjectSchema
)

export default AppsProject
