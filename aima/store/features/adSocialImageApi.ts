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

export const adSocialImageApi = createApi({
  reducerPath: "adSocialImageApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    startAdSocialImageRequest: builder.mutation<any, { input: any }>({
      query: ({ input }) => ({
        url: `/adSocialImage/start`,
        method: "POST",
        body: input,
      }),
    }),
    endAdSocialImageRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/adSocialImage/end/${token}`,
        method: "POST",
      }),
    }),
    queryAdSocialImageRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/adSocialImage/query/${token}`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useStartAdSocialImageRequestMutation,
  useEndAdSocialImageRequestMutation,
  useQueryAdSocialImageRequestMutation,
} = adSocialImageApi;
