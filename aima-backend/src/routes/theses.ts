import express from "express"
import {
    startRequest,
    endRequest,
    queryRequest
} from "../controllers/thesesController"
import { authenticate, hasRoles } from "../middlewares/auth"
import { rateLimitBuyerFreeRole } from "../middlewares/rateLimit"

export const thesesRoutes = express.Router()

thesesRoutes.post(
    "/startRequest",
    authenticate,
    hasRoles(["admin", "buyer", "seller", "onlyte", "buyerfree"]),
    rateLimitBuyerFreeRole,
    startRequest
)
thesesRoutes.get(
    "/endRequest/:token",
    authenticate,
    hasRoles(["admin", "buyer", "seller", "onlyte", "buyerfree"]),
    // rateLimitBuyerFreeRole,
    endRequest
)
thesesRoutes.get(
    "/queryRequest/:token",
    authenticate,
    hasRoles(["admin", "buyer", "seller", "onlyte", "buyerfree"]),
    // rateLimitBuyerFreeRole,
    queryRequest
)
