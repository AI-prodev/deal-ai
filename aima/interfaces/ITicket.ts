import { IUser } from "./IUser";

export interface IVisitor {
  _id?: string;
  name: string;
  email: string;
  language?: string;
  location?: string;
}

export enum MessageTypeEnum {
  TEXT = "Text",
  IMAGE = "Image",
}

export interface IMessage {
  _id: string;
  sentBy: IUser | Pick<IVisitor, "_id" | "name">;
  message: string;
  images?: string[];
  type?: MessageTypeEnum;

  isBot?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export enum TicketStatusEnum {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}
export interface ITicket {
  _id: string;
  appKey: string;
  visitor: IVisitor;

  user?: {
    firstName: string;
    lastName: string;
  };

  title: string; // vistor name or location
  description: string;
  status: TicketStatusEnum;

  messages: IMessage[];

  unreadCount: number;

  lastMessageCreatedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITicketParam {
  id?: string;
  visitorId?: string;
  assistKey?: string;

  sort?: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: TicketStatusEnum;
}

export interface IGetTicketsListResponse {
  results: Omit<ITicket, "messages">[];
  currentPage: number;
  totalCount: number;
  totalPages: number;
  next: {
    page: number | null;
    limit: number | null;
  };
}

export interface IAssistSettings {
  appKey?: string;
  name: string;
  url: string;
  color: string;
}
