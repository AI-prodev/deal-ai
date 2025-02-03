import express from "express"
import { authenticate, hasRoles } from "../middlewares/auth"
import {
    createCampaign,
    deleteCampaign,
    getUserCampaigns,
    getCampaign,
    updateCampaign,
    createCampaignAsset,
    getCampaignAsset,
    getCampaignAssets,
    updateCampaignAsset,
    deleteCampaignAsset,
    updateCampaignAutopilot
} from "../controllers/campaignController"

export const campaignRoutes = express.Router()

campaignRoutes.post(
    "/campaigns",
    authenticate,
    hasRoles(["admin", "user", "3dayfreetrial"]),
    createCampaign
)

campaignRoutes.get(
    "/campaigns/me",
    authenticate,
    hasRoles(["admin", "user", "3dayfreetrial"]),
    getUserCampaigns
)

campaignRoutes.get(
    "/campaigns/:campaignId",
    authenticate,
    hasRoles(["admin", "user", "3dayfreetrial"]),
    getCampaign
)
campaignRoutes.put("/campaigns/:campaignId", authenticate, updateCampaign)

campaignRoutes.patch(
    "/campaigns/:campaignId",
    authenticate,
    updateCampaignAutopilot
)

campaignRoutes.delete(
    "/campaigns/:campaignId",
    authenticate,
    hasRoles(["admin", "user", "3dayfreetrial"]),
    deleteCampaign
)

// Campaign Asset routes
campaignRoutes.post(
    "/campaign-assets",
    authenticate,
    hasRoles(["admin", "user", "3dayfreetrial"]),
    createCampaignAsset
)

campaignRoutes.get("/campaign-assets/:assetId", authenticate, getCampaignAsset)

campaignRoutes.get(
    "/campaigns/:campaignId/assets",
    authenticate,
    getCampaignAssets
)

campaignRoutes.put(
    "/campaign-assets/:assetId",
    authenticate,
    updateCampaignAsset
)

campaignRoutes.delete(
    "/campaign-assets/:assetId",
    authenticate,
    deleteCampaignAsset
)
