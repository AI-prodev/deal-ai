import { IApp } from "@/interfaces/IApp";
import { baseUrl } from "@/utils/baseUrl";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

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

export const createAppApi = createApi({
  reducerPath: "appApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    getAvailableApps: builder.query<IApp[], {}>({
      query: ({}) => ({
        url: `/apps`,
        method: "GET",
      }),
    }),
  }),
});
