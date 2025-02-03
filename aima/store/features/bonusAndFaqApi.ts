import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:3001";

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

export const bonusAndFaqApi = createApi({
  reducerPath: "bonusAndFaqApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    startBonusStackRequest: builder.mutation<any, { input: any }>({
      query: ({ input }) => ({
        url: `/bonus-stacks/start`,
        method: "POST",
        body: input,
      }),
    }),
    queryBonusStackRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/bonus-stacks/query/${token}`,
        method: "POST",
      }),
    }),
    endBonusStackRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/bonus-stacks/end/${token}`,
        method: "POST",
      }),
    }),
    startFaqRequest: builder.mutation<any, { input: any }>({
      query: ({ input }) => ({
        url: `/faq/start`,
        method: "POST",
        body: input,
      }),
    }),
    queryFaqRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/faq/query/${token}`,
        method: "POST",
      }),
    }),
    endFaqRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/faq/end/${token}`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useStartBonusStackRequestMutation,
  useQueryBonusStackRequestMutation,
  useEndBonusStackRequestMutation,
  useStartFaqRequestMutation,
  useQueryFaqRequestMutation,
  useEndFaqRequestMutation,
} = bonusAndFaqApi;
