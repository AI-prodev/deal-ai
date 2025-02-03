import express from "express"
import { authenticate, hasRoles } from "../middlewares/auth"
import {
    getFilesByFolder,
    createFile,
    getFolder,
    createFolder,
    getFoldersByFolder,
    deleteFile,
    getFileDownloadUrl,
    deleteFolder,
    getFileShareToken,
    getSharedFile,
    renameFile,
    renameFolder,
    copyFile,
    getUserImages,
    getFolderByName,
    moveFile,
    moveFolder
} from "../controllers/fileController"

export const fileRoutes = express.Router()

fileRoutes.post(
    "/files",
    authenticate,
    hasRoles(["admin", "user", "3dayfreetrial", "lite"]),
    createFile
)

fileRoutes.post(
    "/folders",
    authenticate,
    hasRoles(["admin", "user", "3dayfreetrial", "lite"]),
    createFolder
)

fileRoutes.post(
    "/files/:fileId/copy",
    authenticate,
    hasRoles(["admin", "user", "3dayfreetrial", "lite"]),
    copyFile
)
fileRoutes.post(
    "/files/:folderId/moveFolder",
    authenticate,
    moveFolder
)

fileRoutes.get("/folders/name", authenticate, getFolderByName)
fileRoutes.get("/folders/:folderId", authenticate, getFolder)
fileRoutes.get(
    "/folders/:parentFolderId/parentFolder",
    authenticate,
    getFoldersByFolder
)
fileRoutes.get("/files/:folderId/folder", authenticate, getFilesByFolder)
fileRoutes.get("/files/:fileId/download", authenticate, getFileDownloadUrl)
fileRoutes.get("/files/:fileId/share", authenticate, getFileShareToken)
fileRoutes.get("/files/:fileId/:shareToken", getSharedFile)
fileRoutes.get("/files/my-images", authenticate, getUserImages)
fileRoutes.get("/files/:folderId/:fileId/moveFolder", authenticate, moveFile)

fileRoutes.patch("/files/:fileId/name", authenticate, renameFile)
fileRoutes.patch("/folders/:folderId/name", authenticate, renameFolder)

fileRoutes.delete("/files/:fileId", authenticate, deleteFile)
fileRoutes.delete("/folders/:folderId", authenticate, deleteFolder)
