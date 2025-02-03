import express, { Request } from "express"
import { authenticate, hasRoles } from "../../middlewares/auth"
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
    startBonusStackRequest,
    endBonusStackRequest,
    queryBonusStackRequest
} from "../../controllers/bonusStackController"
import {
    startFaqRequest,
    endFaqRequest,
    queryFaqRequest
} from "../../controllers/faqController"
import {
    startHeroRequest,
    endHeroRequest,
    queryHeroRequest
} from "../../controllers/heroController"
import {
    startAdSocialImageRequest,
    endAdSocialImageRequest,
    queryAdSocialImageRequest
} from "../../controllers/adSocialImageController"
import {
    startUrlRequest,
    queryUrlRequest,
    endUrlRequest
} from "../../controllers/magicHooksUrlController"
import {
    startImageRequest,
    queryImageRequest,
    endImageRequest
} from "../../controllers/magicHooksImageController"
import {
    startImageIdeasRequest,
    endImageIdeasRequest,
    queryImageIdeasRequest
} from "../../controllers/imageIdeasController"
import {
    startImageToVideoRequest,
    endImageToVideoRequest,
    queryImageToVideoRequest
} from "../../controllers/imageToVideoController"
import {
    startPageGeneratorRequest,
    endPageGeneratorRequest,
    queryPageGeneratorRequest
} from "../../controllers/pageGeneratorController"

import creationService from "../../services/creation.service"

import { IExtendedRequest } from "../../types/IExtendedRequest"
import multer from "multer"
import { finalizeCompositeCreation } from "../../controllers/compositeCreationController"
import {
    startSeoRequest,
    querySeoRequest,
    endSeoRequest
} from "../../controllers/seoController"
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
import {
    endEmailSequenceRequest,
    queryEmailSequenceRequest,
    startEmailSequenceRequest
} from "../../controllers/emailSequenceController"
import { uploadEditedImage } from "../../controllers/editImageUploadController"
import {
    startInpaint,
    getInpaintStatus,
    cleanImage,
    replaceBackground
} from "../../controllers/magicRepleaceController"

export const marketingRoutes = express.Router()

const MARKETING_ROUTES_ROLES = ["admin", "user", "3dayfreetrial", "lite"]

///#region Magic Hooks
marketingRoutes.post(
    "/marketing-hooks/start",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    startMarketingRequest
)

marketingRoutes.post(
    "/marketing-hooks/query/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    queryMarketingRequest
)

marketingRoutes.post(
    "/marketing-hooks/end/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    async (req: IExtendedRequest, res) => {
        await endMarketingRequest(req, res)
    }
)
///#endregion

///#region Magic Hooks images
type File = Express.Multer.File
const storage = multer.memoryStorage()
const fileFilter = (
    req: Request,
    file: File,
    cb: (error: Error | null, acceptFile: boolean) => void
) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
    ]

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error("Invalid file type. Only image files are allowed."), false)
    }
}
const upload = multer({ storage: storage, fileFilter: fileFilter })
marketingRoutes.post(
    "/marketing-hooks/image/start",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    upload.single("image"),
    startImageRequest
)

marketingRoutes.post(
    "/marketing-hooks/image/query/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    queryImageRequest
)

marketingRoutes.post(
    "/marketing-hooks/image/end/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    async (req: IExtendedRequest, res) => {
        await endImageRequest(req, res)
    }
)
///#endregion

///#region URL Processing
marketingRoutes.post(
    "/marketing-hooks/url/start",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    startUrlRequest
)

marketingRoutes.post(
    "/marketing-hooks/url/query/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    queryUrlRequest
)

marketingRoutes.post(
    "/marketing-hooks/url/end/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    endUrlRequest
)
///#endregion

///#region Benefit Stacks
marketingRoutes.post(
    "/benefit-stacks/start",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    startBenefitStackRequest
)

marketingRoutes.post(
    "/benefit-stacks/query/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    queryBenefitStackRequest
)

marketingRoutes.post(
    "/benefit-stacks/end/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    async (req: IExtendedRequest, res) => {
        await endBenefitStackRequest(req, res)
    }
)
///#endregion

///#region Bonus Stacks
marketingRoutes.post(
    "/bonus-stacks/start",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    startBonusStackRequest
)

marketingRoutes.post(
    "/bonus-stacks/query/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    queryBonusStackRequest
)

marketingRoutes.post(
    "/bonus-stacks/end/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    async (req: IExtendedRequest, res) => {
        await endBonusStackRequest(req, res)
    }
)
///#endregion

///#region FAQs
marketingRoutes.post(
    "/faq/start",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    startFaqRequest
)

