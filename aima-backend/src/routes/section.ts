import express from "express"
import { authenticate } from "../middlewares/auth"
import {
    saveSection,
    getSections,
    deleteSection
} from "../controllers/sectionController"

export const sectionRoutes = express.Router()

sectionRoutes.post("/sections", authenticate, saveSection)

sectionRoutes.get("/sections", authenticate, getSections)

sectionRoutes.delete("/sections/:id", authenticate, deleteSection)
