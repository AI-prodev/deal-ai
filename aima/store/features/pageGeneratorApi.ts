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

export const pageGeneratorApi = createApi({
  reducerPath: "pageGeneratorApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    startPageGeneratorRequest: builder.mutation<
      any,
      { title: string; input: any; projectId?: string; funnelId?: string }
    >({
      query: ({ title, input, projectId, funnelId }) => ({
        url: `/page-generator/start`,
        method: "POST",
        body: { title, input, projectId, funnelId },
      }),
    }),
    endPageGeneratorRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/page-generator/end/${token}`,
        method: "POST",
      }),
    }),
    queryPageGeneratorRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/page-generator/query/${token}`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useStartPageGeneratorRequestMutation,
  useEndPageGeneratorRequestMutation,
  useQueryPageGeneratorRequestMutation,
} = pageGeneratorApi;
