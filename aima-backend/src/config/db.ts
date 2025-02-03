import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        const MONGO_URI =
            process.env.MONGO_URI ||
            "mongodb://localhost:27017/my-express-backend"
        await mongoose.connect(MONGO_URI)

        console.log("Connected to MongoDB database!", MONGO_URI)
    } catch (error) {
        console.error("Error connecting to MongoDB database:", error)
        process.exit(1)
    }
}
