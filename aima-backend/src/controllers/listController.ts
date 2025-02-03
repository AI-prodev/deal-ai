import { Request, Response } from "express"
import ContactModel from "../models/contact"
import ListModel from "../models/list"
import { IExtendedRequest } from "../types/IExtendedRequest"
// import Papa from "papaparse"
// import { IContact } from "../types/IContact"
// import { IList } from "../types/IList"

export const createList = async (req: IExtendedRequest, res: Response) => {
    try {
        const { id } = req.user
        const { title } = req.body
        const list = await ListModel.create({
            title,
            numContacts: 0,
            userId: id
        })
        return res.send(list)
    } catch (error) {
        return res
            .status(404)
            .json({ error: `error while creating list : ${error}` })
    }
}

export const addListToContact = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const { contactId, listIds } = req.body

        const contact = await ContactModel.findById(contactId)
        if (!contact) {
            return res.status(404).json({ error: "Contact not found" })
        }

        const listIdsToAdd = listIds.filter(
            (listId: any) => !contact.listIds.includes(listId)
        )
        if (listIdsToAdd.length === 0) {
            return res.status(400).json({
                message: "All provided lists are already added to the contact"
            })
        }

        const lists = await ListModel.find({ _id: { $in: listIdsToAdd } })
        if (lists.length !== listIdsToAdd.length) {
            return res
                .status(404)
                .json({ error: "One or more lists not found" })
        }

        const updateResult = await ContactModel.updateOne(
            { _id: contactId },
            { $addToSet: { listIds: { $each: listIdsToAdd } } }
        )

        if (updateResult.modifiedCount === 0) {
            return res
                .status(404)
                .json({ error: "Failed to update the contact" })
        }

        await Promise.all(
            lists.map((list) =>
                ListModel.updateOne(
                    { _id: list._id },
                    { $inc: { numContacts: 1 } }
                )
            )
        )

        const updatedLists = await ListModel.find({ _id: { $in: listIds } })
        return res.send(updatedLists)
    } catch (error) {
        return res
            .status(500)
            .json({ error: `Error while adding lists to contact: ${error}` })
    }
}

export const getById = async (req: IExtendedRequest, res: Response) => {
    try {
        const list = await ListModel.findById(req.params.id)
        if (!list) {
            return res.status(404).json({ error: "List not found" })
        }
        return res.send(list)
    } catch (error) {
        return res
            .status(404)
            .json({ error: `error while getting by id : ${error}` })
    }
}

export const getByContactId = async (req: IExtendedRequest, res: Response) => {
    try {
        const paginatedResults = (req as any).paginatedResults
        res.status(200).json(paginatedResults)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getAll = async (req: Request, res: Response) => {
    try {
        const paginatedResults = (req as any).paginatedResults

        // TODO: do that in a better way (with a virtual field in the model)
        paginatedResults.results = await Promise.all(
            paginatedResults.results.map(async (list: any) => {
                return ContactModel.countDocuments({
                    listIds: list._id,
                    unsubscribed: { $ne: true }
                })
                    .then((subscribedContactsCount) => {
                        list.subscribedContactsCount = subscribedContactsCount
                        return list
                    })
                    .catch(() => {
                        list.subscribedContactsCount = 0
                        return list
                    })
            })
        )

        return res.status(200).json(paginatedResults)
    } catch (error) {
        return res
            .status(404)
            .json({ error: `error while getting by id : ${error}` })
    }
}

export const updateList = async (req: Request, res: Response) => {
    try {
        const list = await ListModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
        if (!list) {
            return res.status(404).json({ error: "Contact not found" })
        }
        return res.send(list)
    } catch (error) {
        return res
            .status(404)
            .json({ error: `error while getting by id : ${error}` })
    }
}

export const deleteList = async (req: Request, res: Response) => {
    try {
        const listId = req.params.id

        const list = await ListModel.findById(listId)
        if (!list) {
            return res.status(404).json({ error: "List not found" })
        }

        await list.deleteOne()

        await ContactModel.updateMany(
            { listIds: listId },
            { $pull: { listIds: listId } }
        )

        return res.send({ message: "List deleted successfully" })
    } catch (error) {
        return res
            .status(500)
            .json({ error: `Error while deleting list: ${error}` })
    }
}
