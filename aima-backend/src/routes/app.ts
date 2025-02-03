import express from "express"
import { authenticate, hasRoles } from "../middlewares/auth"
import { getAvailableApps } from "../controllers/appController"

export const appRoutes = express.Router()

appRoutes.get("/apps", authenticate, getAvailableApps)
