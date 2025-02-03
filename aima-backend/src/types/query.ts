export interface Query {
    professionHistory: string
    competencies: string
    negativeCompetencies: string
    hobbies: string
    previousAcquisitions: string
}
export interface SocrateLandQuery {
    property: string
    skills: string
    overall: string
    dislike: string
}

type ToneType = "Inspirational" | "Factual" | "Fun" | "Urgent" | "Fear-Based"
type UrgencyType = string
type FearType = string
type GoodHooksType = string
type TriggerWordsType = string
type InstructionsType = string
type BusinessDescriptionType = string
type LengthType = number
type ValenceType = boolean
type AggressivenessType = number

type PriceType = string
type TargetAudienceType = string
type ToneAdditionalInfo = string
type Emoji = boolean
type HookCreative = number
type PriceDrivenCheck = boolean
type RatedHooks = string
type DimensionsOfNeedType = string
type BenefitStackType = string
type LanguageType = string
type ColoursType = string
type HeroImageType = string
type HeroImageStyle = string
type AspectRatioType = string
type ScrollStopperType = boolean
type AdDescriptionType = string
export interface ArtisticConcept {
    [key: string]: boolean
}

export interface MarketingHooksInput {
    tone: ToneType
    urgency: UrgencyType
    fear: FearType
    goodHooks: GoodHooksType
    triggerWords: TriggerWordsType
    instructions: InstructionsType
    businessDescription: BusinessDescriptionType
    hookLength: LengthType
    valence: ValenceType
    aggressiveness: AggressivenessType
    priceDriven: PriceType
    targetAudience: TargetAudienceType
    toneAdditionalInfo: ToneAdditionalInfo
    emoji: Emoji
    hookCreative: HookCreative
    priceDrivenCheck: PriceDrivenCheck
    ratedHooks: RatedHooks
    language: LanguageType
}

export interface BenefitStackInput {
    businessDescription: BusinessDescriptionType
    tone: ToneType
    toneAdditionalInfo: ToneAdditionalInfo
    aggressiveness: AggressivenessType
    hookCreative: HookCreative
    priceDrivenCheck: PriceDrivenCheck
    priceDriven: PriceType
    targetAudience: TargetAudienceType
    dimensionsOfNeed: DimensionsOfNeedType
    instructions: InstructionsType
    ratedHooks: RatedHooks
    hookLength: LengthType
    language: LanguageType
}

export interface BonusStackInput {
    aggressiveness: AggressivenessType
    benefitStack: BenefitStackType
    businessDescription: BusinessDescriptionType
    hookCreative: HookCreative
    hookLength: LengthType
    language: LanguageType
    ratedHooks?: RatedHooks
    targetAudience: TargetAudienceType
    tone: ToneType
    toneAdditionalInfo: ToneAdditionalInfo
}

export interface FaqInput {
    aggressiveness: AggressivenessType
    benefitStack: BenefitStackType
    businessDescription: BusinessDescriptionType
    hookCreative: HookCreative
    hookLength: LengthType
    language: LanguageType
    ratedHooks?: RatedHooks
    targetAudience: TargetAudienceType
    tone: ToneType
    toneAdditionalInfo: ToneAdditionalInfo
}

export interface HeroInput {
    businessDescription: BusinessDescriptionType
    hookCreative: HookCreative
    targetAudience: TargetAudienceType
    tone: ToneType
    aggressiveness: AggressivenessType
    colours: ColoursType
    imageType: HeroImageType
    imageStyle: HeroImageStyle
    aspectRatio: AspectRatioType
    heroDescription: AdDescriptionType
    instructions: InstructionsType
    impacts: Array<ArtisticConcept>
    emotions: string
    isolation: string
}

export interface AdSocialImageInput {
    businessDescription: BusinessDescriptionType
    hookCreative: HookCreative
    targetAudience: TargetAudienceType
    tone: ToneType
    aggressiveness: AggressivenessType
    colours: ColoursType
    imageType: HeroImageType
    imageStyle: HeroImageStyle
    aspectRatio: AspectRatioType
    scrollStopper: ScrollStopperType
    adDescription: AdDescriptionType
    instructions: InstructionsType
    impacts: Array<ArtisticConcept>
    isolation: string
    campaignId: string
}

export interface SeoInput {
    aggressiveness: AggressivenessType
    businessDescription: BusinessDescriptionType
    hookCreative: HookCreative
    hookLength: LengthType
    language: LanguageType
    targetAudience: TargetAudienceType
    tone: ToneType
    toneAdditionalInfo: ToneAdditionalInfo
    targeting: number
    type?: string
}

export interface ProposalInput {
    businessName: string
    businessWebsite: string
    businessDescription?: string
}

export interface ProductInput {
    aggressiveness: AggressivenessType
    businessDescription: BusinessDescriptionType
    hookCreative: HookCreative
    hookLength: LengthType
    language: LanguageType
    targetAudience: TargetAudienceType
    tone: ToneType
    toneAdditionalInfo: ToneAdditionalInfo
    seoTags: string[]
    type?: string
}

export interface ImageIdeasInput {
    businessDescription: BusinessDescriptionType
}

export interface ImageToVideoInput {
    url: string
}

export interface ProductPlacementInput {
    url: string
    prompt: string
}

export interface AdditionalInputProperties {
    n?: number
    correlationId?: string
    [key: string]: any
}

export interface PageGeneratorInput {
    businessDescription: BusinessDescriptionType
}

export interface QuestionGeneratorInput {
    prompt: string
    question: string
    recommendText: string
}
