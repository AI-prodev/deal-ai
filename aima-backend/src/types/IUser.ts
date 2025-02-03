import { Schema, Document } from "mongoose"
import { BusinessInformationRequestInterface } from "./businessInformationTypes"
export interface IUser extends Document {
    firstName?: string
    lastName?: string
    preferredName?: string
    email?: string
    password?: string
    lastLoginDate?: Date
    lastLoginIpAddress?: string
    roles?: string[]
    store?: {
        storeId: string
        domain: string
    }[]
    status?: "active" | "suspended" | "nosub"
    biRequests?: BusinessInformationRequestInterface[]
    passwordResetToken?: string
    passwordResetExpires?: number
    expiryDate?: Date
    apiKey?: string
    csrfToken?: string
    apps: Schema.Types.ObjectId[]
    emailFreeQuota?: number
    emailPaidQuota?: number
    emailSubscriptionId?: string
    phoneFreeQuota?: number
    phonePaidQuota?: number
    phoneSubscriptionId?: string
    phoneSubscriptionInvalidAt?: Date
    phoneSubscriptionWarnedAt?: Date
    fileCount?: number
    fileSize?: number
    fileDownloadSize?: number
    businessName?: string
    businessAddress?: Record<string, any>
    assistKey?: string
}

export interface IPayload {
    id: string
    email: string
    iat: number
    exp: number
}
