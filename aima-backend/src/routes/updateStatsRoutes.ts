import { Router } from "express"
import {
    checkApiStatsKey,
    getStats,
    updateLastUpdated,
    updateStats
} from "../controllers/updateStatsController"
import { authenticate, hasRoles } from "../middlewares/auth"

export const updateStatsRoutes = Router()
updateStatsRoutes.post(
    "/updateLastUpdated/:businessesLastUpdated/:landLastUpdated",
    checkApiStatsKey,
    updateLastUpdated
)

updateStatsRoutes.post(
    "/updateStats/:businessesVectorCount/:landVectorCount",
    checkApiStatsKey,
    updateStats
)
updateStatsRoutes.get(
    "/admin/getStats",
    authenticate,
    hasRoles(["admin"]),
    getStats
)
