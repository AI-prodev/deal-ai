import express from "express"
import { authenticate, hasRoles, pubUserAuth } from "../middlewares/auth"
import {
    createNote,
    updateNote,
    updateNoteCollab,
    getNoteCollab,
    getNotes,
    deleteNote,
    deleteAll,
    getAuth
} from "../controllers/noteController"

export const noteRoutes = express.Router()

noteRoutes.post("/notes/auth/:shareId", getAuth)

noteRoutes.get("/notes", authenticate, getNotes)
noteRoutes.post("/notes", authenticate, createNote)
noteRoutes.delete("/notes/:shareId", authenticate, deleteNote)
noteRoutes.delete("/notes", authenticate, deleteAll)

noteRoutes.get("/notes/private/:shareId/:token?", pubUserAuth, getNoteCollab)
noteRoutes.get("/notes/public/:shareId", getNoteCollab)

noteRoutes.patch("/notes/:shareId", authenticate, updateNote)
noteRoutes.patch("/notes/public/:shareId", updateNoteCollab)
noteRoutes.patch(
    "/notes/private/:shareId/:token?",
    pubUserAuth,
    updateNoteCollab
)
