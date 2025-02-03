import express from "express"
import multer from "multer"
import { authenticate, hasRoles } from "../../middlewares/auth"
import {
    uploadOriginalImages,
    updateEditedImage,
    listAIEditorEntries,
    deleteUserAIEditorEntry
} from "../../controllers/aiEditorController"
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

export const aiEditorRoutes = express.Router()

const AI_EDITOR_ROLES = ["admin", "user", "3dayfreetrial", "lite"]

aiEditorRoutes.post(
    "/ai-editor/upload-original",
    authenticate,
    hasRoles(AI_EDITOR_ROLES),
    upload.array("images", 5),
    uploadOriginalImages
)

aiEditorRoutes.put(
    "/ai-editor/update-edited/:id",
    authenticate,
    hasRoles(AI_EDITOR_ROLES),
    upload.single("image"),
    updateEditedImage
)

aiEditorRoutes.get(
    "/ai-editor/list",
    authenticate,
    hasRoles(AI_EDITOR_ROLES),
    listAIEditorEntries
)

aiEditorRoutes.delete(
    "/ai-editor/delete/:id",
    authenticate,
    hasRoles(AI_EDITOR_ROLES),
    deleteUserAIEditorEntry
)
