import mongoose, { Schema } from "mongoose"

export interface IAcademy {
    title: string
    slug: string
    courses: Schema.Types.Mixed
    liveCalls: Schema.Types.Mixed
}

const AcademySchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            required: true
        },
        courses: {
            type: Schema.Types.Mixed,
            required: true
        },
        liveCalls: {
            type: Schema.Types.Mixed,
            required: true
        },
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IAcademy>("Academy", AcademySchema)
