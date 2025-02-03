import express, { Request, Response } from "express"
import { IExtendedRequest } from "../types/IExtendedRequest"
import CampaignModel from "../models/campaign"
import RoundModel from "../models/round"
import CampaignAsset from "../models/campaignAssetSchema"
import {
    updateAdAtMeta,
    activeAdSetAtMeta,
    createAdAtMeta,
    createAdSetAtMeta,
    createCampaignAtMeta,
    deleteCampaignAtMeta,
    updateAdSetAtMeta
} from "../utils/integrations/facebook"
import mongoose from "mongoose"

export const createCampaign = async (req: IExtendedRequest, res: Response) => {
    try {
        const campaign = await createCampaignAtMeta(
            req.body.accessToken,
            req.body.adAccountId,
            req.body.title,
            req.body.objective
        )

        if (campaign._data?.length !== 0) {
            const newCampaign = new CampaignModel({
                user: req.user.id,
                businessId: req?.body?.businessId,
                fbCampaignId: campaign?._data?.id,
                ...req.body
            })
            await newCampaign.save()
            res.status(201).json(newCampaign)
        } else {
            res.status(500).json({ error: campaign.message })
        }
    } catch (error) {
        res.status(500).json({ error: "Server error" })
    }
}

export const getCampaign = async (req: IExtendedRequest, res: Response) => {
    try {
        const campaignId = new mongoose.Types.ObjectId(req.params.campaignId)

        const campaign = await CampaignModel.aggregate([
            {
                $match: {
                    _id: campaignId
                }
            },
            {
                $lookup: {
                    from: "businessmodels",
                    localField: "businessId",
                    foreignField: "businessId",
                    as: "businessDetails"
                }
            },
            { $unwind: "$businessDetails" },
            {
                $lookup: {
                    from: "accountmodels",
                    localField: "businessDetails.accountId",
                    foreignField: "_id",
                    as: "businessDetails.accountDetails"
                }
            },
            { $unwind: "$businessDetails.accountDetails" }
        ])

        if (!campaign || campaign.length === 0) {
            return res.status(404).json({ error: "Campaign not found" })
        }

        res.status(200).json(campaign[0]) // Assuming you only want one campaign
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getUserCampaigns = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const campaigns = await CampaignModel.find({ user: req.user.id }).exec()
        res.status(200).json(campaigns)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const updateCampaign = async (req: IExtendedRequest, res: Response) => {
    try {
        const campaignId = new mongoose.Types.ObjectId(req.params.campaignId)

        const campaign = await CampaignModel.findOne({ _id: campaignId })

        const round = await RoundModel.findOne({
            campaignId: campaignId,
            sequence: campaign?.currentRound + 1
        })

        if (round?._id) {
            const updatedRound = await RoundModel.findOneAndUpdate(
                { _id: round?._id },
                {
                    fbCampaignId: req.body.fbCampaignId,
                    campaignId: campaignId,
                    budget: req.body?.budget,
                    sequence: campaign?.currentRound + 1,
                    billingEvent: req.body.billingEvent,
                    optimizationGoal: req.body.optimizationGoal,
                    pageId: req.body.pageId
                }
            )

            // Update the Test Ad Set
            const updatedTestAdSet = await updateAdSetAtMeta(
                req.body.accessToken,
                updatedRound?.testAdSetId, // Use the stored testAdSetId
                req.body.targeting,
                req.body?.budget * 100 * 0.25,
                req.body.billingEvent,
                req.body.optimizationGoal
            )

            if (updatedTestAdSet.success) {
                // Update the Control Ad Set
                const updatedControlAdSet = await updateAdSetAtMeta(
                    req.body.accessToken,
                    updatedRound?.controlAdSetId, // Use the stored controlAdSetId
                    req.body.targeting,
                    req.body?.budget * 100 * 0.75,
                    req.body.billingEvent,
                    req.body.optimizationGoal
                )

                if (updatedControlAdSet.success) {
                    const updatedCampaign =
                        await CampaignModel.findByIdAndUpdate(
                            req.params.campaignId,
                            { $set: req.body },
                            { new: true }
                        )

                    if (!updatedCampaign) {
                        return res
                            .status(404)
                            .json({ error: "Campaign not found" })
                    }

                    res.status(200).json(updatedCampaign)
                } else {
                    // Handle the case where the control Ad Set update failed
                    res.status(500).json({
                        error: updatedControlAdSet.message
                    })
                }
            } else {
                // Handle the case where the test Ad Set update failed
                res.status(500).json({
                    error: updatedTestAdSet.message
                })
            }
        } else {
            const roundObjectId = new mongoose.Types.ObjectId()

            const testAdSet = await createAdSetAtMeta(
                req.body.accessToken,
                req.body.adAccountId,
                req.body.fbCampaignId,
                "Test Ad Set",
                req.body.targeting,
                req.body?.budget * 100 * 0.25,
                req.body.billingEvent,
                req.body.optimizationGoal
            )
            if (testAdSet._data?.length !== 0) {
                const controlAdSet = await createAdSetAtMeta(
                    req.body.accessToken,
                    req.body.adAccountId,
                    req.body.fbCampaignId,
                    "Control Ad Set",
                    req.body.targeting,
                    req.body?.budget * 100 * 0.75,
                    req.body.billingEvent,
                    req.body.optimizationGoal
                )

                if (controlAdSet._data?.length !== 0) {
                    await RoundModel.create({
                        _id: roundObjectId.toString(),
                        fbCampaignId: req.body.fbCampaignId,
                        campaignId: campaignId,
                        budget: req.body?.budget,
                        sequence: campaign?.currentRound + 1,
                        billingEvent: req.body.billingEvent,
                        optimizationGoal: req.body.optimizationGoal,
                        testAdSetId: testAdSet?._data?._data.id,
                        controlAdSetId: controlAdSet?._data?._data.id,
                        pageId: req.body.pageId
                    })

                    const updatedCampaign =
                        await CampaignModel.findByIdAndUpdate(
                            req.params.campaignId,
                            { $set: req.body },
                            { new: true }
                        )
                    if (!updatedCampaign) {
                        return res
                            .status(404)
                            .json({ error: "Campaign not found" })
                    }
                    res.status(200).json(updatedCampaign)
                } else {
                    res.status(500).json({ error: controlAdSet?.message })
                }
            } else {
                res.status(500).json({ error: testAdSet?.message })
            }
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const updateCampaignAutopilot = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const updatedCampaign = await CampaignModel.findByIdAndUpdate(
            req.params.campaignId,
            { $set: req.body },
            { new: true }
        )

        if (!updatedCampaign) {
            return res.status(404).json({ error: "Campaign not found" })
        }

        res.status(200).json(updatedCampaign)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const deleteCampaign = async (req: IExtendedRequest, res: Response) => {
    try {
        const campaign = await deleteCampaignAtMeta(
            req.query.accessToken.toString(),
            req.query.fbCampaignId.toString()
        )

        if (campaign.success) {
            const result = await CampaignModel.deleteOne({
                _id: req.params.campaignId,
                user: req.user.id
            }).exec()
            if (result.deletedCount === 0) {
                return res
                    .status(404)
                    .json({ error: "Campaign not found or user mismatch" })
            }
            res.status(200).json({ message: "Campaign deleted successfully" })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const createCampaignAsset = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const campaign = await CampaignModel.findOne({ _id: req.body.campaign })

        const round = await RoundModel.findOne({
            campaignId: req.body.campaign?._id,
            testAssetAdSetId: { $exists: true },
            controlAssetAdSetId: { $exists: true }
        })

        const assetId = new mongoose.Types.ObjectId()

        if (round && round.isActive) {
            const newAsset = new CampaignAsset({
                _id: assetId,
                user: req.user.id,
                campaign: req.body.campaign,
                scrollStopper: req.body.scrollStopper,
                magicHook: req.body.magicHook
            })
            await newAsset.save()
            res.status(201).json(newAsset)
        } else {
            const asset = await CampaignAsset.find({
                campaign: req.body.campaign?._id,
                currentRound: campaign?.currentRound + 1
            })

            if (asset?.length === 0) {
                const rounds = await RoundModel.findOne({
                    campaignId: req.body.campaign?._id,
                    sequence: campaign?.currentRound + 1
                })
                const newAsset = new CampaignAsset({
                    _id: assetId,
                    user: req.user.id,
                    campaign: req.body.campaign?._id,
                    scrollStopper: req.body.scrollStopper,
                    magicHook: req.body.magicHook,
                    type: "Control Ad",
                    currentRound: campaign?.currentRound + 1
                })

                const ad = await createAdAtMeta(
                    req?.body.accessToken,
                    campaign?.adAccountId,
                    rounds?.controlAdSetId,
                    campaign?.pageId,
                    `${campaign?.title + " Control Ad"}`,
                    newAsset.scrollStopper.url,
                    campaign.headline,
                    campaign.targetURL
                )

                const isActive = await updateAdAtMeta(
                    req?.body.accessToken,
                    ad?._data?._data?.id,
                    "ACTIVE"
                )

                if (ad?.success && isActive.success) {
                    rounds.controlAssetAdSetId = newAsset?.id
                    await rounds.save()
                    await newAsset.save()
                    res.status(201).json(newAsset)
                } else {
                    res.status(400).json({ error: ad?.message })
                }
            } else {
                const rounds = await RoundModel.findOne({
                    campaignId: req.body.campaign?._id,
                    sequence: campaign?.currentRound + 1
                })
                const newAsset = new CampaignAsset({
                    _id: assetId,
                    user: req.user.id,
                    campaign: req.body.campaign,
                    scrollStopper: req.body.scrollStopper,
                    magicHook: req.body.magicHook,
                    type: "Test Ad",
                    currentRound: campaign?.currentRound + 1
                })

                const ad = await createAdAtMeta(
                    req?.body.accessToken,
                    campaign?.adAccountId,
                    rounds?.testAdSetId,
                    campaign?.pageId,
                    `${campaign?.title + " Test Ad"}`,
                    newAsset.scrollStopper.url,
                    campaign.headline,
                    campaign.targetURL
                )

                const isActive = await updateAdAtMeta(
                    req?.body.accessToken,
                    ad?._data?._data?.id,
                    "ACTIVE"
                )

                if (ad?.success && isActive.success) {
                    await activeAdSetAtMeta(
                        req?.body.accessToken,
                        round?.controlAdSetId
                    )

                    await activeAdSetAtMeta(
                        req?.body.accessToken,
                        round?.testAdSetId
                    )

                    campaign.currentRound = campaign.currentRound + 1
                    rounds.isActive = true

                    await campaign.save()
                    rounds.testAssetAdSetId = newAsset?.id
                    await rounds.save()
                    await newAsset.save()

                    res.status(201).json(newAsset)
                } else {
                    res.status(400).json({ error: ad?.message })
                }
            }
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getCampaignAsset = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const asset = await CampaignAsset.findById(req.params.assetId).exec()
        if (!asset) {
            return res.status(404).json({ error: "Asset not found" })
        }
        res.status(200).json(asset)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getCampaignAssets = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const assets = await CampaignAsset.find({
            campaign: req.params.campaignId,
            user: req.user.id,
            isDeleted: { $ne: true }
        }).exec()
        res.status(200).json(assets)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}
export const updateCampaignAsset = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const updatedAsset = await CampaignAsset.findByIdAndUpdate(
            req.params.assetId,
            { $set: req.body },
            { new: true }
        )
        if (!updatedAsset) {
            return res.status(404).json({ error: "Asset not found" })
        }
        res.status(200).json(updatedAsset)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const deleteCampaignAsset = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const result = await CampaignAsset.findByIdAndUpdate(
            {
                _id: req.params.assetId,
                user: req.user.id
            },
            {
                isDeleted: true
            },
            { new: true }
        )
        if (!result) {
            return res
                .status(404)
                .json({ error: "Asset not found or user mismatch" })
        }
        res.status(200).json({ message: "Asset deleted successfully" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
}
