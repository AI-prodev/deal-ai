import { IUser } from "./IUser";

export interface ICommercialSeller {
  _id?: string;
  userId?: string | IUser;
  propertyName: string;
  propertyDescription: string;
  propertyType?: string;
  listingPrice?: number;
  country?: string;
  state?: string;
  zip?: string;
  location?: string;
  acres?: number;

  vectors?: number[];
  // biRequests?: BusinessInformationRequestInterface[]
  enabled?: boolean;
}

export interface ICommercialAdminSellerApiData {
  results: ICommercialSeller[];
  totalData: number;
}
export interface ICommercialSellerApiData {
  results: ICommercialSeller[];
  totalData: number;
}
export interface ICommercialSellerEachApiData {
  sellers: ICommercialSeller;
}
