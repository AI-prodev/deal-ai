import { Schema, Document } from "mongoose"

export enum FunnelType {
    ULTRA_FAST_FUNNEL = "ULTRA_FAST_FUNNEL",
    ULTRA_FAST_WEBSITE = "ULTRA_FAST_WEBSITE",
    EASY_WEBSITES = "EASY_WEBSITES",
    SMART_WEBSITES = "SMART_WEBSITES",
    SIMPLE_WEBSITES = "SIMPLE_WEBSITES",
}

interface FunnelSettings {
    tone: string
    toneAdditionalInfo: string
    aggressiveness: number
    hookCreative: number
    targetAudience: string
}

interface FunnelPrompt {
    input: {
        businessName: string,
        businessDescription: string,
    },
    magic: string[],
    benefitStack: Array<{ a: string, n: string }>,
    faq: Array<{ a: string, q: string }>,
    hero: Array<{ prompt: string, url: string }>,
    bonus: Array<{ b: string, r: string }>,
    businessDesc: string[],
}

export interface IFunnel extends Document {
    user: Schema.Types.ObjectId
    project: Schema.Types.ObjectId
    domain: Schema.Types.ObjectId
    title: string
    numSteps: number
    settings: FunnelSettings
    webhooks: string[]
    type: FunnelType
    faviconUrl: string
    archivedAt?: Date
    menu: Schema.Types.ObjectId[]
    prompt?: FunnelPrompt
}
