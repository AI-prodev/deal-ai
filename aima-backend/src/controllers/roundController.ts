import express, { Request, Response } from "express"
import { IExtendedRequest } from "../types/IExtendedRequest"
import mongoose from "mongoose"
import CampaignAsset from "../models/campaignAssetSchema"
import RoundModel from "../models/round"
import { getAdInsights, getAdSetFromMeta } from "../utils/integrations/facebook"

export const getRounds = async (req: IExtendedRequest, res: Response) => {
    try {
        const rounds = await RoundModel.find({
            campaignId: req.query.campaignId
        })

        if (rounds?.length > 0) {
            for (const round of rounds) {
                const controlImage = await CampaignAsset.findOne({
                    _id: round.controlAssetAdSetId
                })

                const testImage = await CampaignAsset.findOne({
                    _id: round.testAssetAdSetId
                })

                const testAdSet = await getAdSetFromMeta(
                    req.query.accessToken.toString(),
                    round?.testAdSetId
                )

                const controlAdSet = await getAdSetFromMeta(
                    req.query.accessToken.toString(),
                    round?.controlAdSetId
                )

                const testInsight = await getAdInsights(
                    req.query.accessToken.toString(),
                    testAdSet?._data?.ads?.[0]?._data?.id
                )

                const controlInsight = await getAdInsights(
                    req.query.accessToken.toString(),
                    controlAdSet?._data?.ads?.[0]?._data?.id
                )

                if (testAdSet?.success) {
                    round.testAdSets = testAdSet?._data?.adSet?._data
                    round.testAdSets.ads = testAdSet?._data?.ads
                }

                if (controlAdSet?.success) {
                    round.controlAdSets = controlAdSet?._data?.adSet?._data
                    round.controlAdSets.ads = controlAdSet?._data?.ads
                }

                if (controlImage)
                    round.controlAdSets.imageUrl =
                        controlImage.scrollStopper.url

                if (testImage)
                    round.testAdSets.imageUrl = testImage.scrollStopper.url

                if (testInsight?.success) {
                    const data = testInsight?.data
                    if (Array.isArray(data) && data.length > 0) {
                        round.testAdSets.insights = data[0]?._data
                    }
                }

                if (controlInsight?.success) {
                    const data = controlInsight?.data
                    if (Array.isArray(data) && data.length > 0) {
                        round.controlAdSets.insights = data[0]?._data
                    }
                }
            }

            res.status(200).json(rounds)
        } else {
            return res.status(200).json([])
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}
