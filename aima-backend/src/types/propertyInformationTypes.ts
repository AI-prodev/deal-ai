import { IUser } from "./IUser"
import { ICommercialSeller } from "../models/commercialSeller"

export interface PropertyInformationRequestInterface {
    business?: Partial<ICommercialSeller>
    buyer?: Partial<IUser>
    seller?: Partial<IUser>
    checklist?: string
    responses?: PropertyInformationRequestResponseInterface[]
    status?: string
}

export interface PropertyInformationRequestResponseInterface {
    isTitle: boolean
    text: string
    response: string
    files: string[]
}
