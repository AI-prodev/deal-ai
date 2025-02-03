import express from "express"
import { thesesRoutes } from "./theses"
import { apolloRoutes } from "./apolloRoutes"
import { authRoutes } from "./auth"
import { userRoute } from "./user"
import { newTonRoutes } from "./newTonRoutes"
import { adminRoutes } from "./admin"
import { socratesRoutes } from "./socratesRoutes"
import { apolloLandRoutes } from "./apolloLandRoutes"
import { SellerRoutes } from "./seller"
import { newTonLandRoutes } from "./newTonLandRoutes"
import { updateStatsRoutes } from "./updateStatsRoutes"
import { marketingRoutes } from "./marketing/marketingRoutes"
import { projectRoutes } from "./project"
import { funnelRoutes } from "./funnel"
import { contactRoutes } from "./contact"
import { pageRoutes } from "./page"
import { domainRoutes } from "./domain"
import { campaignRoutes } from "./campaign"
import { academyRoutes } from "./academy"
import { shareRoutes } from "./share"
import { publicApiRoutes } from "./publicApi"
import { accountRoutes } from "./account"
import { businessRoute } from "./business"
import { roundRoute } from "./round"
import { appsProjectRoutes } from "./marketing/appsProjectRoutes"
import { sectionRoutes } from "./section"
import { aiEditorRoutes } from "./ai-editor/aiEditorRoutes"
import { listRouter } from "./list"
import { integrationRoutes } from "./integration"
import { broadcastEmailRoutes } from "./broadcastEmail"
import { appRoutes } from "./app"
import { blogRoutes } from "./blog"
import { blogPostRoutes } from "./blogPost"
import { uploadRoutes } from "./upload"
import { noteRoutes } from "./note"
import { fileRoutes } from "./file"
import { assistRoutes } from "./assistRoutes"
import { phoneRoutes } from "./phone"
import { proposalRoutes } from "./proposal"
import { emailUserRoutes } from "./emailUser"
import puckEditorRoutes from "./puckEditor"
import { assistSettingsRoutes } from "./assistSettingsRoutes"

const apiRoutes = express.Router()

const defaultRoutes = [
    {
        path: "/auth",
        route: authRoutes
    },
    {
        path: "/list",
        route: listRouter
    },
    {
        path: "/user",
        route: userRoute
    },
    {
        path: "/admin",
        route: adminRoutes
    },
    {
        path: "/seller",
        route: SellerRoutes
    },
    {
        path: "/broadcast-email",
        route: broadcastEmailRoutes
    },
    {
        path: "/puck-editor",
        route: puckEditorRoutes
    },
    {
        path: "/",
        route: thesesRoutes
    },
    {
        path: "/",
        route: socratesRoutes
    },
    {
        path: "/",
        route: apolloRoutes
    },
    {
        path: "/",
        route: newTonRoutes
    },
    {
        path: "/",
        route: newTonLandRoutes
    },
    {
        path: "/",
        route: apolloLandRoutes
    },
    {
        path: "/",
        route: updateStatsRoutes
    },
    {
        path: "/",
        route: marketingRoutes
    },
    {
        path: "/",
        route: projectRoutes
    },
    {
        path: "/",
        route: funnelRoutes
    },
    {
        path: "/",
        route: sectionRoutes
    },
    {
        path: "/",
        route: contactRoutes
    },
    {
        path: "/",
        route: pageRoutes
    },
    {
        path: "/",
        route: domainRoutes
    },
    {
        path: "/",
        route: appRoutes
    },
    {
        path: "/",
        route: fileRoutes
    },
    {
        path: "/",
        route: emailUserRoutes
    },
    {
        path: "/",
        route: campaignRoutes
    },
    {
        path: "/",
        route: academyRoutes
    },
    {
        path: "/",
        route: shareRoutes
    },
    {
        path: "/api/2024-01/",
        route: publicApiRoutes
    },
    {
        path: "/",
        route: accountRoutes
    },
    {
        path: "/",
        route: integrationRoutes
    },
    {
        path: "/",
        route: businessRoute
    },
    {
        path: "/",
        route: roundRoute
    },
    {
        path: "/",
        route: aiEditorRoutes
    },
    {
        path: "/",
        route: uploadRoutes
    },
    {
        path: "/",
        route: phoneRoutes
    },
    {
        path: "/",
        route: proposalRoutes
    },
    {
        path: "/",
        route: appsProjectRoutes
    },
    {
        path: "/",
        route: assistRoutes
    },
    {
        path: "/",
        route: assistSettingsRoutes
    },
    {
        path: "/",
        route: noteRoutes
    },
    {
        path: "/",
        route: blogRoutes
    },
    {
        path: "/",
        route: blogPostRoutes
    }
]

defaultRoutes.forEach((route) => {
    apiRoutes.use(route.path, route.route)
})

export default apiRoutes
