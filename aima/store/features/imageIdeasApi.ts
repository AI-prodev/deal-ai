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

export const imageIdeasApi = createApi({
  reducerPath: "imageIdeasApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    startImageIdeasRequest: builder.mutation<any, { input: any }>({
      query: ({ input }) => ({
        url: `/image-ideas/start`,
        method: "POST",
        body: input,
      }),
    }),
    endImageIdeasRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/image-ideas/end/${token}`,
        method: "POST",
      }),
    }),
    queryImageIdeasRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/image-ideas/query/${token}`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useStartImageIdeasRequestMutation,
  useEndImageIdeasRequestMutation,
  useQueryImageIdeasRequestMutation,
} = imageIdeasApi;
