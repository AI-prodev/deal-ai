import { ICommercialSeller } from "./ICommercialSeller";
import { IUser } from "./IUser";

export interface PropertyInformationRequestInterface {
  property?: Partial<ICommercialSeller>;
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
  }[];
}
