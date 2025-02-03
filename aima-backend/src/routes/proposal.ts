import express from "express"
import { authenticate, hasRoles } from "../middlewares/auth"
import { createProposal, deleteProposal, endProposalRequest, getMyProposals, queryProposalRequest, startProposalRequest } from "../controllers/proposalController"

const PROPOSAL_ROUTES_ROLES = ["admin", "user", "3dayfreetrial", "lite"]

export const proposalRoutes = express.Router()

proposalRoutes.post(
    "/proposals",
    authenticate,
    hasRoles(PROPOSAL_ROUTES_ROLES),
    createProposal
)

proposalRoutes.post(
    "/proposals/start",
    authenticate,
    hasRoles(PROPOSAL_ROUTES_ROLES),
    startProposalRequest
)

proposalRoutes.post(
    "/proposals/query/:token",
    authenticate,
    hasRoles(PROPOSAL_ROUTES_ROLES),
    queryProposalRequest
)

proposalRoutes.post(
    "/proposals/end/:token",
    authenticate,
    hasRoles(PROPOSAL_ROUTES_ROLES),
    endProposalRequest
)

proposalRoutes.get("/proposals/me", authenticate, getMyProposals)

proposalRoutes.delete("/proposals/:proposalId", authenticate, deleteProposal)
