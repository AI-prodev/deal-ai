import express from "express"
import { authenticate, hasRoles } from "../middlewares/auth"
import {
    createAccount,
    createCSRF,
    deleteAccount,
    getLinkedAccounts
} from "../controllers/accountController"

export const accountRoutes = express.Router()

accountRoutes.post(
    "/accounts",
    authenticate,
    hasRoles(["admin", "user", "3dayfreetrial"]),
    createAccount
)

accountRoutes.get(
    "/accounts/me",
    authenticate,
    hasRoles(["admin", "user", "3dayfreetrial"]),
    getLinkedAccounts
)

accountRoutes.patch(
    "/accounts/csrf",
    authenticate,
    hasRoles(["admin", "user", "3dayfreetrial"]),
    createCSRF
)

accountRoutes.delete("/accounts/:accountId", authenticate, deleteAccount)
