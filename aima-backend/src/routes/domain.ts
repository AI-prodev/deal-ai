import express from "express"
import { authenticate, hasRoles } from "../middlewares/auth"
import {
    createDomain,
    deleteDomain,
    getMyDomains,
    getDomain,
    autoRenew,
    checkDomain,
    registerDomain,
    getZoneRecords,
    deleteZoneRecords,
    addZoneRecord,
    editZoneRecord,
    checkDomainRecords
} from "../controllers/domainController"

export const domainRoutes = express.Router()

domainRoutes.post(
    "/domains",
    authenticate,
    hasRoles(["admin", "user", "3dayfreetrial", "lite"]),
    createDomain
)

domainRoutes.get("/domains/me", authenticate, getMyDomains)
domainRoutes.get("/domains/:domainId", authenticate, getDomain)
domainRoutes.get("/domains/:domainId/check", authenticate, checkDomainRecords)
domainRoutes.post("/domains/:domainId", authenticate, autoRenew)
domainRoutes.delete("/domains/:domainId", authenticate, deleteDomain)
domainRoutes.post("/domains/check/:domainId", authenticate, checkDomain)
domainRoutes.post("/domains/register/:domainId", authenticate, registerDomain)
domainRoutes.get("/domains/zone/:id", authenticate, getZoneRecords)
domainRoutes.delete(
    "/domains/zone/:record/:id",
    authenticate,
    deleteZoneRecords
)
domainRoutes.post("/domains/zone/:domainId", authenticate, addZoneRecord)
domainRoutes.patch("/domains/:zoneId/:id", authenticate, editZoneRecord)
