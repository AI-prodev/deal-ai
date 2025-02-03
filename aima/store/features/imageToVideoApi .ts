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

export const imageToVideoApi = createApi({
  reducerPath: "imageToVideoApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    startImageToVideoRequest: builder.mutation<any, { input: any }>({
      query: ({ input }) => ({
        url: `/image-to-video/start`,
        method: "POST",
        body: input,
      }),
    }),
    endImageToVideoRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/image-to-video/end/${token}`,
        method: "POST",
      }),
    }),
    queryImageToVideoRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/image-to-video/query/${token}`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useStartImageToVideoRequestMutation,
  useEndImageToVideoRequestMutation,
  useQueryImageToVideoRequestMutation,
} = imageToVideoApi;
