import { Schema, Document } from "mongoose"

export interface IDomain extends Document {
    user: Schema.Types.ObjectId
    domain: string
    external: boolean
    subscriptionId: string
}
