import express from "express"
import multer from "multer"
import {
    createBlogPost,
    deletePost,
    getBlogPost,
    getBlogPosts,
    updateBlogPost
} from "../controllers/blogPostController"
import { authenticate } from "../middlewares/auth"

export const blogPostRoutes = express.Router()

const upload = multer({ dest: "uploads/" })

blogPostRoutes.post(
    "/blog-posts/:blogId",
    authenticate,
    upload.single("file"),
    createBlogPost
)
blogPostRoutes.delete("/blog-posts/:postId", authenticate, deletePost)
blogPostRoutes.patch(
    "/blog-posts/:postId",
    authenticate,
    upload.single("file"),
    updateBlogPost
)
blogPostRoutes.get("/blog-posts/:postId", authenticate, getBlogPost)
blogPostRoutes.get("/blog-posts/blog/:blogId", authenticate, getBlogPosts)
