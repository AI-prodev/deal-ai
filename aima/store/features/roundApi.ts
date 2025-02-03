import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
import { baseUrl } from "@/utils/baseUrl";
import { IRound } from "@/interfaces/IRound";

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

export const roundApi = createApi({
  reducerPath: "roundApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    getRounds: builder.query<
      IRound[],
      { campaignId: string; accessToken: string; adAccountId: string }
    >({
      query: ({ campaignId, accessToken, adAccountId }) => ({
        url: `/rounds`,
        method: "GET",
        params: { campaignId, accessToken, adAccountId },
      }),
    }),
  }),
});

export const { useGetRoundsQuery } = roundApi;
