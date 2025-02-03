import { Router } from "express"
import { Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"

import { LandRecommandation, Thesis } from "../types/apolloType"
import { authenticate, hasRoles } from "../middlewares/auth"
import {
    processApolloLandMatches,
    processApolloLandRecommends,
    apolloMatchLandSync,
    startApolloMatchLandFiltered,
    processApolloPropertyExclusiveMatches,
    startApolloMatchLandExclusiveFiltered
} from "../controllers/apolloLandControllers"
import { rateLimitBuyerFreeRole } from "../middlewares/rateLimit"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { setRedis } from "../services/redis.service"

const apolloLandRoutes = Router()

apolloLandRoutes.post(
    "/startApolloMatchLand",
    authenticate,
    async (req: Request, res: Response) => {
        const token = `pending-request:${uuidv4()}`
        const thesis: Thesis = req.body
        await setRedis(token, JSON.stringify({
            status: "processing",
            progress: 0
        }))

        processApolloLandMatches(token, thesis, res).catch(async (err) => {
            console.error(err)
            await setRedis(token, JSON.stringify({
                status: "error",
                error: err.message
            }))
        })

        res.json({ token })
    }
)
apolloLandRoutes.post(
    "/startApolloLandRecommends",
    authenticate,
    rateLimitBuyerFreeRole,
    (req: IExtendedRequest, res: Response) => {
        const token = `pending-request:${uuidv4()}`
        const recommendation: LandRecommandation = req.body

        processApolloLandRecommends(token, recommendation, res, req)

        res.json({ token })
    }
)
apolloLandRoutes.post(
    "/startApolloMatchLandExclusive",
    authenticate,
    async (req: Request, res: Response) => {
        const token = `pending-request:${uuidv4()}`
        const thesis: Thesis = req.body

        await setRedis(token, JSON.stringify({
            status: "processing",
            progress: 0
        }))

        processApolloPropertyExclusiveMatches(token, thesis, res).catch(
            async (err) => {
                console.error(err)
                await setRedis(token, JSON.stringify({
                    status: "error",
                    error: err.message
                }))
            }
        )

        res.json({ token })
    }
)
apolloLandRoutes.get(
    "/apolloMatchLandSync",
    authenticate,
    hasRoles(["admin", "buyer", "seller", "onlyte", "buyerfree"]),
    apolloMatchLandSync
)
apolloLandRoutes.post(
    "/startApolloMatchLandFiltered",
    authenticate,

    hasRoles(["admin", "buyer", "seller", "onlyte", "buyerfree"]),
    startApolloMatchLandFiltered
)
apolloLandRoutes.post(
    "/startApolloMatchLandExclusiveFiltered",
    authenticate,
    hasRoles(["admin", "buyer", "seller", "onlyte", "buyerfree"]),
    startApolloMatchLandExclusiveFiltered
)
export { apolloLandRoutes }