marketingRoutes.post(
    "/faq/query/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    queryFaqRequest
)

marketingRoutes.post(
    "/faq/end/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    async (req: IExtendedRequest, res) => {
        await endFaqRequest(req, res)
    }
)
///#endregion

///#region Hero
marketingRoutes.post(
    "/hero/start",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    startHeroRequest
)

marketingRoutes.post(
    "/hero/query/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    queryHeroRequest
)

marketingRoutes.post(
    "/hero/end/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    async (req: IExtendedRequest, res) => {
        await endHeroRequest(req, res)
    }
)
///#endregion

///#region Ad Social Image
marketingRoutes.post(
    "/adSocialImage/start",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    startAdSocialImageRequest
)

marketingRoutes.post(
    "/adSocialImage/query/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    queryAdSocialImageRequest
)

marketingRoutes.post(
    "/adSocialImage/end/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    async (req: IExtendedRequest, res) => {
        await endAdSocialImageRequest(req, res)
    }
)
///#endregion

///#region FAQs
marketingRoutes.post(
    "/image-ideas/start",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    startImageIdeasRequest
)

marketingRoutes.post(
    "/image-ideas/query/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    queryImageIdeasRequest
)

marketingRoutes.post(
    "/image-ideas/end/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    async (req: IExtendedRequest, res) => {
        await endImageIdeasRequest(req, res)
    }
)
///#endregion

///#region ImageToVideo
marketingRoutes.post(
    "/image-to-video/start",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    startImageToVideoRequest
)

marketingRoutes.post(
    "/image-to-video/query/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    queryImageToVideoRequest
)

marketingRoutes.post(
    "/image-to-video/end/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    async (req: IExtendedRequest, res) => {
        await endImageToVideoRequest(req, res)
    }
)
///#endregion

///#region Creations
marketingRoutes.patch(
    "/creation/update/:id/:rating",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    async (req: IExtendedRequest, res) => {
        await creationService.rateCreation(
            req.params.id,
            +req.params.rating,
            req.user.id,
            res
        )
    }
)
///#endregion

///#region Composite Creations
marketingRoutes.post(
    "/composite-creation/finalize/:type/:correlationId",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    finalizeCompositeCreation
)
///#endregion

///#region SEO
marketingRoutes.post(
    "/seo/start",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    startSeoRequest
)

marketingRoutes.post(
    "/seo/query/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    querySeoRequest
)

marketingRoutes.post(
    "/seo/end/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    endSeoRequest
)
///#endregion

///#region Product
marketingRoutes.post(
    "/product/start",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    startProductRequest
)

marketingRoutes.post(
    "/product/query/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    queryProductRequest
)

marketingRoutes.post(
    "/product/end/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    endProductRequest
)
///#endregion

///#region ImageToVideo
marketingRoutes.post(
    "/product-placement/start",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    startProductPlacementRequest
)

marketingRoutes.post(
    "/product-placement/query/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    queryProductPlacementRequest
)

marketingRoutes.post(
    "/product-placement/end/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    endProductPlacementRequest
)
///#endregion

///#region Page Generator
marketingRoutes.post(
    "/page-generator/start",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    startPageGeneratorRequest
)

marketingRoutes.post(
    "/page-generator/end/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    endPageGeneratorRequest
)

marketingRoutes.post(
    "/page-generator/query/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    queryPageGeneratorRequest
)
///#endregion

///#region Email Sequence
marketingRoutes.post(
    "/email-sequence/start",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    startEmailSequenceRequest
)

marketingRoutes.post(
    "/email-sequence/query/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    queryEmailSequenceRequest
)

marketingRoutes.post(
    "/email-sequence/end/:token",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    async (req: IExtendedRequest, res) => {
        await endEmailSequenceRequest(req, res)
    }
)
///#endregion

///#region Edit Image Upload
marketingRoutes.post(
    "/upload-edited-image",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    upload.single("image"),
    uploadEditedImage
)
///#endregion

///#region Inpaint
marketingRoutes.post(
    "/inpaint/start",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "mask", maxCount: 1 }
    ]),
    startInpaint
)
///#endregion

///#region Inpaint
marketingRoutes.get(
    "/inpaint/status/:id",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    getInpaintStatus
)
///#endregion

///#region Clean Image
marketingRoutes.post(
    "/clean/image",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "mask", maxCount: 1 }
    ]),
    cleanImage
)
///#endregion

///#region Background Replace
marketingRoutes.post(
    "/replace-background/",
    authenticate,
    hasRoles(MARKETING_ROUTES_ROLES),
    upload.fields([{ name: "image", maxCount: 1 }]),
    replaceBackground
)
///#endregion
