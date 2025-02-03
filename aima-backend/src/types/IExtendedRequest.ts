import { Request, Express } from "express"
import { FilterQuery } from "mongoose"
import { IDomain } from "./IDomain"
import Stripe from "stripe"
export interface IExtendedRequest extends Request {
    user?: {
        id: string
    }
    file?: Express.Multer.File
    roles?: string[]
    additionalFilters?: FilterQuery<Document>
    domain?: IDomain
    customerId?: string
    stripeCustomer?: Stripe.Customer
    shareId?: string
    sharedBlogDomain?: boolean
    customSubdomain?: string
}
