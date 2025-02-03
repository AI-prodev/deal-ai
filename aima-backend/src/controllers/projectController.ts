import express, { Request, Response, NextFunction } from "express"
import ProjectModel from "../models/project"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { IProject } from "../types/IProject"

export const createProject = async (req: IExtendedRequest, res: Response) => {
    try {
        const newProject: IProject = new ProjectModel({
            user: req.user.id,
            title: req.body.title
        })
        await newProject.save()

        res.status(200).json(newProject)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getProject = async (req: IExtendedRequest, res: Response) => {
    try {
        if (req.params.projectId === "default") {
            return res.status(200).json(null)
        }

        const project = await ProjectModel.findOne({ _id: req.params.projectId }).exec()

        res.status(200).json(project)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}


export const getMyProjects = async (req: IExtendedRequest, res: Response) => {
    try {
        const projects = await ProjectModel.find({ user: req.user.id }).exec()

        res.status(200).json(projects)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const deleteProject = async (req: IExtendedRequest, res: Response) => {
    try {
        await ProjectModel.deleteOne({ _id: req.params.projectId, user: req.user.id }).exec()

        res.status(200).json()
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}
