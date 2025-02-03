import { Document } from "mongoose"

export interface INote extends Document {
    data: string
    shareId: string
}
