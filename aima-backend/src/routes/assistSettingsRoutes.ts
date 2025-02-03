import express from "express"
import {
    getAssistSettings,
    patchAssistSettings
} from "../controllers/assistSettingsController"
import { authenticate } from "../middlewares/auth"
import { validatePatchAssistSettings } from "../config/validation"

export const assistSettingsRoutes = express.Router()

assistSettingsRoutes.get("/assist/settings", getAssistSettings)

assistSettingsRoutes.patch(
    "/assist/settings",
    authenticate,
    validatePatchAssistSettings,
    patchAssistSettings
)
