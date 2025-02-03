import express from "express"
import {
    createBusinessSeller,
    getAllBusinessSellers,
    getBusinessSellerById,
    updateBusinessSeller,
    deleteBusinessSeller
} from "../../controllers/sellerController"
import {
    createCommercialSeller,
    getAllCommercialSellers,
    getCommercialSellerById,
    updateCommercialSeller,
    deleteCommercialSeller,
    toggleEnableCommercialSeller
} from "../../controllers/commercialSellerController"

import { validateCommercialSeller } from "../../config/validation"
import { authenticate, hasRoles } from "../../middlewares/auth"
import { validateBusinessSeller } from "../../config/validation"
import {
    paginateAndFilter,
    setUserFilter
} from "../../middlewares/paginateAndFilterMiddleware"
import { BusinessSellerModel } from "../../models/seller"
import { CommercialSellerModel } from "../../models/commercialSeller"

const router = express.Router()

// Create a new business seller
router.post(
    "/property/",
    authenticate,
    validateCommercialSeller,
    hasRoles(["admin", "buyer", "seller"]),
    createCommercialSeller
)

router.get(
    "/property/",
    authenticate,
    setUserFilter,
    paginateAndFilter(
        CommercialSellerModel,
        {
            path: "userId",
            select: "firstName lastName email roles",
            from: "users"
        },
        "-vectors"
    ),
    hasRoles(["admin", "buyer", "seller", "externalseller"]),
    getAllCommercialSellers
)

router.get(
    "/property/:id",
    authenticate,
    hasRoles(["admin", "buyer", "seller", "broker", "externalseller"]),
    getCommercialSellerById
)

router.put(
    "/property/:id",
    authenticate,
    validateCommercialSeller,
    hasRoles(["admin", "buyer", "seller", "externalseller"]),
    updateCommercialSeller
)

router.delete(
    "/property/:id",
    authenticate,
    hasRoles(["admin", "buyer", "seller", "externalseller"]),
    deleteCommercialSeller
)

router.post(
    "/",
    authenticate,
    validateBusinessSeller,
    hasRoles(["admin", "buyer", "seller", "externalseller"]),
    createBusinessSeller
)

router.get(
    "/",
    authenticate,
    setUserFilter,
    paginateAndFilter(
        BusinessSellerModel,
        {
            path: "userId",
            select: "firstName lastName email roles",
            from: "users"
        },
        "-vectors"
    ),
    hasRoles(["admin", "buyer", "seller", "externalseller"]),
    getAllBusinessSellers
)

router.get(
    "/:id",
    authenticate,
    hasRoles(["admin", "buyer", "seller", "broker", "externalseller"]),
    getBusinessSellerById
)

router.put(
    "/:id",
    authenticate,
    validateBusinessSeller,
    hasRoles(["admin", "buyer", "seller", "externalseller"]),
    updateBusinessSeller
)

router.delete(
    "/:id",
    authenticate,
    hasRoles(["admin", "buyer", "seller", "externalseller"]),
    deleteBusinessSeller
)

export { router as SellerRoutes }
