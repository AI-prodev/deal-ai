/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from "express"
import AppsProject from "../models/appProject"
import { IExtendedRequest } from "../types/IExtendedRequest"
import mongoose, { Types } from "mongoose"
import creation from "../models/creation"

interface UpdateSpecificAppsProjectRequestBody {
    projectId: Types.ObjectId
    applications: {
        appName: string
        generations: {
            generationNumber: number
            creations: Types.ObjectId[]
        }[]
    }[]
}

export const migrateDataToAppsProject = async (
    req: IExtendedRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user.id
        const { applications } = req.body

        let defaultProject = await AppsProject.findOne({
            user: userId,
            name: "default"
        })

        if (!defaultProject) {
            const newProject = new AppsProject({
                name: "default",
                user: userId,
                applications
            })
            await newProject.save()
            res.status(201).json({
                message:
                    "Default project created and data migrated successfully"
            })
        } else {
            let success = false
            let attempts = 0
            while (!success && attempts < 3) {
                try {
                    applications.forEach(async (incomingApp: any) => {
                        const existingAppIndex =
                            await defaultProject.applications.findIndex(
                                (app) => app.appName === incomingApp.appName
                            )
                        const defaultAppName =
                            await defaultProject.applications.find(
                                (app) => app.appName === incomingApp.appName
                            )

                        if (existingAppIndex > -1) {
                            const existingApp =
                                defaultProject.applications[existingAppIndex]

                            if (incomingApp.generations) {
                                incomingApp.generations.forEach(
                                    (incomingGen: any) => {
                                        const existingGenIndex =
                                            existingApp.generations.findIndex(
                                                (gen) =>
                                                    gen.generationNumber ===
                                                    incomingGen.generationNumber
                                            )
                                        if (existingGenIndex > -1) {
                                            const existingGen =
                                                existingApp.generations[
                                                    existingGenIndex
                                                ]
                                            existingGen.creations.push(
                                                ...incomingGen.creations
                                            )
                                        } else {
                                            existingApp.generations.push(
                                                incomingGen
                                            )
                                        }
                                    }
                                )
                            } else if (
                                incomingApp.contentItems &&
                                incomingApp.contentItems.length > 0
                            ) {
                                incomingApp.contentItems.forEach(
                                    (section: any, index: number) => {
                                        const existingGenIndex =
                                            defaultAppName.generations.findIndex(
                                                (gen) =>
                                                    gen.contentItemsId ===
                                                    section.id
                                            )
                                        if (existingGenIndex === -1) {
                                            const contentItemsGeneration = {
                                                generationNumber:
                                                    existingApp.generations
                                                        .length +
                                                    1 +
                                                    index,
                                                contentItemsId: section.id,
                                                contentItems: [] as any[]
                                            }

                                            Object.entries(section).forEach(
                                                ([key, value]) => {
                                                    if (
                                                        key !== "id" &&
                                                        key !== "isLoading" &&
                                                        Array.isArray(
                                                            (value as any)
                                                                .content
                                                        )
                                                    ) {
                                                        const contentIds = (
                                                            value as any
                                                        ).content.map(
                                                            (item: any) =>
                                                                item.id
                                                        )
                                                        contentItemsGeneration.contentItems.push(
                                                            {
                                                                name: key,
                                                                contentId:
                                                                    contentIds
                                                            }
                                                        )
                                                    }
                                                }
                                            )
                                        }
                                    }
                                )
                            }
                        } else {
                            if (
                                incomingApp.contentItems &&
                                incomingApp.contentItems.length > 0
                            ) {
                                const genrationData = [] as any

                                incomingApp.contentItems.forEach(
                                    (section: any, index: number) => {
                                        const contentItemsGeneration = {
                                            generationNumber: index + 1,
                                            contentItemsId: section.id,
                                            contentItems: [] as any
                                        }
                                        Object.entries(section).forEach(
                                            ([key, value]) => {
                                                if (
                                                    key !== "id" &&
                                                    key !== "isLoading" &&
                                                    Array.isArray(
                                                        (value as any).content
                                                    )
                                                ) {
                                                    const contentIds = (
                                                        value as any
                                                    ).content.map(
                                                        (item: any) => item.id
                                                    )

                                                    const isValidContentIds =
                                                        contentIds.some(
                                                            (id: string) =>
                                                                id !== undefined
                                                        )

                                                    if (isValidContentIds) {
                                                        contentItemsGeneration.contentItems.push(
                                                            {
                                                                name: key,
                                                                contentId:
                                                                    contentIds
                                                            }
                                                        )
                                                    }
                                                }
                                            }
                                        )
                                        if (
                                            contentItemsGeneration.contentItems
                                                .length > 0
                                        ) {
                                            genrationData.push(
                                                contentItemsGeneration
                                            )
                                        }
                                    }
                                )
                                const findData = {
                                    appName: incomingApp.appName,
                                    generations: genrationData as any
                                }

                                defaultProject.applications.push(findData)
                            } else {
                                defaultProject.applications.push(incomingApp)
                            }
                        }
                    })

                    success = true
                    await defaultProject.save()
                    // res.status(200).json({
                    //     success: true,
                    //     message: "Default project updated successfully"
                    // })
                } catch (error) {
                    if (error.name === "VersionError") {
                        attempts++
                        console.log(
                            `Attempt ${attempts}: Retrying after VersionError`
                        )

                        defaultProject = await AppsProject.findOne({
                            user: userId,
                            name: "default"
                        })

                        if (!defaultProject) {
                            throw new Error("Default project no longer exists.")
                        }
                    } else {
                        console.error(
                            "Error in migrateDataToAppsProject:",
                            error
                        )
                        res.status(500).json({ error: error.message })
                    }
                }
            }

            if (success) {
                res.status(200).json({
                    success: true,
                    message: "Default project updated successfully"
                })
            } else {
                res.status(500).json({
                    error: "Failed to update the default project after multiple attempts."
                })
            }
        }
    } catch (error) {
        console.error("Error in migrateDataToAppsProject:", error)
        res.status(500).json({ error: error.message })
    }
}

