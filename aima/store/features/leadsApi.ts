import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
import { baseUrl } from "@/utils/baseUrl";

// Custom base query to include JWT token in headers
const customBaseQuery = fetchBaseQuery({
  baseUrl: `${baseUrl}/admin`,
  prepareHeaders: async headers => {
    const session = await getSession();
    if (session && session.token) {
      headers.set("Authorization", `Bearer ${session.token}`);
    }
    return headers;
  },
});

export const createLeadApiClient = createApi({
  reducerPath: "leadApi",
  baseQuery: customBaseQuery,

  endpoints: builder => ({
    listLeads: builder.query({
      query: ({ page = 1, limit = 15, sort, filters = {} }) => {
        let params = new URLSearchParams();
        params.append("page", String(page));
        params.append("limit", String(limit));
        if (sort) {
          params.append("sort", sort);
        }
        for (const key in filters) {
          if (Object.prototype.hasOwnProperty.call(filters, key)) {
            params.append(key, filters[key]);
          }
        }
        return { url: `leads?${params.toString()}` };
      },
    }),
    deleteLead: builder.mutation({
      query: leadId => ({
        url: `leads/${leadId}`,
        method: "DELETE",
      }),
    }),
    reportLead: builder.mutation({
      query: reportData => ({
        url: `leads/report`,
        method: "POST",
        body: reportData,
      }),
    }),
  }),
});

export const {
  useListLeadsQuery,
  useDeleteLeadMutation,
  useReportLeadMutation,
} = createLeadApiClient;
