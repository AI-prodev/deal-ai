export interface NewtonInput {
    businessName?: string
    entityName?: string
    entityType?: string
    businessDescription?: string
    includedAssets?: string
    ownershipStructure?: string
    ownerNamesAndPercentages?: string
    liabilities?: string
    knownLiabilities?: boolean
    purchaseType?: boolean
}
export interface NewtonLandInput {
    propertyName: string
    propertyDescription: string
    propertyType: string
    propertyAcres: string
}
