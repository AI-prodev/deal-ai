import express from "express"
import { copyComponent, deleteComponent, getComponent } from "../controllers/puckEditorController"
import { authenticate } from "../middlewares/auth"

const puckEditorRoutes = express.Router()

puckEditorRoutes.get("/get-component/:pageId", authenticate, getComponent)
puckEditorRoutes.post("/copy-component/:pageId", authenticate, copyComponent)
puckEditorRoutes.delete("/delete-component/:pageId", authenticate, deleteComponent)

export default puckEditorRoutes