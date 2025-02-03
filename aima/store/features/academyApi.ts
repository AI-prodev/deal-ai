import { IAcademy } from "@/interfaces/IAcademy";
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

export const createAcademyApi = createApi({
  reducerPath: "academyApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    getIsDaylightSavings: builder.query<
      { [date: string]: boolean },
      { dates: string[] }
    >({
      query: ({ dates }) => ({
        url: `/academies/isDaylightSavings?${dates.map(d => `dates=${d}&`).join("")}`,
        method: "GET",
      }),
    }),
    getAcademyBySlug: builder.query<IAcademy, { slug: string }>({
      query: ({ slug }) => ({
        url: `/academies/${slug}/slug`,
        method: "GET",
      }),
    }),
  }),
});
