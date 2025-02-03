import mongoose from "mongoose"

const RefreshTokenSchema = new mongoose.Schema({
    token: String,
    userId: String,
    expiresAt: { type: Date, required: true, index: { expires: "200s" } } // expires after 200 second past the date in expiresAt
})

const RefreshTokenModel = mongoose.model("RefreshToken", RefreshTokenSchema)

export default RefreshTokenModel
