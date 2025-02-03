import { SendEmailStatus } from "@/components/crm/constants";
import type { ILists } from "@/interfaces/Ilists";

export interface IOption {
  label: string;
  value: string;
}

export interface ISendEmailFormValues {
  lists: IOption[];
  sumListsContacts: number;
  sendgridAccount: string;
  sender: string;
  subject: string;
  html: string;
  title: string;
}

export type SendEmailBody = {
  lists: string[];
  sendgridAccount: string;
  subject: string;
  html: string;
  title: string;
  scheduledAt: string | null;
  status: SendEmailStatus;
};

export interface IBroadcastParams {
  page: number;
  limit: number;
  sort: string;
  search: string;
}

export type EmailStats = {
  bounceCount: number;
  clickCount: number;
  opensCount: number;
  recipientsCount: number;
};

export type Email = {
  _id: string;
  sentAt: string;
  createdAt: string;
} & SendEmailBody &
  EmailStats;

export type ReportStats = {
  clickRate: string;
  openRate: string;
  deliveredCount: number;
  sentAt: string;
  title: string;
  _id: string;
} & EmailStats;

export interface IBroadcastResponse {
  currentPage: number;
  next: {
    page: number;
    limit: number;
  };
  results: Email[];
  totalCount: number;
  totalPages: number;
}

export interface IGetEmailResponse {
  lists: ILists[];
  sendgridAccount: {
    data: {
      email: string;
      first_name: string;
      last_name: string;
    };
    _id: string;
  };
  from: {
    email: string;
    name: string;
  };
  html: string;
  subject: string;
  title: string;
  sentAt: string;
}

export interface IReportList {
  clickCount: number;
  opensCount: number;
  sentAt: string;
  status: string;
  to: {
    email: string;
    name: string;
  };
}

export interface IGetReportListResponse {
  results: IReportList[];
  totalCount: number;
}

export interface IGetEmailSendersResponse {
  id: number;
  from: {
    email: string;
    name: string;
  };
  address: string;
  city: string;
  country: string;
  verified: {
    status: boolean;
    reason: boolean;
  };
}
