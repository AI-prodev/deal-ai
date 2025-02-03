import express from "express"
import multer from "multer"
import { authenticate, hasRoles } from "../middlewares/auth"
import {
    createFunnel,
    createFunnelWithAI,
    deleteFunnel,
    getFunnel,
    getFunnelMenus,
    getNextPage,
    getProjectFunnels,
    updateFunnelDomain,
    updateFunnelWebhooks,
    updateFunnelSettings,
    updateFunnelSteps,
    updateFunnelMenu,
    updateFunnelTitle,
    cloneFunnel,
    importFunnel,
    updateFunnelFavicon,
    deleteFunnelFavicon,
    getFunnelViews,
    archiveFunnel,
    restoreFunnel
} from "../controllers/funnelController"

export const funnelRoutes = express.Router()

const FUNNEL_ROLES = ["admin", "user", "3dayfreetrial", "lite"]

const upload = multer({ dest: "uploads/" })

funnelRoutes.post(
    "/funnels",
    authenticate,
    hasRoles(FUNNEL_ROLES),
    createFunnel
)

funnelRoutes.post(
    "/funnels-with-ai",
    authenticate,
    hasRoles(FUNNEL_ROLES),
    createFunnelWithAI
)

funnelRoutes.post("/funnels/nextPage", getNextPage)

funnelRoutes.post("/funnels/clone", authenticate, cloneFunnel)

funnelRoutes.post("/funnels/import", authenticate, importFunnel)

funnelRoutes.get("/funnels/:funnelId", authenticate, getFunnel)

funnelRoutes.get("/funnels/:funnelId/menus", getFunnelMenus)

funnelRoutes.get("/funnels/:projectId/project", authenticate, getProjectFunnels)

funnelRoutes.delete("/funnels/:funnelId", authenticate, deleteFunnel)

funnelRoutes.patch("/funnels/:funnelId/archive", authenticate, archiveFunnel)

funnelRoutes.patch("/funnels/:funnelId/restore", authenticate, restoreFunnel)

funnelRoutes.patch(
    "/funnels/:funnelId/domain",
    authenticate,
    hasRoles(FUNNEL_ROLES),
    updateFunnelDomain
)

funnelRoutes.patch(
    "/funnels/:funnelId/webhook",
    authenticate,
    hasRoles(["admin", "user", "3dayfreetrial"]),
    updateFunnelWebhooks
)

funnelRoutes.patch(
    "/funnels/:funnelId/settings",
    authenticate,
    hasRoles(FUNNEL_ROLES),
    updateFunnelSettings
)

funnelRoutes.patch(
    "/funnels/:funnelId/title",
    authenticate,
    hasRoles(FUNNEL_ROLES),
    updateFunnelTitle
)

funnelRoutes.patch(
    "/funnels/:funnelId/reorder",
    authenticate,
    hasRoles(FUNNEL_ROLES),
    updateFunnelSteps
)

funnelRoutes.patch(
    "/funnels/:funnelId/menu",
    authenticate,
    hasRoles(FUNNEL_ROLES),
    updateFunnelMenu,
)

funnelRoutes.patch(
    "/funnels/:funnelId/favicon", 
    authenticate, 
    hasRoles(FUNNEL_ROLES), 
    upload.single("file"),
    updateFunnelFavicon
)

funnelRoutes.delete(
    "/funnels/:funnelId/favicon", 
    authenticate, 
    hasRoles(FUNNEL_ROLES), 
    deleteFunnelFavicon
)

funnelRoutes.get(
    "/funnels/:funnelId/stats",
    authenticate,
    hasRoles(FUNNEL_ROLES),
    // paginateAndFilter(FunnelModel, undefined, "_id", true),
    getFunnelViews
)