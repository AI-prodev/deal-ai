import { Router } from "express"
import {
    login,
    logout,
    register,
    verifyAPIKey,
    changePassword,
    refreshToken,
    requestPasswordReset,
    resetPassword
} from "../../controllers/authController"
import {
    changePasswordValidators,
    loginValidators,
    registerValidators
} from "../../config/validation"
import { authenticate } from "../../middlewares/auth"

const router = Router()

router.post("/login", loginValidators, login)
router.post("/register", verifyAPIKey, registerValidators, register)
router.post("/logout", logout)
router.put(
    "/change-password/:id",
    authenticate,
    changePasswordValidators,
    changePassword
)
router.post("/refresh-token", refreshToken)
router.post("/request-password-reset", requestPasswordReset)
router.post("/reset-password", resetPassword)

export { router as authRoutes }
