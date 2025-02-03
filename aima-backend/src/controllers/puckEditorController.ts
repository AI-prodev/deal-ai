import { Response } from "express"
import { setRedis, deleteRedis, getRedis } from "../services/redis.service"
import { IExtendedRequest } from "../types/IExtendedRequest"

export const copyComponent = async (req: IExtendedRequest, res: Response) => {
    try {
        const { element } = req.body
        const { pageId } = req.params
        const user = req.user

        if (!pageId) {
            return res.status(400).json({
                message: "No pageId provided"
            })
        }

        if (!element) {
            return res.status(400).json({
                message: "No element provided"
            })
        }

        const key = `user:${user.id}_page:${pageId}`

        await setRedis(key, JSON.stringify(element), 900) // 15 minutes

        res.status(200).json({
            message: "Component copied",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

export const getComponent = async (req: IExtendedRequest, res: Response) => {
    try {
        const { pageId } = req.params
        const user = req.user

        if (!pageId) {
            return res.status(400).json({
                message: "No pageId provided"
            })
        }

        const key = `user:${user.id}_page:${pageId}`

        const copiedElement = await getRedis(key)

        if (!copiedElement) {
            return res.status(404).json({
                element: {}
            })
        }

        res.status(200).json({
            element: JSON.parse(copiedElement),
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

export const deleteComponent = async (req: IExtendedRequest, res: Response) => {
    try {
        const { user } = req
        const { pageId } = req.params

        if (!pageId) {
            return res.status(400).json({
                message: "No pageId provided"
            })
        }

        const key = `user:${user.id}_page:${pageId}`

        await deleteRedis(key)

        res.status(200).json({
            message: "Component deleted",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

