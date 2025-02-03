import {
  IAssistSettings,
  IGetTicketsListResponse,
  IMessage,
  ITicket,
  ITicketParam,
} from "@/interfaces/ITicket";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:3000";

const customBaseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  prepareHeaders: async headers => {
    const session = await getSession();
    if (session?.token) {
      headers.set("Authorization", `Bearer ${session.token}`);
    }
    return headers;
  },
});

export const assistApi = createApi({
  reducerPath: "assistApi",
  baseQuery: customBaseQuery,
  tagTypes: [
    "Settings",
    "VisitorTicket",
    "VisitorTickets",
    "Ticket",
    "Tickets",
  ],
  keepUnusedDataFor: 0,
  endpoints: builder => ({
    /* Settings */
    getAssistSettings: builder.query<IAssistSettings, { assistKey: string }>({
      query: ({ assistKey }) => {
        let params = new URLSearchParams();

        params.append("assistKey", String(assistKey));
        return {
          url: `/assist/settings/?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Settings"],
    }),
    patchAssistSettings: builder.mutation<{ assistKey: string }, any>({
      query: (body: IAssistSettings) => {
        return {
          url: `/assist/settings`,
          method: `PATCH`,
          body,
        };
      },
      invalidatesTags: ["Settings"],
    }),
    /* User */
    generateAssistKey: builder.mutation<{ assistKey: string }, any>({
      query: () => {
        return {
          url: `/tickets/generate-key`,
          method: `POST`,
        };
      },
    }),
    createMessage: builder.mutation<any, { id: string; message: string }>({
      query: ({ id, message }) => {
        return {
          url: `/tickets/${id}/message`,
          method: `POST`,
          body: { message },
        };
      },
      invalidatesTags: ["Ticket"],
    }),
    createImageMessage: builder.mutation<any, { id: string; data: FormData }>({
      query: ({ id, data }) => {
        return {
          url: `/tickets/${id}/image-message`,
          method: `POST`,
          body: data,
        };
      },
      invalidatesTags: ["Ticket"],
    }),
    updateTicketStatus: builder.mutation<any, { id: string }>({
      query: ({ id }) => {
        return {
          url: `/tickets/${id}/status`,
          method: `PATCH`,
        };
      },
      invalidatesTags: ["Ticket", "Tickets"],
    }),
    getAssistKey: builder.query<{ assistKey: string }, any>({
      query: () => {
        return {
          url: `/tickets/key`,
          method: "GET",
        };
      },
    }),
    getTickets: builder.query<IGetTicketsListResponse, ITicketParam>({
      query: ({ page, limit, search, status, sort }) => {
        let params = new URLSearchParams();

        if (page) params.append("page", String(page));
        if (sort) params.append("sort", String(sort));
        if (limit) params.append("limit", String(limit));
        if (search) params.append("search", String(search));
        if (status) params.append("status", String(status));

        return {
          url: `/tickets/?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Tickets"],
    }),
    getTicketById: builder.query<Omit<ITicket, "messages">, { id: string }>({
      query: ({ id }) => {
        return {
          url: `/tickets/${id}`,
          method: "GET",
        };
      },
      providesTags: ["Ticket"],
    }),
    getTicketMessagesById: builder.query<
      {
        results: IMessage[];
        currentPage: number;
        totalCount: number;
        totalPages: number;
        next: {
          page: number | null;
          limit: number | null;
        };
      },
      ITicketParam
    >({
      query: ({ id, page, limit, search }) => {
        let params = new URLSearchParams();

        if (page) params.append("page", String(page));
        if (limit) params.append("limit", String(limit));
        if (search) params.append("search", String(search));
        return {
          url: `/tickets/${id}/messages?${params}`,
          method: "GET",
        };
      },
      providesTags: ["Ticket"],
    }),

    /* Visitor */
    updateVisitorData: builder.mutation<
      { data: ITicket },
      {
        id: string;
        query: {
          assistKey: string;
          visitorId: string;
        };
        body: { name: string; email: string };
      }
    >({
      query: ({ id, query: { assistKey, visitorId }, body }) => {
        let params = new URLSearchParams();
        params.append("visitorId", visitorId);
        params.append("assistKey", assistKey);

        return {
          url: `/tickets/${id}/visitor-data/?${params.toString()}`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["VisitorTicket"],
    }),
    createVisitorTicket: builder.mutation<
      { data: ITicket },
      {
        query: {
          assistKey: string;
          visitorId: string;
        };
        body: {
          message: string;
          name: string;
          email: string;
          language: string;
          location: string;
        };
      }
    >({
      query: ({ query: { assistKey, visitorId }, body }) => {
        let params = new URLSearchParams();
        params.append("visitorId", visitorId);
        params.append("assistKey", assistKey);

        return {
          url: `/visitors/tickets/?${params.toString()}`,
          method: `POST`,
          body,
        };
      },
      invalidatesTags: ["VisitorTickets"],
    }),
    createVisitorMessage: builder.mutation<
      any,
      {
        id: string;
        visitorId: string;
        assistKey: string;
        message: string;
      }
    >({
      query: ({ id, visitorId, assistKey, message }) => {
        let params = new URLSearchParams();
        params.append("visitorId", visitorId);
        params.append("assistKey", assistKey);

        return {
          url: `/visitors/tickets/${id}/message?${params.toString()}`,
          method: `POST`,
          body: { message },
        };
      },
      invalidatesTags: ["VisitorTicket"],
    }),
    createVisitorImageMessage: builder.mutation<
      any,
      {
        id: string;
        visitorId: string;
        assistKey: string;
        data: FormData;
      }
    >({
      query: ({ id, visitorId, assistKey, data }) => {
        let params = new URLSearchParams();
        params.append("visitorId", visitorId);
        params.append("assistKey", assistKey);

        return {
          url: `/visitors/tickets/${id}/image-message?${params.toString()}`,
          method: `POST`,
          body: data,
        };
      },
      invalidatesTags: ["VisitorTicket"],
    }),
    getVisitorTickets: builder.query<IGetTicketsListResponse, ITicketParam>({
      query: ({ page, limit, search, visitorId, assistKey }) => {
        let params = new URLSearchParams();
        params.append("visitorId", String(visitorId));
        params.append("assistKey", String(assistKey));

        if (page) params.append("page", String(page));
        if (limit) params.append("limit", String(limit));
        if (search) params.append("search", String(search));

        return {
          url: `/visitors/tickets/?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["VisitorTickets"],
    }),
    getVisitorTicketById: builder.query<
      Omit<ITicket, "messages">,
      { id: string; assistKey: string }
    >({
      query: ({ id, assistKey }) => {
        let params = new URLSearchParams();
        params.append("assistKey", String(assistKey));

        return {
          url: `/visitors/tickets/${id}?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["VisitorTicket"],
    }),
    getVisitorTicketMessagesById: builder.query<
      {
        results: IMessage[];
        currentPage: number;
        totalCount: number;
        totalPages: number;
        next: {
          page: number | null;
          limit: number | null;
        };
      },
      ITicketParam
    >({
      query: ({ id, visitorId, page, limit, search, assistKey }) => {
        let params = new URLSearchParams();
        params.append("visitorId", String(visitorId));
        params.append("assistKey", String(assistKey));

        if (page) params.append("page", String(page));
        if (limit) params.append("limit", String(limit));
        if (search) params.append("search", String(search));

        return {
          url: `/visitors/tickets/${id}/messages?${params}`,
          method: "GET",
        };
      },
      providesTags: ["VisitorTicket"],
    }),
  }),
});

export const {
  /* Settings */
  useGetAssistSettingsQuery,
  usePatchAssistSettingsMutation,

  /* User */
  useGenerateAssistKeyMutation,
  useCreateMessageMutation,
  useCreateImageMessageMutation,
  useUpdateTicketStatusMutation,
  useGetAssistKeyQuery,
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useGetTicketMessagesByIdQuery,

  /* Visitor */
  useCreateVisitorTicketMutation,
  useCreateVisitorMessageMutation,
  useCreateVisitorImageMessageMutation,
  useUpdateVisitorDataMutation,
  useGetVisitorTicketsQuery,
  useGetVisitorTicketByIdQuery,
  useGetVisitorTicketMessagesByIdQuery,
} = assistApi;
