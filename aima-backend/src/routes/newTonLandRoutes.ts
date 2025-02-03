import express from "express"

import { authenticate, hasRoles } from "../middlewares/auth"
import { newTonStartRequest } from "../controllers/newTonController"
import {
    getPropertyInformationRequestsByBuyerId,
    getPropertyInformationRequestsById,
    getPropertyInformationRequestsBySellerId,
    getPropertyInformationRequestsForConsulting,
    getSellerByPropertyMetadata,
    patchPropertyInformationRequestsById
} from "../controllers/newTonLandController"
import { rateLimitBuyerFreeRole } from "../middlewares/rateLimit"

export const newTonLandRoutes = express.Router()

newTonLandRoutes.post(
    "/newtonland",
    authenticate,
    hasRoles(["admin", "buyer", "seller", "buyerfree"]),
    rateLimitBuyerFreeRole,
    newTonStartRequest
)

// for Commercial Propertiess
newTonLandRoutes.get(
    "/newton-property/bi-request/:id",
    authenticate,
    hasRoles([
        "admin",
        "buyer",
        "seller",
        "consulting",
        "externalseller",
        "buyerfree"
    ]),
    getPropertyInformationRequestsById
)

newTonLandRoutes.patch(
    "/newton-property/bi-request",
    authenticate,
    hasRoles([
        "admin",
        "buyer",
        "seller",
        "consulting",
        "externalseller",
        "buyerfree"
    ]),
    patchPropertyInformationRequestsById
)

newTonLandRoutes.get(
    "/newton-property/bi-request-list/buyer/:id",
    authenticate,
    hasRoles([
        "admin",
        "buyer",
        "seller",
        "consulting",
        "externalseller",
        "buyerfree"
    ]),
    getPropertyInformationRequestsByBuyerId
)

newTonLandRoutes.get(
    "/newton-property/bi-request-list/seller/:id",
    authenticate,
    hasRoles([
        "admin",
        "buyer",
        "seller",
        "consulting",
        "externalseller",
        "buyerfree"
    ]),
    getPropertyInformationRequestsBySellerId
)

newTonLandRoutes.post(
    "/newton-property/seller",
    authenticate,
    hasRoles([
        "admin",
        "buyer",
        "seller",
        "consulting",
        "externalseller",
        "buyerfree"
    ]),
    getSellerByPropertyMetadata
)

newTonLandRoutes.get(
    "/newton-property/consulting-bi-list",
    authenticate,
    hasRoles(["consulting"]),
    getPropertyInformationRequestsForConsulting
)
