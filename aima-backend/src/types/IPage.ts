import { Schema, Document } from "mongoose"

interface ProductItem {
    priceId: string;
    productId: string;
    accountId: string;
    type: "one_time" | "recurring"

}

export interface IPage extends Document {
    user?: Schema.Types.ObjectId,
    project?: Schema.Types.ObjectId,
    funnel?: Schema.Types.ObjectId,
    funnelStep?: number,
    contentUrl?: string,
    jsonUrl?: string,
    thumbnailUrl?: string,
    path?: string,
    title?: string,
    input: Record<string, unknown>,
    fields?: Record<string, unknown>,
    extraHead?: string,
    extraBody?: string,
    products: ProductItem[],
    versions?: [{
        _id?: Schema.Types.ObjectId,
        contentUrl?: string,
        jsonUrl?: string,
        thumbnailUrl?: string,
        extraHead?: string,
        extraBody?: string,
        updatedAt?: Date
    }],
    updatedAt: Date
}
