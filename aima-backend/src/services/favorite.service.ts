import Favorite, { IFavorite } from "../models/favorite"
import { IUser } from "../types/IUser"

const addFavorite = async (
    userId: IUser["_id"],
    favorite: IFavorite
): Promise<IFavorite> => {
    favorite.user = userId
    return Favorite.create(favorite)
}

const removeFavorite = async (
    favoriteId: string
): Promise<IFavorite | null> => {
    return Favorite.findByIdAndRemove(favoriteId)
}

const getFavoritesByUserId = async (
    userId: IUser["_id"],
    type?: string
): Promise<IFavorite[]> => {
    if (type) {
        return Favorite.find({ user: userId, type: type })
    } else {
        return Favorite.find({ user: userId })
    }
}
export default {
    addFavorite,
    removeFavorite,
    getFavoritesByUserId
}
