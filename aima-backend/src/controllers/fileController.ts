import { Response } from "express"
import FolderModel from "../models/folder"
import FileModel from "../models/file"
import UserModel from "../models/user"
import { IExtendedRequest } from "../types/IExtendedRequest"
import { IFile } from "../types/IFile"
import { copyObject, deleteObject, getGetPreSignedUrl, getObjectSize, getPutPreSignedUrl, putObjectStream } from "../services/files.service"
import { IFolder } from "../types/IFolder"
import { randomUUID } from "crypto"
import stream from "stream"

const MAX_USER_FILE_COUNT = 2000
const MAX_USER_FILE_SIZE = 5_000_000_000_000 // 5 TB
const MAX_USER_DOWNLOAD_SIZE = 250_000_000_000 // 250 GB
// const MAX_USER_DOWNLOAD_SIZE = 50_000 // 50 KB// for testing

export const createFile = async (req: IExtendedRequest, res: Response) => {
    const userId = req.user.id
    const folderId = req.body.folderId
    const displayName = req.body.displayName
    const mimeType = req.body.mimeType || "application/octet-stream"
    const size = req.body.size

    const folder = await FolderModel.findOne({
        _id: folderId,
        user: req.user.id
    })
        .lean()
        .exec()
    if (!folder) {
        return res.status(400).json({ error: "Folder not found" })
    }

    const user = await UserModel.findById(userId).exec()
    if (!user) {
        return res.status(400).json({ error: "User not found" })
    }

    if (!user.fileCount) {
        user.fileCount = 0
    }
    if (!user.fileSize) {
        user.fileSize = 0
    }

    if (user.fileCount + 1 > MAX_USER_FILE_COUNT) {
        return res
            .status(400)
            .json({ error: "Max file count reached for account" })
    }

    if (user.fileSize + size > MAX_USER_FILE_SIZE) {
        return res
            .status(400)
            .json({ error: "Max file size reached for account" })
    }

    const newFile: IFile = new FileModel({
        user: req.user.id,
        displayName,
        mimeType,
        size,
        folder: folderId
    })
    await newFile.save()

    user.fileCount++
    user.fileSize += size
    user.save()
    try{
        const signedUrlsFromS3 = await getPutPreSignedUrl({
            Bucket: process.env.S3_USER_FILES_BUCKET,
            ContentType: mimeType,
            Key: req.user.id + "/" + newFile._id
        })

        res.status(200).json({
            fileId: newFile._id,
            signedUrl: signedUrlsFromS3.signedUrl
        })
    }
    catch(err){
        console.error(err)
        return res.status(400).json({ error: "File not found" })
    }
}

export const createFileAndPipeUpload = async (
    userId: string,
    folderId: string,
    displayName: string,
    passThrough: stream.PassThrough,
    mimeType: string
) => {

    const folder = await FolderModel.findOne({ _id: folderId, user: userId }).lean().exec()
    if (!folder) {
        throw new Error("Folder not found")
    }

    const user = await UserModel.findById(userId).exec()
    if (!user) {
        throw new Error("User not found")
    }

    if (!user.fileCount) {
        user.fileCount = 0
    }
    if (!user.fileSize) {
        user.fileSize = 0
    }

    if (user.fileCount + 1 > MAX_USER_FILE_COUNT) {
        throw new Error("Max file count reached for account")
    }

    const newFile: IFile = new FileModel({
        user: userId,
        displayName,
        mimeType,
        size: 0,
        folder: folderId
    })
    await newFile.save()
    
    await putObjectStream({
        Bucket: process.env.S3_USER_FILES_BUCKET,
        ContentType: mimeType,
        Key: userId + "/" + newFile._id,
        Body: passThrough
    })

    user.fileCount++
    user.save()

    const objectSize = await getObjectSize({
        Bucket: process.env.S3_USER_FILES_BUCKET,
        Key: userId + "/" + newFile._id
    })
    
    if (objectSize) {
        user.fileSize += objectSize
        user.save()
    
        newFile.size = objectSize
        newFile.save()
    }

    return newFile
}

export const createFolder = async (req: IExtendedRequest, res: Response) => {
    const parentFolderId = req.body.parentFolderId
    const displayName = req.body.displayName

    const existingParentFolder = await FolderModel.findOne({
        _id: parentFolderId,
        user: req.user.id
    })
        .lean()
        .exec()
    if (!existingParentFolder) {
        return res.status(400).json({ error: "Parent folder not found" })
    }

    const newFolder: IFolder = new FolderModel({
        user: req.user.id,
        displayName,
        parentFolder: parentFolderId
    })
    await newFolder.save()

    res.status(200).json(newFolder)
}

