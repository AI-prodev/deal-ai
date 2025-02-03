import { fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { baseUrl } from "@/utils/baseUrl";
import { createApi } from "@reduxjs/toolkit/query/react";
import { ISales, ISalesParams } from "@/interfaces/ISales";
//import { getSession } from "next-auth/react";

const customBaseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  prepareHeaders: async headers => {
    // const session = await getSession();
    // if (session && session.token) {
    //   headers.set("Authorization", `Bearer ${session.token}`);
    // }
    return headers;
  },
});

export const createSalesApi = createApi({
  reducerPath: "salesApi",
  baseQuery: customBaseQuery,
  tagTypes: ["Sales"],
  endpoints: builder => ({
    listFunnelSales: builder.query<any, ISalesParams>({
      query: ({ funnelId, page = 1, limit = 15, sort, filters = {} }) => {
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
        return {
          url: `user/payment/${funnelId}/funnel?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Sales"],
    }),
    downloadFunnelSalesCSV: builder.query<Blob, { funnelId: string }>({
      query: ({ funnelId }) => ({
        url: `user/payment/${funnelId}/funnel/csv`,
        method: "GET",
        responseHandler: response => response.text(),
      }),
    }),
  }),
});

export const { useListFunnelSalesQuery, useLazyDownloadFunnelSalesCSVQuery } =
  createSalesApi;
