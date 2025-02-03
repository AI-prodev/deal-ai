import express from "express"
import { authenticate, hasRoles } from "../middlewares/auth"
import { createEmailUser, getMyEmailUsers, deleteEmailUser, getConfig, shareEmailCredentials, changeEmailPassword, getQuotas } from "../controllers/emailUserController"
import { findLatestStripeByEmail } from "../controllers/stripeController"


export const emailUserRoutes = express.Router()

emailUserRoutes.get("/emailUsers/config", authenticate, getConfig)
emailUserRoutes.get("/emailUsers/quotas", authenticate, getQuotas)

emailUserRoutes.post(
    "/emailUsers",
    authenticate,
    hasRoles(["admin", "user", "3dayfreetrial", "lite"]),
    findLatestStripeByEmail,
    createEmailUser
)

emailUserRoutes.post(
    "/emailUsers/share",
    authenticate,
    hasRoles(["admin", "user", "3dayfreetrial", "lite"]),
    shareEmailCredentials
)

emailUserRoutes.patch("/emailUsers/password", authenticate, changeEmailPassword)

emailUserRoutes.get("/emailUsers/me", authenticate, getMyEmailUsers)

emailUserRoutes.delete("/emailUsers/:emailUserId", authenticate, deleteEmailUser)
