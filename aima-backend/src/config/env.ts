import dotenv from "dotenv"
import fs from "fs"

export const configEnv = () => {
    const envLocalPath = ".env.local"
    const envPath = ".env"

    if (fs.existsSync(envLocalPath)) {
        dotenv.config({ path: envLocalPath })
    } else {
        dotenv.config({ path: envPath })
    }
}
