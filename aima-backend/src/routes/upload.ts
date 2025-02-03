import express from "express"
import multer from "multer"
import multerS3 from "multer-s3"
import { makeS3 } from "../services/files.service"

export const uploadRoutes = express.Router()

const upload = multer({
    storage: multerS3({
        s3: makeS3(),
        bucket: process.env.S3_UPLOADS_BUCKET,
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + "-" + file.originalname)
        }
    })
})

uploadRoutes.post("/upload", upload.single("file"), (req: any, res) => {
    const imageUrl: string = (req.file as any).location
    res.json({ imageUrl })
})
