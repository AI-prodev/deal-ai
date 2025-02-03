import express from "express"

import { authenticate, hasRoles } from "../middlewares/auth"
import { SocratesLandStartRequest } from "../controllers/SocratesLandController"
import { rateLimitBuyerFreeRole } from "../middlewares/rateLimit"

export const socratesRoutes = express.Router()

socratesRoutes.post(
    "/socrates-land",
    authenticate,
    hasRoles(["admin", "buyer", "seller", "buyerfree"]),
    rateLimitBuyerFreeRole,
    SocratesLandStartRequest
)
