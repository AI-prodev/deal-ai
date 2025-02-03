import express, { Request } from "express"
import { publicApiAuthenticate } from "../../middlewares/auth"
import {
    startMarketingRequest,
    endMarketingRequest,
    queryMarketingRequest
} from "../../controllers/marketingHooksController"
import {
    startBenefitStackRequest,
    endBenefitStackRequest,
    queryBenefitStackRequest
} from "../../controllers/benefitStackController"

import {
    startFaqRequest,
    endFaqRequest,
    queryFaqRequest
} from "../../controllers/faqController"

import { IExtendedRequest } from "../../types/IExtendedRequest"

import {
    startProductRequest,
    queryProductRequest,
    endProductRequest
} from "../../controllers/productController"
import {
    startProductPlacementRequest,
    queryProductPlacementRequest,
    endProductPlacementRequest
} from "../../controllers/productPlacementController"
import { publicApiRateLimit } from "../../middlewares/rateLimit"
import { startSeoRequest } from "../../controllers/seoController"
import { querySeoRequest } from "../../controllers/seoController"
import { endSeoRequest } from "../../controllers/seoController"
import { finalizeCompositeCreation } from "../../controllers/compositeCreationController"
import { 
    addZapToFunnels,
    deleteZapFromAllFunnels, 
    getUserFunnels
} from "../../controllers/funnelController"
import { getAuthResult } from "../../controllers/authController"
import { insertContact, listUserContacts } from "../../controllers/contactController"

export const publicApiRoutes = express.Router()

///#region Magic Hooks
publicApiRoutes.post(
    "/marketing-hooks/start",
    publicApiAuthenticate,
    publicApiRateLimit(20),
    startMarketingRequest
)

publicApiRoutes.post(
    "/marketing-hooks/query/:token",
    publicApiAuthenticate,
    publicApiRateLimit(1),
    queryMarketingRequest
)

publicApiRoutes.post(
    "/marketing-hooks/end/:token",
    publicApiAuthenticate,
    publicApiRateLimit(1),
    endMarketingRequest
)
///#endregion

///#region Benefit Stack
publicApiRoutes.post(
    "/benefit-stack/start",
    publicApiAuthenticate,
    publicApiRateLimit(20),
    startBenefitStackRequest
)
publicApiRoutes.post(
    "/benefit-stack/query/:token",
    publicApiAuthenticate,
    publicApiRateLimit(1),
    queryBenefitStackRequest
)
publicApiRoutes.post(
    "/benefit-stack/end/:token",
    publicApiAuthenticate,
    publicApiRateLimit(1),
    async (req: IExtendedRequest, res) => {
        await endBenefitStackRequest(req, res)
    }
)
///#endregion

///#region FAQs
publicApiRoutes.post(
    "/faq/start",
    publicApiAuthenticate,
    publicApiRateLimit(20),
    startFaqRequest
)

publicApiRoutes.post(
    "/faq/query/:token",
    publicApiAuthenticate,
    publicApiRateLimit(1),
    queryFaqRequest
)

publicApiRoutes.post(
    "/faq/end/:token",
    publicApiAuthenticate,
    publicApiRateLimit(1),
    async (req: IExtendedRequest, res) => {
        await endFaqRequest(req, res)
    }
)

///#endregion

///#region Product
publicApiRoutes.post(
    "/product/start",
    publicApiAuthenticate,
    publicApiRateLimit(20),
    startProductRequest
)

publicApiRoutes.post(
    "/product/query/:token",
    publicApiAuthenticate,
    publicApiRateLimit(1),
    queryProductRequest
)

publicApiRoutes.post(
    "/product/end/:token",
    publicApiAuthenticate,
    publicApiRateLimit(1),
    endProductRequest
)
///#endregion

///#region Product Placement
publicApiRoutes.post(
    "/product-placement/start",
    publicApiAuthenticate,
    publicApiRateLimit(20),
    startProductPlacementRequest
)

publicApiRoutes.post(
    "/product-placement/query/:token",
    publicApiAuthenticate,
    publicApiRateLimit(1),
    queryProductPlacementRequest
)

publicApiRoutes.post(
    "/product-placement/end/:token",
    publicApiAuthenticate,
    publicApiRateLimit(1),
    endProductPlacementRequest
)
///#endregion

///#region SEO

publicApiRoutes.post(
    "/seo/start",
    publicApiAuthenticate,
    publicApiRateLimit(20),
    startSeoRequest
)

publicApiRoutes.post(
    "/seo/query/:token",
    publicApiAuthenticate,
    publicApiRateLimit(1),
    querySeoRequest
)

publicApiRoutes.post(
    "/seo/end/:token",
    publicApiAuthenticate,
    publicApiRateLimit(1),
    endSeoRequest
)
///#endregion

///#region Composite Creations
publicApiRoutes.post(
    "/composite-creation/finalize/:type/:correlationId",
    publicApiAuthenticate,
    publicApiRateLimit(1),
    finalizeCompositeCreation
)
///#endregion

///#region Auth
publicApiRoutes.get(
    "/auth/me", 
    publicApiAuthenticate, 
    publicApiRateLimit(1),
    getAuthResult,
)
///#endregion

///#region Funnels
publicApiRoutes.get(
    "/funnels/user", 
    publicApiAuthenticate, 
    publicApiRateLimit(1),
    getUserFunnels,
)
///#endregion


///#region Integration
publicApiRoutes.post(
    "/integrate/zap/funnel/subscribe", 
    publicApiAuthenticate,
    publicApiRateLimit(1),
    addZapToFunnels,
)

publicApiRoutes.delete(
    "/integrate/zap/funnel/unsubscribe", 
    publicApiAuthenticate, 
    publicApiRateLimit(1),
    deleteZapFromAllFunnels,
)

publicApiRoutes.post(
    "/integrate/zap/contacts", 
    publicApiAuthenticate, 
    publicApiRateLimit(1),
    listUserContacts,
)

publicApiRoutes.post(
    "/integrate/zap/contacts/insert", 
    publicApiAuthenticate, 
    publicApiRateLimit(1),
    insertContact,
)
///#endregion