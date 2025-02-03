import express from "express"
import * as contactController from "../controllers/contactController"
import { authenticate } from "../middlewares/auth"
import { paginateAndFilter, setUserFilter } from "../middlewares/paginateAndFilterMiddleware"
import ContactModel from "../models/contact"

const router = express.Router()

router.post(
    "/contacts",
    contactController.createContact
)

router.get(
    "/contacts/all",
    authenticate,
    setUserFilter,
    paginateAndFilter(
        ContactModel, undefined, undefined, true),
    contactController.getAll
)

router.get(
    "/contacts/:funnelId/funnel",
    authenticate,
    paginateAndFilter(ContactModel, undefined, undefined, true),
    contactController.listFunnelContacts
)
router.get(
    "/contacts/:funnelId/funnel/csv",
    authenticate,
    contactController.listFunnelContactsCSV
)
router.delete(
    "/contacts/:id",
    authenticate,
    contactController.deleteContact
)

router.get(
    "/userContacts/:id",
    authenticate,
    contactController.userContactById
)

router.put(
    "/userContacts/:id",
    authenticate,
    contactController.updateUserContact
)

router.get(
    "/userContactsByListId/:id",
    authenticate,
    // setListIdFilter,
    // paginateAndFilter(ContactModel, undefined, undefined, true),
    contactController.userContactByListId
)

router.post(
    "/userContacts",
    authenticate,
    contactController.createUserContact
)

router.delete(
    "/userContacts/:id",
    authenticate,
    contactController.userContactDelete
)

export { router as contactRoutes }
