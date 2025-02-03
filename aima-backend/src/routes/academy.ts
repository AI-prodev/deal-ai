import express from "express"
import { authenticate, hasRoles } from "../middlewares/auth"
import { getAcademyBySlug, getAcademyInvite, isDaylightSavings } from "../controllers/academyController"

export const academyRoutes = express.Router()

const ACADEMY_ROLES = ["admin", "academy", "3dayfreetrial", "lite", "user"]

academyRoutes.get("/academies/isDaylightSavings", authenticate, hasRoles(ACADEMY_ROLES), isDaylightSavings)

academyRoutes.get("/academies/:academySlug/slug", authenticate, hasRoles(ACADEMY_ROLES), getAcademyBySlug)

academyRoutes.get("/academies/:academySlug/invite.ics", getAcademyInvite)
