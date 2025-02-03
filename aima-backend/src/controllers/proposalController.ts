import { Response } from "express"
import ProposalModel from "../models/proposal"
import { IExtendedRequest } from "../types/IExtendedRequest"
import UserModel from "../models/user"
import { IProposal } from "../types/IProposal"
import { v4 as uuidv4 } from "uuid"
import {
    getRedis,
    setRedis,
    deleteRedis,
} from "../services/redis.service"
import { processRequestProposal } from "../utils/processRequestProposal"

export const createProposal = async (req: IExtendedRequest, res: Response) => {
    const businessName = req.body.businessName
    const businessWebsite = req.body.businessWebsite

    console.log("req.body=", req.body)
    
    const user = await UserModel.findById(req.user.id).exec()
    if (!user) {
        return res.status(400).json({ error: "User not found" })
    }

    if (!businessName) {
        return res.status(400).json({ error: "A title is required" })
    }
    if (!businessWebsite) {
        return res.status(400).json({ error: "A website is required" })
    }

    const newProposal: IProposal = new ProposalModel({
        user: req.user.id,
        businessName,
        businessWebsite
    })
    await newProposal.save()
    
    res.status(200).json({
        proposalId: newProposal._id
    })
}


export const startProposalRequest = async (req: IExtendedRequest, res: Response) => {
    const token = `pending-request:${uuidv4()}`
    const businessName = req.body.businessName as string
    const businessWebsite = req.body.businessWebsite as string

    console.log("req.body=", req.body)
    
    const user = await UserModel.findById(req.user.id).exec()
    if (!user) {
        return res.status(400).json({ error: "User not found" })
    }

    if (!businessName) {
        return res.status(400).json({ error: "A title is required" })
    }
    if (!businessWebsite) {
        return res.status(400).json({ error: "A website is required" })
    }
    if (!businessWebsite.startsWith("https://") && !businessWebsite.startsWith("http://")) {
        return res.status(400).json({ error: "Website must start with https:// or http//" })
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const input = {
        businessName,
        businessWebsite
    }

    await setRedis(
        token,
        JSON.stringify({
            status: "processing",
            progress: 0,
            input: input
        })
    )
    processRequestProposal(token, input, user).catch(async (err) => {
        await setRedis(
            token,
            JSON.stringify({
                status: "error",
                error: err.message,
                input
            })
        )
    })

    res.json({ token })
}

export const endProposalRequest = async (
    req: IExtendedRequest,
    res: Response
): Promise<void> => {
    const token = req.params.token
    const request = JSON.parse(await getRedis(token))

    if (!request) {
        res.status(404).send("Request not found.")
        return
    }

    if (request.status === "completed") {        
        const output = JSON.parse(request.response as string)
        const input = request.input

        console.log("input=", input)
        console.log("output=", output)

        await deleteRedis(token)
        
        res.status(200).json({
            response: output
        })
    } else if (request.status === "error") {
        res.status(500).json({ error: request.error })
        await deleteRedis(token)
    } else {
        await deleteRedis(token)
        res.status(200).json({ status: "Deleted request" })
    }
}

export const queryProposalRequest = async (req: IExtendedRequest, res: Response) => {
    const token = req.params.token
    const request = JSON.parse(await getRedis(token))

    if (!request) {
        res.status(404).send("Request not found.")
        return
    }

    res.json({
        status: request.status,
        progress: request.progress,
        error: request.error
    })
}



export const getMyProposals = async (req: IExtendedRequest, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20
    const offsetProposalId = req.query.offsetProposalId

    let fromDate = "2099-01-01T00:00:00.000+0000"
    if (offsetProposalId) {
        const proposal = await ProposalModel.findById(offsetProposalId).lean().exec()
        if (!proposal) {
            return res.status(400).json({ error: "Proposal not found" })
        }
        fromDate = proposal.createdAt
    }

    const proposals = await ProposalModel
        .find({ user: req.user.id, createdAt: { $lt: new Date(fromDate) } })
        .sort("-createdAt")
        .limit(limit)
        .lean().exec()

    //res.status(200).json([]) // for testing initial banner
    res.status(200).json(proposals)
}


export const deleteProposal = async (req: IExtendedRequest, res: Response) => {
    const proposalId = req.params.proposalId

    await ProposalModel.deleteOne({ _id: proposalId, user: req.user.id }).exec()

    res.status(200).json({ success: true })
}

