import express from "express"
import multer from "multer"
import { authenticate, hasRoles } from "../middlewares/auth"
import {
    createBlog,
    deleteBlog,
    updateBlog,
    updateBlogLogo,
    getBlog,
    getBlogs,
    getMyBlogs,
    deleteBlogLogo,
    completeBlogPost
} from "../controllers/blogController"

export const blogRoutes = express.Router()

const upload = multer({ dest: "uploads/" })

blogRoutes.post("/blogs", authenticate, hasRoles(["admin", "user"]), createBlog)
blogRoutes.delete("/blogs/:blogId", authenticate, deleteBlog)
blogRoutes.delete("/blogs/:blogId/logo", authenticate, deleteBlogLogo)
blogRoutes.patch("/blogs/:blogId", authenticate, updateBlog)
blogRoutes.patch(
    "/blogs/:blogId/logo",
    authenticate,
    upload.single("file"),
    updateBlogLogo
)
blogRoutes.get("/blogs/me", authenticate, getMyBlogs)
blogRoutes.get("/blogs/", authenticate, getBlogs)
blogRoutes.get("/blogs/:blogId", authenticate, getBlog)
blogRoutes.post("/blogs/completeBlogPost", authenticate, completeBlogPost)
