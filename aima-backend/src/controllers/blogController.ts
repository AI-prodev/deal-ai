import { Response } from "express"
import { isValidObjectId } from "mongoose"
import * as fs from "fs"
import { randomUUID } from "crypto"
import Groq from "groq-sdk"
import BlogModel from "../models/Blog"
import DomainModel from "../models/domain"
import { RateLimitModel } from "../models/RateLimit"
import { IBlog } from "../types/IBlog"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { putObject } from "../services/files.service"

const isValidBlogTitle = (value?: string) =>
    Boolean(value) && value.length < 64 && value.length > 5

const isValidSubDomain = (value: string) =>
    /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(value)

export const createBlog = async (req: IExtendedRequest, res: Response) => {
    if (!isValidBlogTitle(req.body.title)) {
        return res.status(400).json({ error: "Invalid Blog title" })
    }

    if (req.body.subdomain && !isValidSubDomain(req.body.subdomain)) {
        return res.status(400).json({ error: "Invalid subdomain" })
    }

    try {
        const newBlog: IBlog = new BlogModel({
            user: req.user.id,
            title: req.body.title,
            domain: req.body.domain,
            // subdomain: req.body.subdomain,
            posts: req.body.posts || [],
            logoImage: req.body.logoImage
        })
        await newBlog.save()

        res.status(200).json(newBlog)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const updateBlog = async (req: IExtendedRequest, res: Response) => {
    try {
        const blogId = req.params.blogId

        if (req.body.subdomain) {
            if (!isValidSubDomain(req.body.subdomain)) {
                return res.status(400).json({ error: "Invalid subdomain" })
            }
            const exist = await BlogModel.findOne({
                subdomain: req.body.subdomain
            })
            if (exist) {
                return res
                    .status(400)
                    .json({ error: "Subdomain already in use" })
            }
        }

        if (req.body.domain) {
            if (!isValidObjectId(req.body.domain)) {
                return res.status(400).json({ error: "Invalid Domain" })
            }
            const exist = await BlogModel.findOne({
                domain: req.body.domain
            })
            if (exist) {
                return res.status(400).json({ error: "Domain already in use" })
            }
            const domain = await DomainModel.findById(req.body.domain)

            if (!domain) {
                return res.status(404).send("Domain not found")
            }
        }

        const blog = await BlogModel.findOne({
            _id: blogId,
            user: req.user.id
        })

        if (!blog) {
            return res
                .status(404)
                .json({ error: "Blog not found or user not authorized" })
        }

        await blog.updateOne(req.body)

        res.status(200).json({ message: "updated blog successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const updateBlogLogo = async (req: IExtendedRequest, res: Response) => {
    try {
        const blogId = req.params.blogId

        const blog = await BlogModel.findOne({
            _id: blogId,
            user: req.user.id
        })

        if (!blog) {
            return res
                .status(404)
                .json({ error: "Blog not found or user not authorized" })
        }

        const logo = req?.file

        if (!logo) {
            return res.status(400).json({ error: "Missing logo" })
        }

        const fileContent = fs.readFileSync(req.file.path)
        const fileKey = `${blogId}_${randomUUID()}_${req.file.originalname}`
        await putObject({
            Bucket: process.env.S3_UPLOADS_BUCKET,
            Key: fileKey,
            Body: fileContent,
            ContentType: req.file.mimetype
        })

        blog.logoImage = process.env.CLOUDFRONT_UPLOADS_PREFIX + `/${fileKey}`

        await blog.save()

        res.status(200).json(blog)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const deleteBlog = async (req: IExtendedRequest, res: Response) => {
    try {
        await BlogModel.deleteOne({
            _id: req.params.blogId,
            user: req.user.id
        }).exec()

        res.status(200).json()
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const deleteBlogLogo = async (req: IExtendedRequest, res: Response) => {
    try {
        const blogId = req.params.blogId

        const blog = await BlogModel.findOne({
            _id: blogId,
            user: req.user.id
        })

        if (!blog) {
            return res
                .status(404)
                .json({ error: "Blog not found or user not authorized" })
        }

        blog.logoImage = null

        await blog.save()

        res.status(200).json(blog)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getBlogs = async (req: IExtendedRequest, res: Response) => {
    try {
        const blogs = await BlogModel.find({}).sort("createdAt").exec()

        res.status(200).json(blogs)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getMyBlogs = async (req: IExtendedRequest, res: Response) => {
    try {
        const blogs = await BlogModel.find({ user: req.user.id }).exec()

        res.status(200).json(blogs)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getBlog = async (req: IExtendedRequest, res: Response) => {
    try {
        const blog = await BlogModel.findOne({
            _id: req.params.blogId
        })
            .populate("domain")
            .populate({
                path: "posts",
                options: { sort: { createdAt: -1 } }
            })
            .exec()

        res.status(200).json(blog)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

async function updateTokensUsed(userId: string, tokens: number) {
    const rateLimitData = await RateLimitModel.findOne({ userId: userId })

    if (!rateLimitData) {
        const newRateLimitData = new RateLimitModel({
            userId: userId,
            totalTokensUsed: tokens,
            lastTimeTotalTokensUsage: new Date()
        })
        await newRateLimitData.save()
    } else {
        rateLimitData.totalTokensUsed += tokens

        rateLimitData.lastTimeTotalTokensUsage = new Date()

        await rateLimitData.save()
    }
}

export const completeBlogPost = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const { content } = req.body
        const userId = req.user.id

        if (!content) {
            return res.status(500).json({
                error: "Missing content in the request body"
            })
        }

        const groq = new Groq()

        const params = {
            messages: [
                {
                    role: "system",
                    content: `
                        You are an expert blog writer known for crafting compelling, informative, and engaging blog posts. Your writing style is clear, concise, and captivating, keeping readers hooked from start to finish.

                        The user will provide you with the existing text of a blog post. Your task is to analyze the provided content and seamlessly continue the blog post, maintaining a consistent tone, style, and narrative flow. Focus on delivering valuable insights, unique perspectives, and actionable advice related to the blog post's topic.

                        When generating the blog post completion, consider the following:

                        1. Understand the main theme, purpose, and target audience of the blog post based on the provided text.
                        2. Ensure the completed blog post has a logical structure, smooth transitions between paragraphs, and a satisfying conclusion.
                        3. Use relevant examples, anecdotes, or statistics to support your points and keep the content engaging.
                        4. Maintain a friendly, conversational tone that resonates with the target audience.
                        5. In your response, only return the new content you generate. Do not include any extra text, such as "sure, here is your blog post," a title, or anything else. Simply provide the seamless continuation of the blog post.
                        6. Split your post into short paragraphs, and use the string \n\n to separate paragraphs in the response.
                    `
                },
                { role: "user", content }
            ],
            model: "mixtral-8x7b-32768"
        }

        const chatCompletion: Groq.Chat.ChatCompletion =
            await groq.chat.completions.create(params)

        const totalTokensUsed = chatCompletion.usage.total_tokens
            ? chatCompletion.usage.total_tokens
            : 0

        await updateTokensUsed(userId, totalTokensUsed)

        console.log(userId)

        res.status(200).json(chatCompletion)
    } catch (error) {
        console.error("Error completing blog post:", error)
        res.status(500).json({ error: "Server error" })
    }
}
