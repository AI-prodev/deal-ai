import { PutObjectCommand, DeleteObjectCommand, S3Client, ObjectCannedACL, GetObjectCommand, CopyObjectCommand, GetObjectAttributesCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { Upload } from "@aws-sdk/lib-storage"
import { randomUUID } from "crypto"
import { allowedExtensions } from "../utils/allowedExtensions"
import stream from "stream"

export const makeS3 = () => {
    return new S3Client({
        region: process.env.S3_REGION || "us-west-2",
        apiVersion: "2006-03-01",
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_ACCESS_SECRET
        }
    })
}

export const putObject = async (options: {
    Bucket: string
    Key: string
    ContentType: string
    Body?: string | Buffer
    Expires?: Date
    ACL?: ObjectCannedACL
}) => {
    const s3 = makeS3()

    const fileExtension = /(?:\.([^.]+))?$/.exec(options.Key)[1]

    if (!allowedExtensions.includes(fileExtension.toLocaleLowerCase())) {
        throw new Error("Not supported extension")
    }

    try {
        const fileKey = options.Key || `${randomUUID()}.${fileExtension}`
        const command = new PutObjectCommand({
            ...options,
            Key: fileKey
        })
        await s3.send(command)
        return {
            fileUrl: `https://${options.Bucket}.s3.${process.env.S3_REGION}.amazonaws.com/${fileKey}`
        }
    } catch (error) {
        console.log(error)

        throw new Error(error)
    }
}


export const putObjectStream = async (options: {
    Bucket: string
    Key: string
    ContentType: string
    Body?: stream.PassThrough
}) => {
    const s3 = makeS3()

    try {
        const parallelUploads3 = new Upload({
            client: s3,
            queueSize: 4, // optional concurrency configuration
            leavePartsOnError: false, // optional manually handle dropped parts
            params: {
                Bucket: options.Bucket,
                Key: options.Key,
                Body: options.Body,
                ContentType: options.ContentType
            },
        })

        parallelUploads3.on("httpUploadProgress", (progress) => {
            console.log(progress)
        })

        await parallelUploads3.done()
    } catch (error) {
        console.log(error)

        throw new Error(error)
    }
}

export const putObjectBuffer = async (options: {
    Bucket: string
    Key: string
    ContentType: string
    Body?: Buffer
}) => {
    const s3 = makeS3()
    
    try {
        const command = new PutObjectCommand({
            ...options,
        })
        await s3.send(command)
    } catch (error) {
        console.log(error)

        throw new Error(error)
    }
}


export const getObjectSize = async (options: {
    Bucket: string
    Key: string
}) => {
    const s3 = makeS3()

    try {
        const command = new GetObjectAttributesCommand({
            Bucket: options.Bucket,
            Key: options.Key,
            ObjectAttributes: ["ObjectSize"]
        })
        const result = await s3.send(command)
        return result.ObjectSize
    } catch (error) {
        console.log(error)

        throw new Error(error)
    }
}


export const copyObject = async (options: {
    Bucket: string
    CopySource: string
    Key: string
}) => {
    const s3 = makeS3()

    try {
        const command = new CopyObjectCommand({
            Bucket: options.Bucket,
            CopySource: options.CopySource,
            Key: options.Key
        })
        await s3.send(command)
        return { success: true }
    } catch (error) {
        throw new Error(error)
    }
}

export const deleteObject = async (options: {
    Bucket: string
    Key: string
}) => {
    const s3 = makeS3()
    try {
        const command = new DeleteObjectCommand({
            Bucket: options.Bucket,
            Key: options.Key
        })
        await s3.send(command)
        return { success: true }
    } catch (error) {
        console.log(error)

        throw new Error(error)
    }
}

export const getPutPreSignedUrlFromS3Service = async (options: {
    Bucket: string
    Key: string
    ContentType: string
    Expires?: Date
    ACL?: string
    allowAnyExtension?: boolean
}) => {
    const s3 = makeS3()

    const fileExtension = /(?:\.([^.]+))?$/.exec(options.Key)[1]

    if (
        !options.allowAnyExtension &&
        !allowedExtensions.includes(fileExtension.toLocaleLowerCase())
    ) {
        throw new Error("Not supported extension")
    }

    try {
        const command = new PutObjectCommand({
            ...options,
            Key: `${randomUUID()}.${fileExtension}`,
            ContentType: options.ContentType,
            ACL: options.ACL as ObjectCannedACL
        })
        const data = await getSignedUrl(s3, command, { expiresIn: 7200 })
        return {
            signedUrl: data,
            fileUrl:
                data.substring(0, data.indexOf("?")) ||
                `https://${options.Bucket}.s3.${
                    process.env.S3_REGION || "us-west-2"
                }.amazonaws.com/${options.Key}`
        }
    } catch (error) {
        throw new Error(error)
    }
}

export const getPutPreSignedUrl = async (options: {
    Bucket: string
    Key: string
    ContentType: string
}) => {
    const s3 = makeS3()

    try {
        const command = new PutObjectCommand({
            Bucket: options.Bucket,
            Key: options.Key,
            ContentType: options.ContentType
        })
        const data = await getSignedUrl(s3, command, { expiresIn: 7200 })
        return {
            signedUrl: data,
            fileUrl: `https://${options.Bucket}.s3.${
                process.env.S3_REGION || "us-west-2"
            }.amazonaws.com/${options.Key}`
        }
    } catch (error) {
        throw new Error(error)
    }
}

export const getGetPreSignedUrl = async (options: {
    Bucket: string
    Key: string
}) => {
    const s3 = makeS3()

    try {
        const command = new GetObjectCommand({
            Bucket: options.Bucket,
            Key: options.Key
        })
        const data = await getSignedUrl(s3, command, { expiresIn: 7200 })
        return {
            signedUrl: data
        }
    } catch (error) {
        throw new Error(error)
    }
}