export const findOrCreateFolder = async (userId: string, displayName: string) => {
    const user = await UserModel.findById(userId).exec()
    if (!user) {
        throw new Error("User not found")
    }

    const existingFolder = await FolderModel.findOne({ user: userId, displayName }).lean().exec()
    if (existingFolder) {
        return existingFolder
    }

    let rootFolder = await FolderModel.findOne({ user: userId, parentFolder: null }).lean().exec()
    if (!rootFolder) {
        rootFolder = new FolderModel({
            user: userId,
            parentFolder: undefined,
            displayName: undefined
        })
        await rootFolder.save()
    }

    const newFolder: IFolder = new FolderModel({
        user: userId,
        displayName,
        parentFolder: rootFolder._id
    })
    await newFolder.save()

    return newFolder
}


export const copyFile = async (req: IExtendedRequest, res: Response) => {
    const userId = req.user.id
    const fileId = req.params.fileId

    const oldFile = await FileModel.findOne({ _id: fileId, user: req.user.id })
        .lean()
        .exec()
    if (!oldFile) {
        return res.status(400).json({ error: "File not found" })
    }

    const user = await UserModel.findById(userId).exec()
    if (!user) {
        return res.status(400).json({ error: "User not found" })
    }

    if (!user.fileCount) {
        user.fileCount = 0
    }
    if (!user.fileSize) {
        user.fileSize = 0
    }

    if (user.fileCount + 1 > MAX_USER_FILE_COUNT) {
        return res
            .status(400)
            .json({ error: "Max file count reached for account" })
    }

    if (user.fileSize + oldFile.size > MAX_USER_FILE_SIZE) {
        return res
            .status(400)
            .json({ error: "Max file size reached for account" })
    }

    let newName = oldFile.displayName + " (copy)"
    const oldNameTokens = oldFile.displayName.split(".")
    if (oldNameTokens.length > 1) {
        newName =
            oldNameTokens.slice(0, oldNameTokens.length - 1).join(".") +
            " (copy)." +
            oldNameTokens[oldNameTokens.length - 1]
    }

    const newFile: IFile = new FileModel({
        user: req.user.id,
        displayName: newName,
        mimeType: oldFile.mimeType,
        size: oldFile.size,
        folder: oldFile.folder
    })
    await newFile.save()

    await copyObject({
        Bucket: process.env.S3_USER_FILES_BUCKET,
        CopySource:
            process.env.S3_USER_FILES_BUCKET +
            "/" +
            req.user.id +
            "/" +
            oldFile._id,
        Key: req.user.id + "/" + newFile._id
    })

    user.fileCount++
    user.fileSize += oldFile.size
    user.save()

    res.status(200).json({})
}
export const moveFolder = async (req: IExtendedRequest, res: Response) => {
    const parentFolderId = req.body.parentFolderId
    const userId = req.user.id
    const folderId = req.params.folderId
    try {
        const existingFolder = await FolderModel.findOne({ user: userId,  _id:folderId}).exec()
        const prevuesParent = existingFolder.parentFolder
        existingFolder.parentFolder = parentFolderId 
        await existingFolder.save()
        const folders = await FolderModel.find({
            user: userId,
            parentFolder: prevuesParent
        })
            .lean()
            .exec()

        res.status(200).json(folders)
    }
    catch (err) {
        console.error(err)
        return res
            .status(400)
            .json({ error: "Can not current move folder" }) 
    }
}
export const getFileDownloadUrl = async (
    req: IExtendedRequest,
    res: Response
) => {
    const fileId = req.params.fileId

    const file = await FileModel.findOne({ _id: fileId, user: req.user.id })
        .lean()
        .exec()
    if (!file) {
        return res.status(400).json({ error: "File not found" })
    }

    const user = await UserModel.findById(req.user.id).exec()
    if (!user) {
        return res.status(400).json({ error: "User not found" })
    }

    if (!user.fileDownloadSize) {
        user.fileDownloadSize = 0
    }
    if (user.fileDownloadSize + file.size > MAX_USER_DOWNLOAD_SIZE) {
        return res
            .status(400)
            .json({
                error: "Max download size reached. Please contact support"
            })
    }

    const { signedUrl } = await getGetPreSignedUrl({
        Bucket: process.env.S3_USER_FILES_BUCKET,
        Key: req.user.id + "/" + file._id
    })

    user.fileDownloadSize += file.size
    await user.save()

    res.status(200).json({
        signedUrl
    })
}

