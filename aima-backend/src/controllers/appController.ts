import { Response } from "express"
import AppModel from "../models/app"
import { IExtendedRequest } from "../types/IExtendedRequest"

export const getAvailableApps = async (req: IExtendedRequest, res: Response) => {
    try {
        const apps = await AppModel.find({ }).sort("ordering").exec()

        res.status(200).json(apps)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}
