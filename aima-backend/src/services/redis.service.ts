import Redis from "ioredis"
import { configEnv } from "../config/env"

configEnv()

export const redisClient = new Redis(process.env.REDIS_URI)

export const setRedis = async (
    key: string,
    value: string,
    expiry = 86400
): Promise<void> => {
    await redisClient.set(key, value, "EX", expiry)
}

export const getRedis = async (key: string): Promise<string> => {
    return redisClient.get(key)
}

export const getAllRedis = async (key: string): Promise<string[]> => {
    return await redisClient.keys(key)
}

export const deleteRedis = async (key: string): Promise<void> => {
    await redisClient.del(key)
}

export const updateOrCreateComposite = async (
    correlationId: string,
    apiData: { input: object; output: object }
): Promise<void> => {
    const existingDataString = (await getRedis(correlationId)) || ""
    const existingData = existingDataString
        ? JSON.parse(existingDataString)
        : {}

    const mergedInputs = { ...(existingData.input || {}) }
    for (const [key, value] of Object.entries(apiData.input)) {
        if (
            value != null &&
            value != undefined &&
            mergedInputs[key] === undefined
        ) {
            mergedInputs[key] = value
        }
    }

    const updatedData = {
        ...existingData,
        input: mergedInputs,
        output: { ...(existingData.output || {}), ...apiData.output }
    }

    await setRedis(correlationId, JSON.stringify(updatedData))
}

export const finalizeComposite = async (
    correlationId: string
): Promise<object> => {
    const finalData = await getRedis(correlationId)
    await deleteRedis(correlationId)
    return JSON.parse(finalData || "{}")
}