export const getFileShareToken = async (
    req: IExtendedRequest,
    res: Response
) => {
    const fileId = req.params.fileId

    const file = await FileModel.findOne({
        _id: fileId,
        user: req.user.id
    }).exec()
    if (!file) {
        return res.status(400).json({ error: "File not found" })
    }

    if (!file.shareToken) {
        file.shareToken = randomUUID()
        file.save()
    }

    res.status(200).json({
        shareToken: file.shareToken
    })
}

export const getSharedFile = async (req: IExtendedRequest, res: Response) => {
    const fileId = req.params.fileId
    const shareToken = req.params.shareToken

    const file = await FileModel.findOne({ _id: fileId, shareToken })
        .lean()
        .exec()
    if (!file) {
        return res.status(400).json({ error: "File not found" })
    }

    const user = await UserModel.findById(file.user).exec()
    if (!user) {
        return res.status(400).json({ error: "User not found" })
    }

    if (!user.fileDownloadSize) {
        user.fileDownloadSize = 0
    }
    if (user.fileDownloadSize + file.size > MAX_USER_DOWNLOAD_SIZE) {
        return res
            .status(400)
            .json({
                error: "Max download size reached. Please contact support"
            })
    }

    const { signedUrl } = await getGetPreSignedUrl({
        Bucket: process.env.S3_USER_FILES_BUCKET,
        Key: file.user + "/" + file._id
    })

    user.fileDownloadSize += file.size
    user.save()

    if (!signedUrl) {
        return res.status(400).json({ error: "File not found" })
    }

    res.redirect(signedUrl)
}

