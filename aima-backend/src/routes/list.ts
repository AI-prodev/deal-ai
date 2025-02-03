import express from "express"
import * as listController from "../controllers/listController"
import { authenticate } from "../middlewares/auth"
import { createSetListIdsFilter, paginateAndFilter, setUserFilter } from "../middlewares/paginateAndFilterMiddleware"
import ListModel from "../models/list"
import ContactModel from "../models/contact"

const router = express.Router()

router.get(
    "/",
    authenticate,
    setUserFilter,
    paginateAndFilter(ListModel, undefined, undefined, true),
    listController.getAll
)

router.post(
    "/create",
    authenticate,
    listController.createList
)

router.post(
    "/addListToContact",
    authenticate,
    listController.addListToContact
)

router.get(
    "/:id",
    authenticate,
    listController.getById
)

router.get(
    "/contact/:id",
    // authenticate,
    createSetListIdsFilter(ContactModel),
    paginateAndFilter(ListModel, undefined, undefined, true),
    listController.getByContactId
)

router.put(
    "/:id",
    authenticate,
    listController.updateList
)

router.delete(
    "/:id",
    authenticate,
    listController.deleteList
)

export { router as listRouter }