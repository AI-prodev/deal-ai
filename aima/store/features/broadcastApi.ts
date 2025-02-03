import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { baseUrl } from "@/utils/baseUrl";
import { getSession } from "next-auth/react";
import {
  IBroadcastParams,
  IBroadcastResponse,
  IGetEmailResponse,
  IGetEmailSendersResponse,
  IGetReportListResponse,
  ReportStats,
  SendEmailBody,
} from "@/interfaces/IBroadcast";
import { SendEmailStatus } from "@/components/crm/constants";

const customBaseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  prepareHeaders: async headers => {
    const session = await getSession();
    if (session && session.token) {
      headers.set("Authorization", `Bearer ${session.token}`);
    }
    return headers;
  },
});

export const createBroadcastApi = createApi({
  reducerPath: "broadcastApi",
  baseQuery: customBaseQuery,
  tagTypes: ["Broadcast", "subscribe"],
  endpoints: builder => ({
    sendEmail: builder.mutation<any, SendEmailBody>({
      query: body => ({
        url: "/broadcast-email",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Broadcast"],
    }),
    deleteEmail: builder.mutation<any, string>({
      query: emailId => ({
        url: `/broadcast-email/${emailId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Broadcast"],
    }),
    getEmail: builder.query<IGetEmailResponse, { emailId: string }>({
      query: ({ emailId }) => ({
        url: `/broadcast-email/e/${emailId}`,
        method: "GET",
      }),
      providesTags: ["Broadcast"],
    }),
    getReportList: builder.query<
      IGetReportListResponse,
      IBroadcastParams & { emailId: string }
    >({
      query: ({ emailId, page = 1, limit = 15, sort, search }) => {
        let params = new URLSearchParams();
        params.append("page", String(page));
        params.append("limit", String(limit));

        if (sort) params.append("sort", sort);
        if (search) params.append("search", search);

        return {
          url: `/broadcast-email/report-list/${emailId}?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Broadcast"],
    }),
    getReportStats: builder.query<ReportStats, { emailId: string }>({
      query: ({ emailId }) => ({
        url: `/broadcast-email/stats/${emailId}`,
        method: "GET",
      }),
      providesTags: ["Broadcast"],
    }),
    updateEmail: builder.mutation<any, SendEmailBody & { emailId: string }>({
      query: body => ({
        url: `/broadcast-email/${body?.emailId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Broadcast"],
    }),
    getEmailSenders: builder.query<
      IGetEmailSendersResponse[],
      { sendGridAccountId: string }
    >({
      query: ({ sendGridAccountId }) => ({
        url: `/broadcast-email/${sendGridAccountId}/verified-senders`,
        method: "GET",
      }),
    }),
    checkEmailSubscribeStatus: builder.query<
      { unsubscribed: boolean },
      { contactId: string }
    >({
      query: ({ contactId }) => ({
        url: `/broadcast-email/check-subscribe-status?contactId=${contactId}`,
        method: "GET",
      }),
      providesTags: ["subscribe"],
    }),
    updateEmailSubscribeStatus: builder.mutation<
      any,
      { contactId: string; unsubscribed: boolean }
    >({
      query: body => ({
        url: "/broadcast-email/unsubscribe",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["subscribe"],
    }),
    getEmails: builder.query<
      IBroadcastResponse,
      IBroadcastParams & { status: SendEmailStatus }
    >({
      query: ({ status, page = 1, limit = 15, sort, search }) => {
        let params = new URLSearchParams();
        params.append("page", String(page));
        params.append("limit", String(limit));

        if (sort) params.append("sort", sort);
        if (search) params.append("search", search);

        return {
          url: `/broadcast-email/${status}?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Broadcast"],
    }),
  }),
});

export const {
  useSendEmailMutation,
  useDeleteEmailMutation,
  useUpdateEmailMutation,
  useGetEmailsQuery,
  useGetReportListQuery,
  useGetReportStatsQuery,
  useGetEmailQuery,
  useCheckEmailSubscribeStatusQuery,
  useUpdateEmailSubscribeStatusMutation,
  useGetEmailSendersQuery,
} = createBroadcastApi;
