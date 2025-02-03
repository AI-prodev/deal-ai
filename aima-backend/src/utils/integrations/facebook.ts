/* eslint-disable @typescript-eslint/no-explicit-any */
"use strict"

import {
    FacebookAdsApi,
    AdAccount,
    Campaign as CampaignApi,
    AdSet as FBAdSet,
    Ad
} from "facebook-nodejs-business-sdk"

const uploadImageFromUrl = async (
    accID: string,
    imageUrl: string
): Promise<string> => {
    try {
        // Download the image content
        const response = await fetch(imageUrl)

        if (!response.ok) {
            throw new Error(`Failed to fetch image. Status: ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const imageBuffer = Buffer.from(arrayBuffer)

        // Convert image content to base64
        const base64Content = imageBuffer.toString("base64")

        // Create ad image using AdAccount and upload the image
        const adImage = await new AdAccount(accID).createAdImage([], {
            bytes: base64Content
        })

        // adImage now contains the response from the API

        // Print the entire adImage response
        console.log("Ad Image created:", adImage)

        // To obtain the image hash, access the hash property within _data
        const imageHash = adImage._data.images.bytes.hash

        return imageHash
    } catch (error) {
        console.error("Error uploading image:", error.message)
        throw error
    }
}

interface Campaign {
    _data: any
    adAccountId: string
    name: string
    objective: string
    accessToken: string
    success: boolean
    message: string
    // Define the properties of your Campaign interface here
}

interface AdSet {
    id: string
    account_id: string
    campaign_id: string
    name: string
    status: string
    targeting: any // Adjust based on the actual structure
    daily_budget: number
    lifetime_budget: number
    billing_event: string
    optimization_goal: string
    start_time: string // UTC time format
    end_time: string // UTC time format
    created_time: string // UTC time format
    updated_time: string // UTC time format
    success: boolean
    message: string
    _data: unknown

    // Add more properties as needed
}

interface AdSetResult {
    success: boolean
    message: string
    _data: any
}

interface DeleteResult {
    success: boolean
    message?: string
}

const initFacebookApi = (access_token: string) => {
    const api = FacebookAdsApi.init(access_token)
    const showDebugingInfo = true

    if (showDebugingInfo) {
        api.setDebug(true)
    }

    return api
}

export const createCampaignAtMeta = async (
    accessToken: string,
    adAccountId: string,
    name: string,
    objective: string
): Promise<Campaign | { success: false; message: string; _data: object }> => {
    const fb = initFacebookApi(accessToken)

    const params = {
        name: name,
        objective: objective,
        status: "ACTIVE",
        special_ad_categories: [] as any[] // Assuming this is an array type
    }

    try {
        if (fb) {
            const campaign = await new AdAccount(adAccountId).createCampaign(
                [],
                params
            )

            // Assuming campaign is of type Campaign, if not, adjust accordingly

            return {
                success: false,
                message: "Campaign created",
                _data: campaign as unknown as Campaign
            }
        }
    } catch (error) {
        if (
            error.response?.error_user_title &&
            error.response?.error_user_msg
        ) {
            return {
                success: false,
                message:
                    error.response?.error_user_title +
                    ". " +
                    error.response?.error_user_msg,
                _data: []
            }
        } else {
            return {
                success: false,
                message: error?.response?.message,
                _data: []
            }
        }
    }
}

export const deleteCampaignAtMeta = async (
    accessToken: string,
    campaignId: string
): Promise<DeleteResult> => {
    const fb = initFacebookApi(accessToken)

    try {
        if (fb) {
            const campaign = new CampaignApi(campaignId)
            campaign.delete([])
            return { success: true, message: "Campaign deleted successfully." }
        }
    } catch (error) {
        console.error("Error deleting campaign:", error)
        // If the deletion fails, return an error message
        return { success: false, message: "Error deleting campaign." }
    }
}

export const createAdSetAtMeta = async (
    accessToken: string,
    adAccountId: string,
    campaignId: string,
    name: string,
    targeting: any, // Assuming targeting is an object, adjust accordingly
    lifetimeBudget: number,
    billingEvent: string,
    optimizationGoal: string
): Promise<
    AdSetResult | { success: false; message: string; _data: object }
> => {
    const fb = initFacebookApi(accessToken)

    const metaTargeting = {
        age_min: targeting.minAge, // Assuming age_min is 5 years below the specified age
        age_max: targeting.maxAge, // Assuming age_max is 5 years above the specified age
        genders:
            targeting.gender === "both"
                ? [1, 2]
                : [targeting.gender === "male" ? 1 : 2],
        geo_locations: {
            countries: [targeting.country]
        }
    }

    const params = {
        name: name,
        campaign_id: campaignId,
        targeting: metaTargeting,
        daily_budget: lifetimeBudget,
        billing_event: billingEvent,
        optimization_goal: optimizationGoal,
        status: "PAUSED",
        bid_strategy: "LOWEST_COST_WITHOUT_CAP" // Set bid strategy to 'LOWEST_COST_WITHOUT_CAP'
    }

    try {
        if (fb) {
            const adSet = await new AdAccount(adAccountId).createAdSet(
                [],
                params
            )

            return {
                success: true,
                message: "Ad Set created",
                _data: adSet as unknown as AdSetResult
            }
        }
    } catch (error) {
        return {
            success: false,
            message:
                error.response?.error_user_title +
                ". " +
                error.response?.error_user_msg,
            _data: []
        }
    }
}

export const updateAdSetAtMeta = async (
    accessToken: string,
    adSetId: string,
    targeting: any,
    lifetimeBudget: number,
    billingEvent: string,
    optimizationGoal: string
): Promise<
    AdSetResult | { success: false; message: string; _data: object }
> => {
    const fb = initFacebookApi(accessToken)

    const metaTargeting = {
        age_min: targeting.minAge,
        age_max: targeting.maxAge,
        genders:
            targeting.gender === "both"
                ? [1, 2]
                : [targeting.gender === "male" ? 1 : 2],
        geo_locations: {
            countries: [targeting.country]
        }
    }

    const params = {
        targeting: metaTargeting,
        daily_budget: lifetimeBudget,
        billing_event: billingEvent,
        optimization_goal: optimizationGoal,
        status: "ACTIVE",
        bid_strategy: "LOWEST_COST_WITHOUT_CAP"
    }

    try {
        if (fb) {
            const adSet = await new FBAdSet(adSetId).update([], params)

            return {
                success: true,
                message: "Ad Set updated",
                _data: adSet as unknown as AdSetResult
            }
        }
    } catch (error) {
        return {
            success: false,
            message:
                error.response?.error_user_title +
                ". " +
                error.response?.error_user_msg,
            _data: []
        }
    }
}

export const activeAdSetAtMeta = async (
    accessToken: string,
    adSetId: string
): Promise<
    AdSetResult | { success: false; message: string; _data: object }
> => {
    const fb = initFacebookApi(accessToken)

    const params = {
        status: "ACTIVE"
    }

    try {
        if (fb) {
            const adSet = await new FBAdSet(adSetId).update([], params)

            return {
                success: true,
                message: "Ad Set updated",
                _data: adSet as unknown as AdSetResult
            }
        }
    } catch (error) {
        return {
            success: false,
            message:
                error.response?.error_user_title +
                ". " +
                error.response?.error_user_msg,
            _data: []
        }
    }
}

export const getAdSetsFromMeta = async (
    accessToken: string,
    campaignId: string
): Promise<{ success: boolean; message: string; _data: any }> => {
    const fb = initFacebookApi(accessToken)

    try {
        if (fb) {
            const adSets = await new AdAccount(campaignId) // Use campaignId here
                .getAdSets([], {
                    fields: [
                        "id",
                        "name",
                        "status",
                        "targeting",
                        "lifetime_budget",
                        "billing_event",
                        "optimization_goal",
                        "start_time",
                        "end_time"
                    ]
                })

            const formattedAdSets = adSets.map((adSet) => ({
                id: adSet.id,
                name: adSet.name,
                status: adSet.status,
                targeting: adSet.targeting,
                dailyBudget: adSet.daily_budget,
                billingEvent: adSet.billing_event,
                optimizationGoal: adSet.optimization_goal,
                startTime: adSet.start_time,
                endTime: adSet.end_time
            }))

            return {
                success: true,
                message: "Ad Sets retrieved",
                _data: formattedAdSets as unknown as AdSet
            }
        }
    } catch (error) {
        return {
            success: false,
            message:
                error.response?.error_user_title +
                ". " +
                error.response?.error_user_msg,
            _data: []
        }
    }
}

export const getAdSetFromMeta = async (
    accessToken: string,
    adSetId: string
): Promise<{ success: boolean; message: string; _data: any }> => {
    const fb = initFacebookApi(accessToken)

    try {
        if (fb) {
            const adSet = await new FBAdSet(adSetId, []).get([
                "id",
                "name",
                "status",
                "targeting",
                "daily_budget",
                "billing_event",
                "optimization_goal",
                "start_time",
                "end_time"
            ])

            const ads = await adSet.getAds(["id", "name", "status"], {})

            if (ads && ads.length > 0) {
                return {
                    success: true,
                    message: "Ad Set retrieved",
                    _data: {
                        adSet: adSet as unknown as AdSet,
                        ads: ads
                    }
                }
            } else {
                return {
                    success: true,
                    message: "Ad Set retrieved, but no ads found",
                    _data: {
                        adSet: adSet as unknown as AdSet,
                        ads: []
                    }
                }
            }
        }
    } catch (error) {
        return {
            success: false,
            message:
                error.response?.error_user_title +
                ". " +
                error.response?.error_user_msg,
            _data: null
        }
    }
}

export const createAdAtMeta = async (
    accessToken: string,
    adAccountId: string,
    adSetId: string,
    pageId: string,
    name: string,
    image_url: string,
    headline: string,
    link_url: string
): Promise<
    AdSetResult | { success: false; message: string; _data: object }
> => {
    const fb = initFacebookApi(accessToken)

    // Use await to get the imageHash from uploadImageFromUrl
    const imageHash = await uploadImageFromUrl(adAccountId, image_url)

    const adCreativeParams = {
        name: name,

        object_story_spec: {
            page_id: pageId,
            link_data: {
                image_hash: imageHash,
                message: headline,
                link: link_url
            }
        },
        degrees_of_freedom_spec: {
            creative_features_spec: {
                standard_enhancements: {
                    enroll_status: "OPT_IN"
                }
            }
        }
    }

    const adSetParams = {
        adset_id: adSetId,
        name: name,
        creative: adCreativeParams,
        status: "ACTIVE",
        id: adAccountId
    }

    try {
        if (fb) {
            const ad = await new AdAccount(adAccountId).createAd(
                [],
                adSetParams
            )

            return {
                success: true,
                message: "Ad created",
                _data: ad as unknown as AdSetResult
            }
        }
    } catch (error) {
        return {
            success: false,
            message:
                error.response?.error_user_title +
                ". " +
                error.response?.error_user_msg,
            _data: []
        }
    }
}

export const updateAdAtMeta = async (
    accessToken: string,
    adId: string,
    newStatus: string
): Promise<{ success: boolean; message: string }> => {
    const fb = initFacebookApi(accessToken)

    const adParams = {
        id: adId,
        status: newStatus
    }

    try {
        if (fb) {
            // Update ad status using Facebook Marketing API
            await new Ad(adId).update([], adParams)

            return {
                success: true,
                message: `Ad status updated to ${newStatus}`
            }
        }
    } catch (error) {
        console.error("===========error=========>", error)
        return {
            success: false,
            message:
                error.response?.error_user_title +
                ". " +
                error.response?.error_user_msg
        }
    }
}

export const getAdInsights = async (
    accessToken: string,
    adId: string
): Promise<{ success: boolean; data?: object; error?: string }> => {
    const fb = initFacebookApi(accessToken)

    try {
        if (fb) {
            const insightsFields = ["impressions", "clicks", "spend"] // Add more fields as needed

            // Initialize the Facebook API

            const ad = new Ad(adId)

            // Define the fields you want to retrieve for ad insights
            const fields = insightsFields.join(",")

            // Get ad insights
            const insights = await ad.getInsights([], { fields })

            // Return the successful response with data
            return {
                success: true,
                data: insights as unknown as AdSetResult
            }
        }
    } catch (error) {
        // Handle errors
        console.error("Error fetching ad insights:", error)

        return {
            success: false,
            error: error.message || "Failed to fetch ad insights."
        }
    }
}

export const getBusinessesFromMeta = async (accessToken: string) => {
    try {
        const response = await fetch(
            "https://graph.facebook.com/v18.0/me/businesses" +
                "?fields=id,name,primary_page" +
                "&access_token=" +
                accessToken
        )

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(
                errorData.error.message || "Error retrieving businesses"
            )
        }

        const responseData = await response.json()
        const formattedBusinesses = responseData.data.map(
            (business: { id: any; name: any }) => ({
                id: business.id,
                name: business.name
                // Add mapping for additional fields
            })
        )

        return {
            success: true,
            message: "Businesses retrieved",
            _data: formattedBusinesses
        }
    } catch (error) {
        console.log("===========error=========>", error)
        return {
            success: false,
            message: error.message
        }
    }
}