export const loadDefaultAppsProject = async (
    req: IExtendedRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user.id
        let defaultProject = await AppsProject.findOne({
            user: userId,
            name: "default"
        }).select("_id applications")
        // .populate({
        //     path: "applications.generations",
        //     populate: [
        //         {
        //             path: "creations",
        //             model: "Creation"
        //         },
        //         {
        //             path: "contentItems.contentId",
        //             model: "Creation"
        //         }
        //     ]
        // })

        if (!defaultProject) {
            const newDefaultProject = new AppsProject({
                name: "default",
                user: userId
            })

            defaultProject = await newDefaultProject.save()

            defaultProject = await AppsProject.populate(defaultProject, {
                path: "applications.generations",
                populate: [
                    {
                        path: "creations",
                        model: "Creation"
                    },
                    {
                        path: "contentItems.contentId",
                        model: "Creation"
                    }
                ]
            })

            res.status(201).json(defaultProject)
        } else {
            res.status(200).json(defaultProject)
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const updateAppsProject = async (
    req: IExtendedRequest,
    res: Response
): Promise<void> => {
    const userId = req.user.id
    try {
        const projectId = req.params.projectId
        const { applications, name } = req.body
        const project = await AppsProject.findOne({
            _id: projectId,
            user: userId
        })

        if (!project) {
            res.status(404).json({ message: "Project not found" })
        } else {
            if (project.name !== "default") {
                if (name.toLowerCase() === "default") {
                    res.status(400).json({
                        error: "The name 'default' is reserved for the default project"
                    })
                } else {
                    project.name = name
                    await project.save()
                    res.status(200).json({
                        message: "Project updated successfully"
                    })
                }
            } else {
                res.status(400).json({
                    error: "Cannot update default project name"
                })
            }
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const createAppsProject = async (
    req: IExtendedRequest,
    res: Response
): Promise<void> => {
    try {
        const user = req.user.id
        const { name, applications } = req.body
        const newProject = new AppsProject({ name, user, applications })

        if (name.toLowerCase() === "default") {
            res.status(400).json({
                error: "The name 'default' is reserved for the default project"
            })
            return
        } else {
            await newProject.save()

            res.status(201).json({
                message: "New project created successfully",
                projectId: newProject._id
            })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const listAllAppsProjects = async (
    req: IExtendedRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user.id
        const projects = await AppsProject.find({ user: userId }).select(
            "_id name"
        )

        res.status(200).json(projects)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const updateSpecificAppsProject = async (
    req: IExtendedRequest,
    res: Response
): Promise<void> => {
    const userId = req.user.id
    try {
        const projectId = req.params.projectId
        const { applications } = req.body

        let project = await AppsProject.findOne({
            _id: projectId,
            user: userId
        })

        if (!project) {
            res.status(404).json({ message: "Project not found" })
            return
        }

        let attempts = 0
        let success = false

        while (!success && attempts < 5) {
            try {
                applications.forEach((appUpdate: any) => {
                    const appIndex = project.applications.findIndex(
                        (app) => app.appName === appUpdate.appName
                    )

                    if (appIndex !== -1) {
                        const isImageIdeasApp =
                            appUpdate.appName.includes("image-ideas")

                        appUpdate.generations.forEach((newGen: any) => {
                            const genIndex = project.applications[
                                appIndex
                            ].generations.findIndex(
                                (gen) =>
                                    gen.generationNumber ===
                                    newGen.generationNumber
                            )

                            if (genIndex === -1) {
                                if (isImageIdeasApp) {
                                    project.applications[appIndex].generations =
                                        appUpdate.generations
                                } else {
                                    project.applications[
                                        appIndex
                                    ].generations.push(newGen)
                                }
                            } else {
                                // If the app is an 'image-ideas' app, replace the entire generation
                                if (isImageIdeasApp) {
                                    project.applications[appIndex].generations =
                                        appUpdate.generations
                                } else {
                                    project.applications[appIndex].generations[
                                        genIndex
                                    ].creations = [
                                        ...project.applications[appIndex]
                                            .generations[genIndex].creations,
                                        ...newGen.creations
                                    ]
                                }
                            }
                        })
                    } else {
                        project.applications.push(appUpdate)
                    }
                })

                await project.save()
                success = true
            } catch (error) {
                if (error.name === "VersionError") {
                    project = await AppsProject.findOne({
                        _id: projectId,
                        user: userId
                    })

                    attempts++
                } else {
                    throw error
                }
            }
        }

        if (success) {
            res.status(200).json({
                message: "Specific project updated successfully 1"
            })
        } else {
            res.status(500).json({
                error: "Failed to update after multiple attempts"
            })
        }
    } catch (error) {
        console.error("Error in updateSpecificAppsProject:", error)
        res.status(500).json({ error: error.message })
    }
}

export const updateSpecificAppsProjectContentItems = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const userId = req.user.id
        const projectId = req.params.projectId
        const { applications } = req.body

        const project = await AppsProject.findOne({
            _id: projectId,
            user: userId
        })

        if (!project) {
            return res.status(404).json({ message: "Project not found" })
        }

        applications.forEach((appUpdate: any) => {
            let app = project.applications.find(
                (a) => a.appName === appUpdate.appName
            )

            // If app does not exist, initialize it with appName and empty generations array
            if (!app) {
                //@ts-ignore
                app = project.applications.create({
                    appName: appUpdate.appName,
                    generations: []
                })
                project.applications.push(app)
            }

            // Process contentItems for the app
            if (appUpdate.contentItems) {
                appUpdate.contentItems.forEach(
                    (section: any, index: number) => {
                        console.log(section.id)
                        let generation = app.generations.find(
                            (g) => g.contentItemsId.toString() === section.id
                        )
                        const isValidId = mongoose.Types.ObjectId.isValid(
                            section.id
                        )

                        generation = isValidId
                            ? {
                                  generationNumber: app.generations.length + 1,
                                  contentItemsId: section.id,
                                  contentItems: []
                              }
                            : {
                                  generationNumber: app.generations.length + 1,
                                  contentItems: []
                              }

                        Object.entries(section).forEach(([key, value]: any) => {
                            if (key === "image") {
                                //@ts-ignore
                                value.content = [{ id: value.id }]
                            }
                            if (
                                key !== "id" &&
                                key !== "isLoading" &&
                                Array.isArray(value.content)
                            ) {
                                const contentIds = value.content.map(
                                    (item: any) => item.id
                                )

                                const existingItem =
                                    generation.contentItems.find(
                                        (ci) => ci.name === key
                                    ) as any
                                if (existingItem) {
                                    existingItem.contentId = [
                                        ...new Set([
                                            ...existingItem.contentId,
                                            ...contentIds
                                        ])
                                    ]
                                } else {
                                    generation.contentItems.push({
                                        name: key,
                                        contentId: contentIds
                                    })
                                }
                            }
                        })
                        app.generations.push(generation)
                    }
                )
            }
        })

        let attempts = 0
        let success = false
        while (!success && attempts < 5) {
            try {
                await project.save()
                success = true
            } catch (error) {
                attempts++
            }
        }

        if (success) {
            res.status(200).json({
                message: "Project content items updated successfully"
            })
        } else {
            res.status(500).json({
                message: "Failed to update project content items"
            })
        }
    } catch (error) {
        console.error("Error updating project content items:", error)
        res.status(500).json({ error: error.message })
    }
}

export const getSpecificProjectAppName = async (
    req: IExtendedRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user.id
        const projectId = req.params.projectId
        const appName = req.params.appName

        // Initial aggregation to match, unwind, and populate creations
        const projects = await AppsProject.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(projectId),
                    user: new mongoose.Types.ObjectId(userId)
                }
            },

            { $unwind: "$applications" },

            { $match: { "applications.appName": appName } },

            { $unwind: "$applications.generations" },
            {
                $lookup: {
                    from: "creations",
                    localField: "applications.generations.creations",
                    foreignField: "_id",
                    as: "applications.generations.creations"
                }
            },

            { $sort: { "applications.generations.generationNumber": -1 } },
            {
                $group: {
                    _id: "$_id",
                    appName: { $first: "$applications.appName" },
                    formValues: { $first: "$applications.formValues" },
                    sharedFormValues: { $first: "$sharedFormValues" },
                    generations: { $push: "$applications.generations" }
                }
            },
            {
                $project: {
                    _id: 0,
                    appName: 1,
                    generations: 1,
                    formValues: 1,
                    sharedFormValues: 1
                }
            }
        ])

        if (projects.length === 0) {
            const getSharedFormValues = await AppsProject.findOne({
                _id: projectId,
                user: userId
            }).select("sharedFormValues")
            res.status(200).json({
                appName: appName,
                generations: [],
                sharedFormValues: getSharedFormValues?.sharedFormValues
            })
            return
        }

        // Manually populate contentId for each contentItem
        for (const project of projects) {
            for (const generation of project.generations) {
                if (generation.contentItemsId && generation.contentItemsId) {
                    const contentIdsDetails = await creation
                        .find({
                            _id: { $in: generation.contentItemsId }
                        })
                        .select("rating _id")
                        .exec()

                    generation.contentItemsId = contentIdsDetails[0]
                }

                for (const contentItem of generation.contentItems) {
                    const contentIds = await creation
                        .find({
                            _id: { $in: contentItem.contentId }
                        })
                        .exec()

                    contentItem.contentId = contentIds
                }
            }
        }

        res.status(200).json(projects[0])
    } catch (error) {
        console.error("Error in getSpecificProjectAppName:", error)
        res.status(500).json({ error: error.message })
    }
}
export const deleteSpecificCreation = async (
    req: IExtendedRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user.id
        const { projectId, appName, generationNumber, creationId } = req.params

        const project = await AppsProject.findOne({
            _id: projectId,
            user: userId
        })

        if (!project) {
            res.status(404).json({ message: "Project not found" })
            return
        }

        const app = project.applications.find((a) => a.appName === appName)
        if (!app) {
            res.status(404).json({ message: "Application not found" })
            return
        }

        const generation = app.generations.find(
            (g) => g.generationNumber === parseInt(generationNumber)
        )
        if (!generation) {
            res.status(404).json({ message: "Generation not found" })
            return
        }

        generation.creations = generation.creations.filter(
            (id) => !id.equals(creationId)
        )

        await project.save()
        res.status(200).json({ message: "Creation deleted successfully" })
    } catch (error) {
        console.error("Error in deleteSpecificCreation:", error)
        res.status(500).json({ error: error.message })
    }
}

export const deleteSpecificGeneration = async (
    req: IExtendedRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user.id
        const { projectId, appName, generationNumber } = req.params
        const genNumberToDelete = parseInt(generationNumber)

        const project = await AppsProject.findOne({
            _id: projectId,
            user: userId
        })

        if (!project) {
            res.status(404).json({ message: "Project not found" })
            return
        }

        const appIndex = project.applications.findIndex(
            (a) => a.appName === appName
        )
        if (appIndex === -1) {
            res.status(404).json({ message: "Application not found" })
            return
        }

        project.applications[appIndex].generations = project.applications[
            appIndex
        ].generations.filter((g) => g.generationNumber !== genNumberToDelete)

        // Adjust the generationNumber for remaining generations
        project.applications[appIndex].generations.forEach((generation) => {
            if (generation.generationNumber > genNumberToDelete) {
                generation.generationNumber -= 1
            }
        })

        project.applications[appIndex].generations.sort(
            (a, b) => a.generationNumber - b.generationNumber
        )

        await project.save()
        res.status(200).json({ message: "Generation deleted successfully" })
    } catch (error) {
        console.error("Error in deleteSpecificGeneration:", error)
        res.status(500).json({ error: error.message })
    }
}

