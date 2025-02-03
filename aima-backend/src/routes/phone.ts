import express from "express"
import { authenticate, hasRoles } from "../middlewares/auth"
import { acceptCall, createPhoneNumber, getAvailablePhoneNumbers, getMyPhoneCalls, getMyPhoneNumbers, getQuotas, processCallRecording, processCallStatus, releasePhoneNumber, updatePhoneNumber, uploadGreeting } from "../controllers/phoneController"
import { findLatestStripeByEmail } from "../controllers/stripeController"
import multer from "multer"


export const phoneRoutes = express.Router()

const upload = multer({ dest: "uploads/" })

phoneRoutes.get("/phones/quotas", authenticate, getQuotas)

phoneRoutes.post(
    "/phones",
    authenticate,
    hasRoles(["admin", "user", "3dayfreetrial", "lite"]),
    findLatestStripeByEmail,
    createPhoneNumber
)
phoneRoutes.post("/phones/greeting", authenticate, upload.single("audio"), uploadGreeting)
phoneRoutes.post("/phones/calls/accept", acceptCall)
phoneRoutes.post("/phones/calls/status", processCallStatus)
phoneRoutes.post("/phones/calls/recording", processCallRecording)

phoneRoutes.get("/phones/me", authenticate, getMyPhoneNumbers)
phoneRoutes.get("/phones/calls/me", authenticate, getMyPhoneCalls)
phoneRoutes.get("/phones/available", authenticate, getAvailablePhoneNumbers)

phoneRoutes.patch("/phones/:phoneNumberId", authenticate, updatePhoneNumber)

phoneRoutes.delete("/phones/:phoneNumberId/release", authenticate, releasePhoneNumber)

