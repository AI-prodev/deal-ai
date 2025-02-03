import { BusinessInformationRequestInterface } from "./IBusinessInformationRequest";
import { IUser } from "./IUser";

export interface IBusinessSeller {
  _id?: string;
  userId?: string | Partial<IUser>;
  businessName: string;
  businessDescription: string;
  sector: string;
  listingPrice: number;
  country: string;
  state?: string;
  zip?: string;
  businessAge?: number;
  entityName?: string;
  entityType?: string;
  ownershipStructure?: string;
  liabilities?: string;
  purchaseType: "Entity" | "Asset" | "Both" | string;
  assetsIncluded?: string;
  sellerContinuity: boolean;
  biRequests?: BusinessInformationRequestInterface[];
  sellerFinancing: boolean;
  enabled?: boolean;
  imported?: boolean;
  uploadedImages?: {
    fileName: string;
    fileUrl: string;
    tempFileUrl?: string;
  }[];
  uploadedDocuments?: {
    fileName: string;
    fileUrl: string;
    tempFileUrl?: string;
  }[];
}

export interface IBusinessSellerCreate {
  createdSeller: IBusinessSeller;
}
export interface IBusinessSellerAdminApiData {
  results: IBusinessSeller[];
  totalData: number;
}
export interface IBusinessSellerApiData {
  results: IBusinessSeller[];
  totalData: number;
}
export interface IBusinessSellerEachApiData {
  businessSellers: IBusinessSeller;
}