export const deleteAppsProject = async (
    req: IExtendedRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user.id
        const { projectId } = req.params

        const project = await AppsProject.findOne({
            _id: projectId,
            user: userId
        })

        if (!project) {
            res.status(404).json({ message: "Project not found" })
        }

        if (project.name === "default") {
            res.status(400).json({
                error: "Cannot delete the default project."
            })
            return
        }

        await AppsProject.deleteOne({ _id: projectId })
        res.status(200).json({ message: "Project deleted successfully" })
    } catch (error) {
        console.error("Error in deleteAppsProject:", error)
        res.status(500).json({ error: error.message })
    }
}

export const updateApplicationFormValues = async (
    req: IExtendedRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user.id
        const { projectId, appName } = req.params
        const { formValues, sharedFormValues } = req.body

        const project = await AppsProject.findOne({
            _id: projectId,
            user: userId
        })

        if (!project) {
            res.status(404).json({
                error: "Project not found or access denied"
            })
            return
        }

        // Update shared form values at the project level
        if (sharedFormValues) {
            project.sharedFormValues = sharedFormValues
        }

        let app = project.applications.find((a) => a.appName === appName)
        if (!app) {
            //@ts-ignore
            app = project.applications.create({
                appName: appName,
                generations: [],
                formValues: {}
            })
            project.applications.push(app)
        }
        app.formValues = formValues

        project.markModified("applications")
        if (sharedFormValues) {
            project.markModified("sharedFormValues")
        }

        await project.save()

        res.status(200).json({
            message: "Application form values updated successfully"
        })
    } catch (error) {
        console.error("Error updating application form values:", error)
        res.status(500).json({ error: error.message })
    }
}

