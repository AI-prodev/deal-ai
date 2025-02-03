import express from "express"
import {
    clonePage,
    deletePage,
    getContent,
    getFunnelPages,
    getPage,
    proxyContent,
    proxyFont,
    restorePageVersion,
    savePage,
    updatePageSettings,
    startCreatePageRequest,
    endCreatePageRequest,
    queryCreatePageRequest,
    uploadFile,
    addProduct,
    getProducts,
    deleteProduct,
} from "../controllers/pageController"
import { authenticate } from "../middlewares/auth"
import multer from "multer"
import {
    startQuestionGeneratorRequest,
    queryQuestionGeneratorRequest,
    endQuestionGeneratorRequest
} from "../controllers/questionGeneratorController"

export const pageRoutes = express.Router()

const upload = multer({ dest: "uploads/" })

pageRoutes.post("/pages/clone", authenticate, clonePage)
pageRoutes.post("/pages/start", authenticate, startCreatePageRequest)
pageRoutes.post("/pages/query/:token", authenticate, queryCreatePageRequest)
pageRoutes.post("/pages/end/:token", authenticate, endCreatePageRequest)
pageRoutes.post("/pages/uploadFile", authenticate, upload.single("file"), uploadFile)
pageRoutes.post("/pages/products", authenticate, addProduct)

pageRoutes.get("/pages/products", getProducts)
pageRoutes.get("/page/proxy/:url", proxyContent)
pageRoutes.get("/page/webfonts/:fontFile", proxyFont)
pageRoutes.get("/page/content/:fileName", getContent)
pageRoutes.get("/pages/:id", authenticate, getPage)
pageRoutes.get("/pages/:funnelId/funnel", getFunnelPages)

pageRoutes.put("/pages/:id/save", authenticate, savePage)
pageRoutes.put("/pages/:id/restore", authenticate, restorePageVersion)
pageRoutes.put("/pages/:id/settings", authenticate, updatePageSettings)

pageRoutes.delete("/pages/:id", authenticate, deletePage)
pageRoutes.delete("/pages/products/:id", authenticate, deleteProduct)

pageRoutes.post("/question/start", authenticate, startQuestionGeneratorRequest)
pageRoutes.post("/question/query/:token", authenticate, queryQuestionGeneratorRequest)
pageRoutes.post("/question/end/:token", authenticate, endQuestionGeneratorRequest)
