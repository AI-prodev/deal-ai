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

export const heroApi = createApi({
  reducerPath: "heroApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    startHeroRequest: builder.mutation<any, { input: any }>({
      query: ({ input }) => ({
        url: `/hero/start`,
        method: "POST",
        body: input,
      }),
    }),
    endHeroRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/hero/end/${token}`,
        method: "POST",
      }),
    }),
    queryHeroRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/hero/query/${token}`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useStartHeroRequestMutation,
  useEndHeroRequestMutation,
  useQueryHeroRequestMutation,
} = heroApi;
