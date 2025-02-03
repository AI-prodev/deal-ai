import express from "express"
import { authenticate, hasRoles } from "../middlewares/auth"
import {
    updateBusinessStatus, 
} from "../controllers/businessController"

export const businessRoute = express.Router()


businessRoute.put(
    "/business/:businessId",
    authenticate,
    hasRoles(["admin", "user", "3dayfreetrial"]),
    updateBusinessStatus
)

