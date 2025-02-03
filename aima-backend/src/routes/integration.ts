import express from "express"
import { authenticate } from "../middlewares/auth"
import {
    addIntegration,
    deleteIntegration,
    getIntegration,
} from "../controllers/integrationController"

export const integrationRoutes = express.Router()

integrationRoutes.get(
    "/integrations/:type",
    authenticate,
    getIntegration,
)

integrationRoutes.post(
    "/integrations",
    authenticate,
    addIntegration,
)

integrationRoutes.delete(
    "/integrations/:id",
    authenticate,
    deleteIntegration,
)
