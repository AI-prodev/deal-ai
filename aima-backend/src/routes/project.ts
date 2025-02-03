import express from "express"
import { authenticate, hasRoles } from "../middlewares/auth"
import {
    createProject,
    deleteProject,
    getMyProjects,
    getProject
} from "../controllers/projectController"

export const projectRoutes = express.Router()

const PROJECT_ROLES = ["admin", "user", "3dayfreetrial", "lite"]
projectRoutes.post(
    "/projects",
    authenticate,
    hasRoles(PROJECT_ROLES),
    createProject
)

projectRoutes.get("/projects/me", authenticate, getMyProjects)

projectRoutes.get("/projects/:projectId", authenticate, getProject)

projectRoutes.delete("/projects/:projectId", authenticate, deleteProject)