// for faq and bonus get latest benefits-stack
export const getBenefitStackWithHighestGeneration = async (
    req: IExtendedRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user.id
        const projectId = req.params.projectId

        const pipeline = [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(projectId),
                    user: new mongoose.Types.ObjectId(userId),
                    "applications.appName": "benefit-stack"
                }
            },
            { $unwind: "$applications" },
            { $match: { "applications.appName": "benefit-stack" } },
            { $unwind: "$applications.generations" },
            {
                $lookup: {
                    from: "creations",
                    localField: "applications.generations.creations",
                    foreignField: "_id",
                    as: "applications.generations.creations"
                }
            },
            { $sort: { "applications.generations.generationNumber": -1 } },
            { $limit: 1 },
            {
                $group: {
                    _id: "$_id",
                    appName: { $first: "$applications.appName" },
                    highestGeneration: { $first: "$applications.generations" }
                }
            },
            {
                $project: {
                    _id: 0,
                    appName: 1,
                    highestGeneration: 1
                }
            }
        ]

        const result = await AppsProject.aggregate(
            pipeline as mongoose.PipelineStage[]
        )

        if (result.length === 0) {
            res.status(200).json({
                appName: "benefit-stack",
                highestGeneration: { creations: [] }
            })
            return
        }

        res.status(200).json(result[0])
    } catch (error) {
        console.error("Error in getBenefitStackWithHighestGeneration:", error)
        res.status(500).json({ error: error.message })
    }
}
