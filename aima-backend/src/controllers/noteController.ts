import { Request, Response, response } from "express"
import NoteModel from "../models/note"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { INote } from "../types/INote"
import jwt, { JwtPayload } from "jsonwebtoken"
import { socketServerInstance } from "../server"

export const getNoteCollab = async (req: IExtendedRequest, res: Response) => {
    interface IResponseBody {
        success: boolean
        message?: string
        shareModeChanged?: boolean
        note?: INote
    }

    try {
        const viaPublicUrl: boolean = req.shareId ? false : true
        const shareId: any = req.shareId ? req.shareId : req.params.shareId

        const getNote = async (shareId: string) => {
            await NoteModel.updateOne(
                {
                    data: { $regex: `"shareId":\\s*"${shareId}"` }
                },
                {
                    data: req.body.data
                }
            )

            const noteJson = await NoteModel.findOne({
                data: {
                    $regex: `"shareId":\\s*"${shareId}"`
                }
            })

            if (!noteJson) throw new Error("Note not found")

            const note: any = JSON.parse(noteJson.data)

            if (!note) throw new Error("Note not found")

            return note
        }

        const note = await getNote(shareId)

        const sendResult = (checkRealPublic: boolean) => {
            let result: IResponseBody = {
                success: true,
                shareModeChanged: false,
                note
            }

            if (checkRealPublic) {
                if (note.shareMode === "private" && viaPublicUrl) {
                    result = {
                        ...result,
                        success: false,
                        shareModeChanged: true,
                        note: null
                    }
                } else {
                    result = {
                        ...result,
                        success: true,
                        shareModeChanged: false,
                        note
                    }
                }
            }

            res.status(200).json(result)
        }

        sendResult(req.shareId ? false : true)
    } catch (error) {
        const responseObj: IResponseBody = {
            success: false,
            message: "Server error"
        }
        res.status(500).json(responseObj)
    }
}

export const getNotes = async (req: IExtendedRequest, res: Response) => {
    try {
        const user = req.user.id
        const notes = await NoteModel.find({ user })

        res.status(200).json(notes)
    } catch (error) {
        console.error("Failed to get notes for user:", req.user.id, error)
        res.status(500).json({ error: "Server error" })
    }
}

export const createNote = async (req: IExtendedRequest, res: Response) => {
    interface IResponseBody {
        success: boolean
        message: string
    }

    try {
        const checkJsonData = () => {
            try {
                const json = JSON.parse(req.body.data)
            } catch (error) {
                throw new Error("Invalid JSON")
            }
        }

        checkJsonData()

        await NoteModel.create({
            user: req.user.id,
            data: req.body.data
        })

        const responseObj: IResponseBody = {
            success: true,
            message: "Notes updated successfully!"
        }

        res.status(200).json(responseObj)
    } catch (error) {
        const responseObj: IResponseBody = {
            success: false,
            message: "Server error"
        }
        console.error("Failed to create note for user:", req.user.id, error)
        res.status(500).json(responseObj)
    }
}

export const updateNote = async (req: IExtendedRequest, res: Response) => {
    interface IResponseBody {
        success: boolean
        message?: string
        authRequired?: boolean
        note?: INote
    }

    try {
        const shareId = req.params.shareId

        await NoteModel.updateOne(
            {
                data: { $regex: `"shareId":\\s*"${shareId}"` }
            },
            {
                data: req.body.data
            }
        )

        const noteJson = await NoteModel.findOne({
            data: {
                $regex: `"shareId":\\s*"${shareId}"`
            }
        })

        if (!noteJson) throw new Error("Note not found")

        const note: any = JSON.parse(noteJson.data)

        const result = {
            success: true,
            authRequired: false,
            note
        }

        socketServerInstance.sendUpdateToCollab(JSON.stringify(note))
        res.status(200).json(result)
    } catch (error) {
        const responseObj: IResponseBody = {
            success: false,
            message: "Server error"
        }
        console.error("Failed to update note for user:", req.user.id, error)
        res.status(500).json(responseObj)
    }
}

