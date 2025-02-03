import { IBusinessSeller } from "./IBusinessSeller";
import { IUser } from "./IUser";

export interface BusinessInformationRequestInterface {
  business?: Partial<IBusinessSeller>;
  buyer?: Partial<IUser>;
  seller?: Partial<IUser>;
  checklist?: string;
  status?: string;
  checkedAt?: string;
  updatedAt?: string;
  responses?: ResponseItem[];
}

export interface ResponseItem {
  isTitle: boolean;
  text: string;
  response: string;
  isSentToSeller?: boolean;
  section?: number;
  files: {
    fileName: string;
    fileUrl: string;
  }[];
  replies: {
    actor: string;
    text: string;
    createdAt?: string;
    updatedAt?: string;
  }[];
}
