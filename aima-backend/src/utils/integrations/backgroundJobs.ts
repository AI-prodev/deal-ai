import RoundModel from "../../models/round"
import CampaignModel from "../../models/campaign"
import mongoose from "mongoose"
import CampaignAsset from "../../models/campaignAssetSchema"
import CampaignAssetInputs from "../../models/campaignAssetInput"
import { setRedis } from "../../services/redis.service"
import { v4 as uuidv4 } from "uuid"
import { processAdSocialImageRequest } from "../../utils/processRequestAdSocialImage"
import { AdSocialImageInput } from "../../types/query"

import {
    getAdInsights,
    getAdSetFromMeta,
    createAdAtMeta,
    updateAdAtMeta
} from "./facebook"

export const getInsightsBackground = async () => {
    const rounds = await RoundModel.find({ isActive: true })
    const roundObjectId = new mongoose.Types.ObjectId()
    let controllInsightData
    let testInsightData

    for (const round of rounds) {
        try {
            const aggregationPipeline = [
                {
                    $match: { _id: round.campaignId }
                },
                {
                    $lookup: {
                        from: "businessmodels", // Replace with the actual name of the BusinessModel collection
                        localField: "businessId",
                        foreignField: "businessId",
                        as: "businessInfo"
                    }
                },
                {
                    $unwind: "$businessInfo"
                },
                {
                    $lookup: {
                        from: "accountmodels", // Replace with the actual name of the AccountModel collection
                        localField: "businessInfo.accountId",
                        foreignField: "_id",
                        as: "accountInfo"
                    }
                },
                {
                    $unwind: "$accountInfo"
                },
                {
                    $project: {
                        accessToken: "$accountInfo.accessToken",
                        currentRound: 1,
                        adAccountId: 1,
                        pageId: 1,
                        title: 1,
                        headline: 1,
                        targetURL: 1,
                        enableAutoPilot: 1,
                        user: 1
                    }
                }
            ]

            const campaignInfo = await CampaignModel.aggregate(
                aggregationPipeline
            )

            const testAdSet = await getAdSetFromMeta(
                campaignInfo?.[0]?.accessToken.toString(),
                round?.testAdSetId
            )

            const controlAdSet = await getAdSetFromMeta(
                campaignInfo?.[0]?.accessToken.toString(),
                round?.controlAdSetId
            )

            const testInsight = await getAdInsights(
                campaignInfo?.[0]?.accessToken.toString(),
                testAdSet?._data?.ads?.[0]?._data?.id
            )

            const controlInsight = await getAdInsights(
                campaignInfo?.[0]?.accessToken.toString(),
                controlAdSet?._data?.ads?.[0]?._data?.id
            )

            if (testInsight?.success) {
                const data = testInsight?.data
                if (Array.isArray(data) && data.length > 0) {
                    testInsightData = data[0]?._data
                }
            }

            if (controlInsight?.success) {
                const data = testInsight?.data
                if (Array.isArray(data) && data.length > 0) {
                    controllInsightData = data[0]?._data
                }
            }

            const testInsightClicksAsInteger = parseInt(
                testInsightData?.clicks || "0",
                10
            )

            const controllInsightClicksAsInteger = parseInt(
                controllInsightData?.clicks || "0",
                10
            )

            const campaignAssetNextRound = await CampaignAsset.findOne({
                campaign: campaignInfo?.[0]?._id,
                type: { $exists: false },
                currentRound: 0, // check if next asset exists
                isDeleted: false
            })

            if (
                campaignInfo?.[0]?.enableAutoPilot &&
                (campaignAssetNextRound === null ||
                    !campaignAssetNextRound ||
                    campaignAssetNextRound === undefined)
            ) {
                const autopilotInputs = (await CampaignAssetInputs.findOne({
                    campaignId: campaignInfo?.[0]?._id
                })) as AdSocialImageInput
                if (autopilotInputs) {
                    const token = `pending-request:${uuidv4()}`

                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    //@ts-ignore
                    const userId = campaignInfo?.[0]?.user

                    setRedis(
                        token,
                        JSON.stringify({
                            status: "processing",
                            progress: 0,
                            input: autopilotInputs
                        })
                    )

                    const input = autopilotInputs

                    processAdSocialImageRequest(input, token, userId)
                }
            }

            if (
                controlInsight?.success &&
                testInsight?.success &&
                testInsightClicksAsInteger + controllInsightClicksAsInteger >=
                    1000
            ) {
                await RoundModel.findOneAndUpdate(
                    { _id: round?._id },
                    {
                        $set: { isActive: false } // inActive the current round
                    }
                )

                const campaignAssetNextRound = await CampaignAsset.findOne({
                    campaign: campaignInfo?.[0]?._id,
                    type: { $exists: false },
                    currentRound: 0, // check if next asset exists
                    isDeleted: false
                })

                if (campaignAssetNextRound) {
                    if (
                        controllInsightClicksAsInteger >
                        testInsightClicksAsInteger
                    ) {
                        const campaignAssetCurrentRound =
                            await CampaignAsset.findOne(
                                // controlAdSetId is winner and update its currentRound to next
                                {
                                    campaign: campaignInfo?.[0]?._id,
                                    _id: round?.controlAssetAdSetId
                                }
                            )

                        await RoundModel.findOneAndUpdate(
                            { _id: round?._id },
                            {
                                $set: { isActive: false }, // inActive the current round
                                winnerId: campaignAssetCurrentRound?._id
                            }
                        )

                        const inActiveControlAd = await updateAdAtMeta(
                            campaignInfo?.[0]?.accessToken.toString(),
                            controlAdSet?._data?.ads?.[0]?._data?.id,
                            "PAUSED"
                        )

                        const inActiveTestAd = await updateAdAtMeta(
                            campaignInfo?.[0]?.accessToken.toString(),
                            testAdSet?._data?.ads?.[0]?._data?.id,
                            "PAUSED"
                        )

                        if (
                            inActiveTestAd?.success &&
                            inActiveControlAd?.success
                        ) {
                            const adControl = await createAdAtMeta(
                                campaignInfo?.[0]?.accessToken.toString(),
                                campaignInfo?.[0]?.adAccountId,
                                round?.testAdSetId,
                                campaignInfo?.[0]?.pageId,
                                `${campaignInfo?.[0]?.title + " Test Ad"}`,
                                campaignAssetCurrentRound.scrollStopper.url,
                                campaignInfo?.[0]?.headline,
                                campaignInfo?.[0]?.targetURL
                            )

                            const isActiveControl = await updateAdAtMeta(
                                campaignInfo?.[0]?.accessToken.toString(),
                                adControl?._data?._data?.id,
                                "ACTIVE"
                            )

                            const adTest = await createAdAtMeta(
                                campaignInfo?.[0]?.accessToken.toString(),
                                campaignInfo?.[0]?.adAccountId,
                                round?.testAdSetId,
                                campaignInfo?.[0]?.pageId,
                                `${campaignInfo?.[0]?.title + " Test Ad"}`,
                                campaignAssetNextRound.scrollStopper.url,
                                campaignInfo?.[0]?.headline,
                                campaignInfo?.[0]?.targetURL
                            )

                            const isActiveTest = await updateAdAtMeta(
                                campaignInfo?.[0]?.accessToken.toString(),
                                adTest?._data?._data?.id,
                                "ACTIVE"
                            )

                            if (
                                adTest?.success &&
                                isActiveTest.success &&
                                adControl?.success &&
                                isActiveControl.success
                            ) {
                                const updatedControlAsset =
                                    await CampaignAsset.findOneAndUpdate(
                                        {
                                            _id: campaignAssetCurrentRound
                                        },
                                        {
                                            currentRound:
                                                campaignAssetCurrentRound?.currentRound +
                                                1 // Increment the current round with 1
                                        },
                                        {
                                            new: true
                                        }
                                    )

                                await CampaignAsset.findOneAndUpdate(
                                    {
                                        campaign: campaignInfo?.[0]?._id,
                                        _id: round?.testAssetAdSetId
                                    },
                                    {
                                        isDeleted: true // Soft delete the asset of test
                                    }
                                )

                                const updatedTestAsset =
                                    await CampaignAsset.findOneAndUpdate(
                                        {
                                            _id: campaignAssetNextRound._id
                                        },
                                        {
                                            currentRound:
                                                campaignAssetCurrentRound?.currentRound +
                                                1,
                                            $set: { type: "Test Ad" } // Use $set to set the 'type' field
                                        },
                                        {
                                            new: true
                                        }
                                    )

                                const newControlAssetAdSetId =
                                    updatedControlAsset?._id
                                const newTestAssetAdSetId =
                                    updatedTestAsset?._id

                                await RoundModel.create({
                                    // create the next round
                                    _id: roundObjectId.toString(),
                                    fbCampaignId: round?.fbCampaignId,
                                    campaignId: round.campaignId,
                                    budget: round?.budget,
                                    sequence: round?.sequence + 1,
                                    billingEvent: round?.billingEvent,
                                    optimizationGoal: round?.optimizationGoal,
                                    testAdSetId: round?.testAdSetId,
                                    controlAdSetId: round?.controlAdSetId,
                                    controlAssetAdSetId: newControlAssetAdSetId,
                                    testAssetAdSetId: newTestAssetAdSetId,
                                    isActive: true
                                })

                                await CampaignModel.findOneAndUpdate(
                                    {
                                        _id: campaignInfo?.[0]?._id
                                    },
                                    {
                                        currentRound:
                                            campaignAssetCurrentRound?.currentRound +
                                            1
                                    }
                                )
                            } else {
                                await updateAdAtMeta(
                                    campaignInfo?.[0]?.accessToken.toString(),
                                    controlAdSet?._data?.ads?.[0]?._data?.id,
                                    "ACTIVE"
                                )

                                await updateAdAtMeta(
                                    campaignInfo?.[0]?.accessToken.toString(),
                                    testAdSet?._data?.ads?.[0]?._data?.id,
                                    "ACTIVE"
                                )
                            }
                        }
                    } else {
                        const inActiveControlAd = await updateAdAtMeta(
                            campaignInfo?.[0]?.accessToken.toString(),
                            controlAdSet?._data?.ads?.[0]?._data?.id,
                            "PAUSED"
                        )

                        const inActiveTestAd = await updateAdAtMeta(
                            campaignInfo?.[0]?.accessToken.toString(),
                            testAdSet?._data?.ads?.[0]?._data?.id,
                            "PAUSED"
                        )
                        if (
                            inActiveControlAd?.success &&
                            inActiveTestAd.success
                        ) {
                            const campaignAssetCurrentRound =
                                await CampaignAsset.findOne(
                                    // get the test ad set from assets
                                    {
                                        campaign: campaignInfo?.[0]?._id,
                                        _id: round?.testAssetAdSetId
                                    }
                                )
                            await RoundModel.findOneAndUpdate(
                                { _id: round?._id },
                                {
                                    winnerId: campaignAssetCurrentRound?._id
                                }
                            )

                            const adTest = await createAdAtMeta(
                                campaignInfo?.[0]?.accessToken.toString(),
                                campaignInfo?.[0]?.adAccountId,
                                round?.controlAdSetId,
                                campaignInfo?.[0]?.pageId,
                                `${campaignInfo?.[0]?.title + " Test Ad"}`,
                                campaignAssetCurrentRound.scrollStopper.url,
                                campaignInfo?.[0]?.headline,
                                campaignInfo?.[0]?.targetURL
                            )

                            const isActiveTest = await updateAdAtMeta(
                                campaignInfo?.[0]?.accessToken.toString(),
                                adTest?._data?._data?.id,
                                "ACTIVE"
                            )

                            const adControll = await createAdAtMeta(
                                campaignInfo?.[0]?.accessToken.toString(),
                                campaignInfo?.[0]?.adAccountId,
                                round?.testAdSetId,
                                campaignInfo?.[0]?.pageId,
                                `${campaignInfo?.[0]?.title + " Control Ad"}`,
                                campaignAssetNextRound.scrollStopper.url,
                                campaignInfo?.[0]?.headline,
                                campaignInfo?.[0]?.targetURL
                            )

                            const isActiveControl = await updateAdAtMeta(
                                campaignInfo?.[0]?.accessToken.toString(),
                                adControll?._data?._data?.id,
                                "ACTIVE"
                            )

                            if (
                                adControll?.success &&
                                isActiveControl.success &&
                                adTest?.success &&
                                isActiveTest.success
                            ) {
                                await CampaignAsset.findOneAndUpdate(
                                    {
                                        campaign: campaignInfo?.[0]?._id,
                                        _id: round?.controlAssetAdSetId
                                    },
                                    {
                                        isDeleted: true // Soft delete the asset of Controll
                                    }
                                )

                                const updatedControlAsset =
                                    await CampaignAsset.findOneAndUpdate(
                                        // increase testAd set round and its type to Control
                                        {
                                            _id: campaignAssetCurrentRound
                                        },
                                        {
                                            currentRound:
                                                campaignAssetCurrentRound?.currentRound +
                                                1,
                                            $set: { type: "Control Ad" } // Use $set to set the 'type' field
                                        },
                                        {
                                            new: true
                                        }
                                    )

                                const updatedTestAsset =
                                    await CampaignAsset.findOneAndUpdate(
                                        {
                                            _id: campaignAssetNextRound._id
                                        },
                                        {
                                            currentRound:
                                                campaignAssetCurrentRound?.currentRound +
                                                1, // create new Adset of testAd from asset
                                            $set: { type: "Test Ad" }
                                        },
                                        {
                                            new: true
                                        }
                                    )

                                const newControlAssetAdSetId =
                                    updatedControlAsset?._id
                                const newTestAssetAdSetId =
                                    updatedTestAsset?._id

                                await RoundModel.create({
                                    // create the next round
                                    _id: roundObjectId.toString(),
                                    fbCampaignId: round?.fbCampaignId,
                                    campaignId: round.campaignId,
                                    budget: round?.budget,
                                    sequence: round?.sequence + 1,
                                    billingEvent: round?.billingEvent,
                                    optimizationGoal: round?.optimizationGoal,
                                    testAdSetId: round?.testAdSetId,
                                    controlAdSetId: round?.controlAdSetId,
                                    controlAssetAdSetId: newControlAssetAdSetId,
                                    testAssetAdSetId: newTestAssetAdSetId,
                                    isActive: true
                                })

                                await CampaignModel.findOneAndUpdate(
                                    {
                                        _id: campaignInfo?.[0]?._id
                                    },
                                    {
                                        currentRound:
                                            campaignAssetCurrentRound?.currentRound +
                                            1
                                    }
                                )
                            }
                        }
                    }
                } else {
                    if (
                        controllInsightClicksAsInteger >
                        testInsightClicksAsInteger
                    ) {
                        const campaignAssetCurrentRound =
                            await CampaignAsset.findOne(
                                // controlAdSetId is winner and update its currentRound to next
                                {
                                    campaign: campaignInfo?.[0]?._id,
                                    _id: round?.controlAssetAdSetId
                                }
                            )

                        await RoundModel.findOneAndUpdate(
                            { _id: round?._id },
                            {
                                $set: { isActive: false }, // inActive the current round
                                winnerId: campaignAssetCurrentRound?._id
                            }
                        )
                        await updateAdAtMeta(
                            campaignInfo?.[0]?.accessToken.toString(),
                            controlAdSet?._data?.ads?.[0]?._data?.id,
                            "PAUSED"
                        )

                        await updateAdAtMeta(
                            campaignInfo?.[0]?.accessToken.toString(),
                            testAdSet?._data?.ads?.[0]?._data?.id,
                            "PAUSED"
                        )
                    } else {
                        const campaignAssetCurrentRound =
                            await CampaignAsset.findOne(
                                // get the test ad set from assets
                                {
                                    campaign: campaignInfo?.[0]?._id,
                                    _id: round?.testAssetAdSetId
                                }
                            )
                        await RoundModel.findOneAndUpdate(
                            { _id: round?._id },
                            {
                                winnerId: campaignAssetCurrentRound?._id
                            }
                        )
                        await updateAdAtMeta(
                            campaignInfo?.[0]?.accessToken.toString(),
                            controlAdSet?._data?.ads?.[0]?._data?.id,
                            "PAUSED"
                        )

                        await updateAdAtMeta(
                            campaignInfo?.[0]?.accessToken.toString(),
                            testAdSet?._data?.ads?.[0]?._data?.id,
                            "PAUSED"
                        )
                    }
                }
            }
        } catch (error) {
            continue
        }
    }
}