export const updateNoteCollab = async (
    req: IExtendedRequest,
    res: Response
) => {
    interface IResponseBody {
        success: boolean
        message?: string
        shareModeChanged?: boolean
        note?: INote
        error?: any
    }

    try {
        const viaPublicUrl = req.shareId ? false : true
        const shareId: any = req.shareId ? req.shareId : req.params.shareId

        const updateNote = async () => {
            await NoteModel.updateOne(
                {
                    data: { $regex: `"shareId":\\s*"${shareId}"` }
                },
                {
                    data: req.body.data
                }
            )

            const noteJson = await NoteModel.findOne({
                data: {
                    $regex: `"shareId":\\s*"${shareId}"`
                }
            })

            if (!noteJson) throw { errType: "Note not found" }

            const note: any = JSON.parse(noteJson.data)

            if (!note) throw { errType: "Note not found" }

            return note
        }

        const note = await updateNote()

        const sendResult = (checkRealPublic: boolean) => {
            let result: IResponseBody = {
                success: true,
                shareModeChanged: false,
                note
            }

            if (checkRealPublic) {
                if (note.shareMode === "private" && viaPublicUrl) {
                    result = {
                        ...result,
                        success: false,
                        shareModeChanged: true,
                        note: null
                    }
                } else {
                    result = {
                        ...result,
                        success: true,
                        shareModeChanged: false,
                        note
                    }
                }
            }

            socketServerInstance.sendUpdateToOwner(JSON.stringify(note))
            res.status(200).json(result)
        }

        sendResult(req.shareId ? false : true)
    } catch (error) {
        const responseObj: IResponseBody = {
            success: false,
            message: "Server error",
            error: error.errType
        }
        console.error("Failed to update note for collaborator:", error)
        res.status(500).json(responseObj)
    }
}

export const deleteNote = async (req: IExtendedRequest, res: Response) => {
    interface IResponseBody {
        success: boolean
        message: string
    }

    try {
        const shareId = req.params.shareId

        if (!shareId) throw new Error("Share Id not provided")

        await NoteModel.deleteOne({
            data: { $regex: `"shareId":\\s*"${shareId}"` }
        })

        const responseObj: IResponseBody = {
            success: true,
            message: "Notes deleted successfully!"
        }

        res.status(200).json(responseObj)
    } catch (error) {
        const responseObj: IResponseBody = {
            success: false,
            message: "Server error"
        }
        console.error("Failed to delete note for user:", req.user.id, error)
        res.status(500).json(responseObj)
    }
}

export const deleteAll = async (req: IExtendedRequest, res: Response) => {
    interface IResponseBody {
        success: boolean
        message: string
    }

    try {
        await NoteModel.deleteMany({ user: req.user.id })

        const responseObj: IResponseBody = {
            success: true,
            message: "All Notes deleted successfully!"
        }

        res.status(200).json(responseObj)
    } catch (error) {
        const responseObj: IResponseBody = {
            success: false,
            message: "Server error"
        }
        console.error(
            "Failed to delete all notes for user:",
            req.user.id,
            error
        )
        res.status(500).json(responseObj)
    }
}

export const getAuth = async (req: IExtendedRequest, res: Response) => {
    try {
        const { password } = req.body
        const { shareId } = req.params

        const noteJson = await NoteModel.findOne({
            data: {
                $regex: `"shareId":\\s*"${shareId}"`
            }
        })

        if (!noteJson) {
            throw new Error("Note not found")
        }

        const note: any = JSON.parse(noteJson.data)

        if (note && note.password === password) {
            const token = jwt.sign({ shareId }, process.env.JWT_SECRET)

            res.status(200).json({ token })
        } else {
            res.status(401).json({ error: "Invalid password" })
        }
    } catch (error) {
        res.status(500).json({ error: "Server error" })
    }
}