export const getFolderByName = async (req: IExtendedRequest, res: Response) => {
    try {
        const folderName = req.query.folderName
        const user = req.user
                
        const folder = await FolderModel.findOne({ user: user.id, displayName: folderName })
            .lean()
            .exec()
    
        res.status(200).json(folder)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getFolder = async (req: IExtendedRequest, res: Response) => {
    try {
        const folderId = req.params.folderId
        const user = req.user

        let folder
        if (folderId == "root") {
            folder = await FolderModel.findOne({
                user: user.id,
                parentFolder: undefined
            })
                .lean()
                .exec()
            if (!folder) {
                folder = await FolderModel.create({
                    user: user.id,
                    parentFolder: undefined,
                    displayName: undefined
                })
            }
        } else {
            folder = await FolderModel.findOne({ user: user.id, _id: folderId })
                .lean()
                .exec()
        }

        if (!folder) {
            return res.status(400).json({ error: "Folder not found" })
        }

        res.status(200).json(folder)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getFoldersByFolder = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const parentFolderId = req.params.parentFolderId
        const user = req.user
        const folders = await FolderModel.find({
            user: user.id,
            parentFolder: parentFolderId
        })
            .lean()
            .exec()

        res.status(200).json(folders)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getFilesByFolder = async (
    req: IExtendedRequest,
    res: Response
) => {
    try {
        const folderId = req.params.folderId
        const user = req.user

        const files = await FileModel.find({ user: user.id, folder: folderId })
            .sort("-createdAt")
            .lean()
            .exec()

        res.status(200).json(files)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const getUserImages = async (req: IExtendedRequest, res: Response) => {
    try {
        const user = req.user
        const { sort = "-createdAt", limit = 10, page = 1 } = req.query
        const skip = (+page - 1) * +limit

        const query = {
            user: user.id,
            mimeType: { $regex: "^image/" }
        }

        const [results, totalCount] = await Promise.all([
            FileModel
                .find(query)
                .sort(sort as string)
                .limit(+limit)
                .skip(skip)
                .lean()
                .exec(),
            FileModel.countDocuments(query),
        ])

        return res.status(200).json({
            results,
            currentPage: +page,
            totalCount,
            totalPages: Math.ceil(totalCount / +limit),
            next: {
                page:
                    +page + 1 > Math.ceil(totalCount / +limit)
                        ? null
                        : +page + 1,
                limit: +page * +limit > totalCount ? null : +limit
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const renameFile = async (req: IExtendedRequest, res: Response) => {
    try {
        const fileId = req.params.fileId
        const newName = req.body.newName
        const user = req.user

        const file = await FileModel.findOne({
            _id: fileId,
            user: user.id
        }).exec()
        if (!file) {
            return res.status(400).json({ error: "File not found" })
        }

        file.displayName = newName
        await file.save()

        res.status(200).json({ success: true })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const renameFolder = async (req: IExtendedRequest, res: Response) => {
    try {
        const folderId = req.params.folderId
        const newName = req.body.newName
        const user = req.user

        const folder = await FolderModel.findOne({
            _id: folderId,
            user: user.id
        }).exec()
        if (!folder) {
            return res.status(400).json({ error: "Folder not found" })
        }

        folder.displayName = newName
        await folder.save()

        res.status(200).json({ success: true })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const deleteFile = async (req: IExtendedRequest, res: Response) => {
    try {
        const fileId = req.params.fileId
        const user = req.user

        const file = await FileModel.findOne({ _id: fileId, user: user.id })
            .lean()
            .exec()

        await FileModel.deleteOne({ _id: fileId, user: user.id }).exec()

        if (file) {
            UserModel.updateOne(
                { _id: user.id },
                { $inc: { fileCount: -1, fileSize: -1 * file.size } }
            ).exec()
        }

        try {
            deleteObject({
                Bucket: process.env.S3_USER_FILES_BUCKET,
                Key: user.id + "/" + fileId
            })
        } catch (err) {
            console.log(err)
        }

        res.status(200).json({ success: true })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}

export const deleteFolder = async (req: IExtendedRequest, res: Response) => {
    try {
        const folderId = req.params.folderId
        const user = req.user

        // recursively delete folders and files
        const queue = [folderId]
        while (queue.length > 0) {
            const currentFolderId = queue.shift()
            FolderModel.deleteOne({
                _id: currentFolderId,
                user: user.id
            }).exec()

            const files = await FileModel.find({
                folder: currentFolderId,
                user: user.id
            })
                .lean()
                .exec()

            FileModel.deleteMany({
                folder: currentFolderId,
                user: user.id
            }).exec()

            try {
                files.forEach((file) => {
                    UserModel.updateOne(
                        { _id: user.id },
                        { $inc: { fileCount: -1, fileSize: -1 * file.size } }
                    ).exec()
                    deleteObject({
                        Bucket: process.env.S3_USER_FILES_BUCKET,
                        Key: user.id + "/" + file._id
                    })
                })
            } catch (err) {
                console.log(err)
            }

            const subfolders = await FolderModel.find({
                parentFolder: currentFolderId,
                user: user.id
            })
                .lean()
                .exec()
            subfolders.forEach((f) => queue.push(f._id))
        }

        res.status(200).json({ success: true })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}
export const moveFile = async (req: IExtendedRequest, res: Response) => {
    try {
        const fileId = req.params.fileId
        const folderId = req.params.folderId
        const user = req.user
        const file = await FileModel.findOne({ _id: fileId, user: user.id })
            .lean()
            .exec()
        if (file) {
            const newFile: IFile = new FileModel({
                user: user.id,
                displayName: file.displayName,
                mimeType: file.mimeType,
                size: file.size,
                folder: folderId
            })
            await FileModel.deleteOne({ _id: fileId, user: user.id }).exec()
            await newFile.save()
        
            try{
                await copyObject({
                    Bucket: process.env.S3_USER_FILES_BUCKET,
                    CopySource:
                        process.env.S3_USER_FILES_BUCKET +
                        "/" +
                        req.user.id +
                        "/" +
                        file._id,
                    Key: req.user.id + "/" + newFile._id
                })
                await deleteObject({
                    Bucket: process.env.S3_USER_FILES_BUCKET,
                    Key: user.id + "/" + file._id
                })
                const signedUrlsFromS3 = await getPutPreSignedUrl({
                    Bucket: process.env.S3_USER_FILES_BUCKET,
                    ContentType: newFile.mimeType,
                    Key: req.user.id + "/" + newFile._id
                })
    
                res.status(200).json({
                    fileId: newFile._id,
                    signedUrl: signedUrlsFromS3.signedUrl
                })
            }
            catch(err){
                console.error(err)
                return res.status(400).json({ error: "File not found" })
            }  
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" })
    }
}