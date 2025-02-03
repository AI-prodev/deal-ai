import express from "express"
import { authenticate } from "../middlewares/auth"
import {
    create,
    deleteEmail,
    get,
    getOne,
    update,
    getVerifiedSenders,
    getBroadcastEmailData,
    getBroadcastEmailStats,
    checkContactSubscribedStatus,
    updateContactSubscribedStatus,
    getAllUserContactsCount
} from "../controllers/broadcastEmailController"

const router = express.Router()

router.post("/", authenticate, create)

router.get("/e/:id", authenticate, getOne)

router.get("/stats/:broadcastEmailId", authenticate, getBroadcastEmailStats)

router.get(
    "/report-list/:broadcastEmailId",
    authenticate,
    getBroadcastEmailData
)

router.get("/check-subscribe-status", checkContactSubscribedStatus)

router.get("/all-contacts-count", authenticate, getAllUserContactsCount)

router.get("/:status", authenticate, get)

router.get("/:accountId/verified-senders", authenticate, getVerifiedSenders)

router.patch("/unsubscribe", updateContactSubscribedStatus)

router.patch("/:id", authenticate, update)

router.delete("/:id", authenticate, deleteEmail)

export { router as broadcastEmailRoutes }
