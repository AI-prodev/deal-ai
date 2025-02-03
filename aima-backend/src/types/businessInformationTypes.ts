import { IUser } from "./IUser"
import { IBusinessSeller } from "../models/seller"
import { ICommercialSeller } from "../models/commercialSeller"

export interface BusinessInformationRequestInterface {
    business?: Partial<IBusinessSeller>
    property?: Partial<ICommercialSeller>
    buyer?: Partial<IUser>
    seller?: Partial<IUser>
    checklist?: string
    responses?: BusinessInformationRequestResponseInterface[]
    status?: string
}

export interface BusinessInformationRequestResponseInterface {
    isTitle: boolean
    text: string
    response: string
    files: string[]
}
