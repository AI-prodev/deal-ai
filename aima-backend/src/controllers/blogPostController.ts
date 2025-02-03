import { randomUUID } from "crypto"
import * as fs from "fs"
import { Response } from "express"
import { isValidObjectId } from "mongoose"
import BlogModel from "../models/Blog"
import BlogPostModel from "../models/BlogPost"
import { putObject } from "../services/files.service"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { IBlogPost } from "../types/IBlogPost"

const generateSlug = async (title: string) => {
    const slug = title
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, "-")
    const count = await BlogPostModel.countDocuments({
        slug: new RegExp(slug, "i")
    })
    if (count > 0) {
        return `${slug}-${count}`
    }
    return slug
}

export const createBlogPost = async (req: IExtendedRequest, res: Response) => {
    if (!req?.file) {
        return res.status(400).json({ error: "Missing hero image" })
    }
    try {
        const postSlug = await generateSlug(req.body.title)

        const fileContent = fs.readFileSync(req.file.path)
        const fileKey = `${randomUUID()}_${req.file.originalname}`

        await putObject({
            Bucket: process.env.S3_UPLOADS_BUCKET,
            Key: fileKey,
            Body: fileContent,
            ContentType: req.file.mimetype
        })

        const newBlogPost: IBlogPost = new BlogPostModel({
            user: req.user.id,
            title: req.body.title,
            content: req.body.content,
            slug: postSlug,
            author: req.body.author,
            heroImage: process.env.CLOUDFRONT_UPLOADS_PREFIX + `/${fileKey}`
        })
        await newBlogPost.save()

        const blog = await BlogModel.findOne({
            _id: req.params.blogId
        })

        if (blog && newBlogPost._id) {
            blog.posts.push(newBlogPost._id)
            await blog.save()
        }

        res.status(200).json(newBlogPost)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getBlogPosts = async (req: IExtendedRequest, res: Response) => {
    try {
        const blog = await BlogModel.findOne({
            _id: req.params.blogId
        })
            .populate("posts")
            .exec()

        res.status(200).json(blog.posts)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getBlogPost = async (req: IExtendedRequest, res: Response) => {
    try {
        const post = await BlogPostModel.findOne({
            _id: req.params.postId
        }).exec()

        res.status(200).json(post)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const updateBlogPost = async (req: IExtendedRequest, res: Response) => {
    try {
        const post = await BlogPostModel.findOne({
            _id: req.params.postId,
            user: req.user.id
        })

        let shouldUpdate = false

        if (!post) {
            return res
                .status(404)
                .json({ error: "Post not found or user not authorized" })
        }

        if (req?.file) {
            const fileContent = fs.readFileSync(req.file.path)
            const fileKey = `${randomUUID()}_${req.file.originalname}`

            await putObject({
                Bucket: process.env.S3_UPLOADS_BUCKET,
                Key: fileKey,
                Body: fileContent,
                ContentType: req.file.mimetype
            })
            post.heroImage =
                process.env.CLOUDFRONT_UPLOADS_PREFIX + `/${fileKey}`
            shouldUpdate = true
        }

        if (post.title !== req.body.title) {
            post.title = req.body.title
            post.slug = await generateSlug(req.body.title)
            shouldUpdate = true
        }

        if (post.content !== req.body.content) {
            post.content = req.body.content
            shouldUpdate = true
        }

        if (post.author !== req.body.author) {
            post.author = req.body.author
            shouldUpdate = true
        }

        if (shouldUpdate) {
            await post.save()
        }

        res.status(200).json(post)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const deletePost = async (req: IExtendedRequest, res: Response) => {
    try {
        const postId = req.params.postId
        const blog = await BlogModel.findOne({
            _id: req.body.blogId
        }).exec()

        if (blog && blog.posts) {
            blog.posts = blog.posts.filter((id) => id.toString() !== postId)
            await blog.save()
        }

        await BlogPostModel.deleteOne({
            _id: req.params.postId,
            user: req.user.id
        }).exec()

        res.status(200).json()
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

const findBlog = async (
    query: { domain: string } | { subdomain: string } | { _id: string }
) => {
    return await BlogModel.findOne(query)
        .populate({
            path: "posts",
            options: { sort: { createdAt: -1 } }
        })
        .lean()
        .exec()
}

export const renderBlogPost = async (req: IExtendedRequest, res: Response) => {
    let blog = null
    const path = req.params.path || ""
    // const postSlug = req.params.postSlug || ""
    let slug = ""

    if (req.domain) {
        blog = await findBlog({
            domain: req.domain._id
        })
        slug = req.params.path
    } else if (req.sharedBlogDomain) {
        if (req.customSubdomain) {
            blog = await findBlog({
                subdomain: req.customSubdomain
            })
            slug = req.params.path
        } else if (isValidObjectId(path)) {
            // path is blogId
            blog = await findBlog({
                _id: path
            })
            slug = req.params.postSlug
        }
    }
    if (!blog) {
        return res.status(404).send("Funnel or Blog not found")
    }

    if (slug) {
        const post = await BlogPostModel.findOne({ slug })
        if (!post) {
            return res.status(404).send("Post not found")
        }
        const homeUrl = req.domain || req.customSubdomain ? "/" : `/${blog._id}`
        return res
            .set(
                "Content-Security-Policy",
                "script-src 'self' 'unsafe-inline' *"
            )
            .set("Cross-Origin-Embedder-Policy", "unsafe-none")
            .status(200)
            .render("post-view", { blog, post, homeUrl })
    }

    const prefix = req.domain || req.customSubdomain ? "" : `/${blog._id}`

    return res
        .set("Content-Security-Policy", "script-src 'self' 'unsafe-inline' *")
        .set("Cross-Origin-Embedder-Policy", "unsafe-none")
        .status(200)
        .render("blog-posts", { blog, prefix })
}
