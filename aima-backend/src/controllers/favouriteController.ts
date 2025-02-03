import express, { Request, Response, NextFunction } from "express"

import { IExtendedRequest } from "../types/IExtendedRequest"
import { IFavorite } from "../models/favorite"
import favoriteService from "../services/favorite.service"

const isUserDefined = (
    req: IExtendedRequest
): req is IExtendedRequest & { user: { id: string } } => {
    return !!req.user
}

// Add a favorite to the user's profile
export const addFavorite = async (req: IExtendedRequest, res: Response) => {
    if (!isUserDefined(req)) {
        // console.log(req.user)
        return res.status(401).json({ error: "User not found" })
    }

    try {
        const favorite: IFavorite = req.body

        const addedFavorite = await favoriteService.addFavorite(
            req.user.id,
            favorite
        )
        return res.status(200).json(addedFavorite)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

// Remove a favorite from the user's profile
export const removeFavorite = async (req: IExtendedRequest, res: Response) => {
    if (!isUserDefined(req)) {
        return res.status(401).json({ error: "User not found" })
    }

    try {
        const favoriteId = req.params.favoriteId
        const removedFavorite = await favoriteService.removeFavorite(favoriteId)
        if (!removedFavorite) {
            return res.status(404).json({ error: "Favorite not found" })
        }
        return res.status(200).json(removedFavorite)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}

// Get all favorites for the user's profile
export const getFavorites = async (req: IExtendedRequest, res: Response) => {
    if (!isUserDefined(req)) {
        return res.status(401).json({ error: "User not found" })
    }

    try {
        const type = req.query.type as string
        if (type && typeof type !== "string") {
            return res.status(400).json({ error: "Invalid type" })
        }

        const favorites = await favoriteService.getFavoritesByUserId(
            req.user.id,
            type
        )
        return res.status(200).json(favorites)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Server error" })
    }
}
