import mongoose from "mongoose"

const InvalidatedTokenSchema = new mongoose.Schema({
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }
})

const InvalidatedTokenModel = mongoose.model(
    "InvalidatedToken",
    InvalidatedTokenSchema
)

export default InvalidatedTokenModel
