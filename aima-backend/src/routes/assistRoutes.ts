import express from "express"
import multer from "multer"
import {
    validateCreateMessage,
    validateCreateVisitorMessage,
    validateCreateVisitorTicket,
    validateGetTicketMessages,
    validateGetVisitorTicketById,
    validateGetVisitorTicketMessagesById,
    validateGetVisitorTickets,
    validatePatchVisitorData
} from "../config/validation"
import {
    createImageMessage,
    createMessage,
    createVisitorImageMessage,
    createVisitorMessage,
    createVisitorTicket,
    generateAssistKey,
    getAssistKey,
    getTicketById,
    getTicketMessagesById,
    getTickets,
    getVisitorIdByTicketId,
    getVisitorTicketById,
    getVisitorTicketMessagesById,
    getVisitorTickets,
    updateTicketStatus,
    updateVisitorData
} from "../controllers/assistController"
import { authenticate } from "../middlewares/auth"

export const assistRoutes = express.Router()

const upload = multer({ dest: "uploads/" })

/* Visitors */
assistRoutes.post(
    "/visitors/tickets",
    validateCreateVisitorTicket,
    createVisitorTicket
)
assistRoutes.post(
    "/visitors/tickets/:id/message",
    validateCreateVisitorMessage,
    createVisitorMessage
)
assistRoutes.post(
    "/visitors/tickets/:id/image-message",
    upload.array("files", 5),
    createVisitorImageMessage
)
assistRoutes.get(
    "/visitors/tickets",
    validateGetVisitorTickets,
    getVisitorTickets
)
assistRoutes.get(
    "/visitors/tickets/:id",
    validateGetVisitorTicketById,
    getVisitorTicketById
)
assistRoutes.get(
    "/visitors/tickets/:id/messages",
    validateGetVisitorTicketMessagesById,
    getVisitorTicketMessagesById
)
assistRoutes.get("/visitors/tickets/:id/visitor", getVisitorIdByTicketId)

/* Users */
assistRoutes.post("/tickets/generate-key", authenticate, generateAssistKey)

assistRoutes.post(
    "/tickets/:id/message",
    authenticate,
    validateCreateMessage,
    createMessage
)

assistRoutes.post(
    "/tickets/:id/image-message",
    authenticate,
    upload.array("files", 5),
    createImageMessage
)
assistRoutes.patch("/tickets/:id/status", authenticate, updateTicketStatus)

assistRoutes.patch(
    "/tickets/:id/visitor-data",
    validatePatchVisitorData,
    updateVisitorData
)

assistRoutes.get("/tickets/key", authenticate, getAssistKey)

assistRoutes.get("/tickets", authenticate, getTickets)

assistRoutes.get(
    "/tickets/:id",
    authenticate,
    validateGetTicketMessages,
    getTicketById
)

assistRoutes.get("/tickets/:id/messages", authenticate, getTicketMessagesById)
