import { Router } from "express"
import { Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"
import {
    processApolloBusinessMatches,
    processApolloRecommends,
    startApolloMatchBusinessesFiltered,
    apolloMatchBusinessesSync,
    processApolloBusinessExclusiveMatches,
    startApolloMatchBusinessesExclusiveFiltered
} from "../controllers/apolloController"
import { Recommendation, Thesis } from "../types/apolloType"
import { authenticate, hasRoles } from "../middlewares/auth"
import { rateLimitBuyerFreeRole } from "../middlewares/rateLimit"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { setRedis } from "../services/redis.service"

const apolloRoutes = Router()

apolloRoutes.post(
    "/startApolloMatchBusinesses",
    authenticate,
    async (req: Request, res: Response) => {
        const token = `pending-request:${uuidv4()}`
        const thesis: Thesis = req.body
        await setRedis(token, JSON.stringify({
            status: "processing",
            progress: 0
        }))

        processApolloBusinessMatches(token, thesis, res).catch(async (err) => {
            console.error(err)
            await setRedis(token, JSON.stringify({
                status: "error",
                error: err.message
            }))
        })

        res.json({ token })
    }
)

apolloRoutes.post(
    "/startApolloMatchBusinessesExclusive",
    authenticate,
    async (req: Request, res: Response) => {
        const token = `pending-request:${uuidv4()}`
        const thesis: Thesis = req.body
        await setRedis(token, JSON.stringify({
            status: "processing",
            progress: 0
        }))

        processApolloBusinessExclusiveMatches(token, thesis, res).catch(
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

apolloRoutes.post(
    "/startApolloRecommends",
    authenticate,
    rateLimitBuyerFreeRole,
    async (req: IExtendedRequest, res: Response) => {
        const token = `pending-request:${uuidv4()}`
        const recommendation: Recommendation = req.body

        await setRedis(token, JSON.stringify({
            status: "processing",
            progress: 0
        }))

        processApolloRecommends(token, recommendation, res, req).catch(
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
apolloRoutes.get(
    "/apolloMatchBusinessesSync",
    authenticate,
    hasRoles(["admin", "buyer", "seller", "onlyte", "buyerfree"]),
    apolloMatchBusinessesSync
)
apolloRoutes.post(
    "/startApolloMatchBusinessesFiltered",
    authenticate,
    hasRoles(["admin", "buyer", "seller", "onlyte", "buyerfree"]),

    startApolloMatchBusinessesFiltered
)
apolloRoutes.post(
    "/startApolloMatchBusinessesExclusiveFiltered",
    authenticate,
    hasRoles(["admin", "buyer", "seller", "onlyte", "buyerfree"]),

    startApolloMatchBusinessesExclusiveFiltered
)

export { apolloRoutes }
