import express from "express"
import { authenticate, hasRoles } from "../../middlewares/auth"
import {
    migrateDataToAppsProject,
    loadDefaultAppsProject,
    updateAppsProject,
    createAppsProject,
    listAllAppsProjects,
    updateSpecificAppsProject,
    getSpecificProjectAppName,
    deleteSpecificCreation,
    deleteSpecificGeneration,
    updateSpecificAppsProjectContentItems,
    deleteAppsProject,
    updateApplicationFormValues,
    getBenefitStackWithHighestGeneration
} from "../../controllers/AppsProjectsController"

export const appsProjectRoutes = express.Router()

const APPS_PROJECT_ROUTES_ROLES = ["admin", "user", "3dayfreetrial", "lite"]

appsProjectRoutes.post(
    "/apps-project/migrate",
    authenticate,
    hasRoles(APPS_PROJECT_ROUTES_ROLES),
    migrateDataToAppsProject
)

appsProjectRoutes.get(
    "/apps-project/default",
    authenticate,
    hasRoles(APPS_PROJECT_ROUTES_ROLES),
    loadDefaultAppsProject
)

appsProjectRoutes.put(
    "/apps-project/update/:projectId",
    authenticate,
    hasRoles(APPS_PROJECT_ROUTES_ROLES),
    updateAppsProject
)

appsProjectRoutes.post(
    "/apps-project/create",
    authenticate,
    hasRoles(APPS_PROJECT_ROUTES_ROLES),
    createAppsProject
)

appsProjectRoutes.get(
    "/apps-project/list/",
    authenticate,
    hasRoles(APPS_PROJECT_ROUTES_ROLES),
    listAllAppsProjects
)
appsProjectRoutes.put(
    "/apps-project/update-specific/:projectId",
    authenticate,
    hasRoles(APPS_PROJECT_ROUTES_ROLES),
    updateSpecificAppsProject
)

//for multiple api callings stuff
appsProjectRoutes.put(
    "/apps-project/update-specific-contentItems/:projectId",
    authenticate,
    hasRoles(APPS_PROJECT_ROUTES_ROLES),
    updateSpecificAppsProjectContentItems
)

appsProjectRoutes.get(
    "/apps-project/list/:projectId/:appName",
    authenticate,
    hasRoles(APPS_PROJECT_ROUTES_ROLES),
    getSpecificProjectAppName
)
//  delete  specific creation
appsProjectRoutes.delete(
    "/apps-project/:projectId/:appName/:generationNumber/:creationId",
    authenticate,
    hasRoles(APPS_PROJECT_ROUTES_ROLES),
    deleteSpecificCreation
)

// delete specific generation
appsProjectRoutes.delete(
    "/apps-project/:projectId/:appName/:generationNumber",
    authenticate,
    hasRoles(APPS_PROJECT_ROUTES_ROLES),
    deleteSpecificGeneration
)

//  delete apps project
appsProjectRoutes.delete(
    "/apps-project/:projectId",
    authenticate,
    hasRoles(APPS_PROJECT_ROUTES_ROLES),
    deleteAppsProject
)

// form values
appsProjectRoutes.put(
    "/apps-project/:projectId/:appName/update-form-values",
    authenticate,
    hasRoles(APPS_PROJECT_ROUTES_ROLES),
    updateApplicationFormValues
)

//get latesst benefits-stack
appsProjectRoutes.get(
    "/apps-project/:projectId/benefit-stack/high-gen",
    authenticate,
    hasRoles(APPS_PROJECT_ROUTES_ROLES),
    getBenefitStackWithHighestGeneration
)
