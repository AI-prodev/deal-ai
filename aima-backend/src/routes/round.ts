import express from "express"
import { authenticate, hasRoles } from "../middlewares/auth"
import { getRounds } from "../controllers/roundController"

export const roundRoute = express.Router()

roundRoute.get(
    "/rounds",
    authenticate,
    hasRoles(["admin", "user", "3dayfreetrial"]),
    getRounds
)
