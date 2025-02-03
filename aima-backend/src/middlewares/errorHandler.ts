import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export const notFound = (req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ error: "Not Found - Invalid API endpoint" })
}

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Set locals, only providing error in development
        const isDevelopment = req.app.get("env") === "development"
        res.locals.message = err.message
        res.locals.error = isDevelopment ? err : {}

        let statusCode = res.statusCode === 200 ? 500 : res.statusCode

        // Handle JWT errors
        if (err instanceof jwt.TokenExpiredError) {
            statusCode = 401
            err.message = "Token expired"
        } else if (err instanceof jwt.JsonWebTokenError) {
            statusCode = 401
            err.message = "Invalid token"
        }

        // Handle missing environment variable error
        if (
            err.code === "ENOENT" &&
            err.syscall === "open" &&
            err.path === ".env"
        ) {
            statusCode = 500
            err.message = "Missing environment variables"
        }

        // Log the error
        if (isDevelopment) {
            console.error("dev", err)
        } else {
            console.error(err.message)
        }

        // Send the error response
        const errorResponse: { error: string; stack?: string } = {
            error: err.message
        }

        if (isDevelopment) {
            errorResponse.stack = err.stack
        }

        res.status(statusCode).json(errorResponse)
    } catch (error) {
        // If an error occurs during error handling, log the error but prevent server crash
        console.error("Error occurred during error handling:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
}
