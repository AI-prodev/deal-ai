import { Request, Response, NextFunction } from "express"
import { body, param, query, validationResult } from "express-validator"
import { TicketStatusEnum } from "../types/ITicket"

export const loginValidators = [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password").notEmpty().withMessage("Password is required")
]

export const registerValidators = [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
]

export const changePasswordValidators = [
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters long")
        .custom((newPassword, { req }) => {
            if (newPassword === req.body.oldPassword) {
                throw new Error(
                    "New password must be different from the old password"
                )
            }
            return true
        })
]

export const validateBusinessSeller = [
    body("businessName").notEmpty().withMessage("Business name is required"),
    body("businessDescription")
        .notEmpty()
        .withMessage("Detailed description of business is required"),
    body("sector").notEmpty().withMessage("Sector is required"),
    body("listingPrice")
        .notEmpty()
        .withMessage("Listing price is required")
        .isNumeric()
        .withMessage("Listing price must be a number"),
    body("country").notEmpty().withMessage("Country is required"),
    body("state").optional().isString(),
    body("zip").optional().isString(),
    body("businessAge").optional().isNumeric(),
    body("entityName").optional().isString(),
    body("entityType").optional().isString(),
    body("ownershipStructure").optional().isString(),
    body("liabilities").optional().isString(),
    // body("purchaseType")
    //     .notEmpty()
    //     .withMessage("Entity purchase or asset purchase is required")
    //     .isIn(["Entity", "Asset", "Both"])
    //     .withMessage("Invalid purchase type"),
    body("assetsIncluded").optional().isString(),
    body("sellerContinuity").optional().isBoolean()

    // (req: Request, res: Response, next: NextFunction) => {
    //     const errors = validationResult(req)
    //     if (!errors.isEmpty()) {
    //         return res.status(400).json({ errors: errors.array() })
    //     }
    //     next()
    // }
]

export const validateCommercialSeller = [
    body("propertyName").notEmpty().withMessage("Property Name  is required"),
    body("propertyDescription")
        .notEmpty()
        .withMessage("Detailed description of property is required"),
    body("propertyType").notEmpty().withMessage("Property Type is required"),
    body("listingPrice")
        .notEmpty()
        .withMessage("Listing price is required")
        .isNumeric()
        .withMessage("Listing price must be a number"),
    body("country").notEmpty().withMessage("Country is required"),
    body("state").optional().isString(),
    body("zip").optional().isString(),
    body("location").optional().isString(),
    body("acres").optional().isNumeric()
]

/* Assist */
/* Visitor */
export const validateCreateVisitorTicket = [
    query("visitorId").notEmpty().withMessage("Visitor id is required"),
    query("assistKey").notEmpty().withMessage("Assist Key is required"),

    body("message").notEmpty().withMessage("Message is required"),

    body("name").notEmpty().withMessage("Name is required"),
    body("email").optional(),
    body("location").notEmpty().withMessage("Location is required"),
    body("language").notEmpty().withMessage("Language is required")
]

export const validateCreateVisitorMessage = [
    param("id").notEmpty().withMessage("Id is required"),
    query("visitorId").notEmpty().withMessage("Visitor id is required"),
    query("assistKey").notEmpty().withMessage("Assist Key is required"),
    body("message").notEmpty().withMessage("Message is required")
]

export const validateGetVisitorTickets = [
    query("visitorId").notEmpty().withMessage("Visitor id is required"),
    query("assistKey").notEmpty().withMessage("Assist Key is required")
]

export const validateGetVisitorTicketMessagesById = [
    param("id").not().isIn([":id"]).notEmpty().withMessage("Id is required"),
    query("visitorId").notEmpty().withMessage("Visitor id is required"),
    query("assistKey").notEmpty().withMessage("Assist Key is required")
]

export const validateGetVisitorTicketById = [
    param("id").not().isIn([":id"]).notEmpty().withMessage("Id is required"),
    query("assistKey").notEmpty().withMessage("Assist Key is required")
]

/* User */
export const validateGetTicketMessages = [
    param("id").notEmpty().withMessage("Id is required")
]

export const validateCreateMessage = [
    param("id").not().isIn([":id"]).notEmpty().withMessage("Id is required"),
    body("message").notEmpty().withMessage("Message is required")
]
export const validatePatchVisitorData = [
    param("id").notEmpty().withMessage("Id is required"),
    body("name").notEmpty().withMessage("Name is required"),
    body("email").notEmpty().withMessage("Email is required")
]

/* Assist Settings */
export const validatePatchAssistSettings = [
    body("name").optional().notEmpty(),
    body("url").optional().notEmpty(),
    body("color").optional().notEmpty()
]
