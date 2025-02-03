export interface Recommendation {
    thesis: string
    business: string
    me: string
    trends: string
}
export interface LandRecommandation {
    thesis: string
    me: string
    trends: string
    acres: string
    askingPrice: string
    location: string
    about: string
    business: string
}

export interface Thesis {
    thesis: string
    me: string
    trends: string
}

export interface FilteredThesis {
    thesis: string
    me: string
    trends: string
    minAskingPrice: number
    maxAskingPrice: number
    countries: []
    states: []
}
