import express, { Router, Request } from "express"
import { authenticate } from "../../middlewares/auth"
import {
    addApp,
    addStoreToUser,
    changeApiKey,
    changeBusinessDetails,
    createOrUpdateProfile,
    deleteProfile,
    getApiKey,
    getBusinessDetails,
    getMyApps,
    getMyFileSize,
    getProfile,
    removeApp,
    reorderApps
} from "../../controllers/profileController"
import multer from "multer"
import {
    addFavorite,
    getFavorites,
    removeFavorite
} from "../../controllers/favouriteController"
import Stripe from "stripe"
import * as process from "process"
import {
    accountProducts,
    callback,
    createAccount,
    deleteIntegration,
    returnAccount,
    stripeAccounts,
    createPayment,
    getPayments,
    lintFunnelOrders,
    paymentByContactId
} from "../../controllers/stripeController"
import {
    addContactIdFilter,
    paginateAndFilter
} from "../../middlewares/paginateAndFilterMiddleware"
import { OrderModel } from "../../models/order"

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
type File = Express.Multer.File
const storage = multer.memoryStorage()
const app = express()
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
// Profile routes
router.get("/me", authenticate, getProfile)

router.post(
    "/me",
    upload.single("profileImage"),
    authenticate,
    createOrUpdateProfile
)
router.delete("/me", authenticate, deleteProfile)

router.get("/fileSize/me", authenticate, getMyFileSize)

router.get("/apps/me", authenticate, getMyApps)
router.post("/apps/add", authenticate, addApp)
router.delete("/apps/remove", authenticate, removeApp)
router.put("/apps/reorder", authenticate, reorderApps)

router.post("/favorites", authenticate, addFavorite)
router.delete("/favorites/:favoriteId", authenticate, removeFavorite)
router.get("/favorites", authenticate, getFavorites)
router.post("/create-connect-account", authenticate, createAccount)
router.get("/return", returnAccount)
router.get("/accounts", authenticate, stripeAccounts)
router.get("/accounts/:id", authenticate, accountProducts)
router.get("/callback", callback)
router.delete("/accounts/delete/:id", deleteIntegration)

router.post("/payment", createPayment)
router.get(
    "/payment/:funnelId/funnel",
    paginateAndFilter(OrderModel, undefined, undefined, true),
    getPayments
)
router.get("/payment/:id/funnel/csv", lintFunnelOrders)

// Store routes
router.post("/store", authenticate, addStoreToUser)

// API Key routes
router.get("/api-key", authenticate, getApiKey)
router.post("/api-key/change", authenticate, changeApiKey)

// Business Address routes
router.get("/business-details", authenticate, getBusinessDetails)
router.put("/business-details", authenticate, changeBusinessDetails)

export { router as userRoute }
