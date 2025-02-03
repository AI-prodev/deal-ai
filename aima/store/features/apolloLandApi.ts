import { ThesisData } from "@/interfaces/ThesisData";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:3000";

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
export const apolloLandApi = () =>
  createApi({
    reducerPath: "apolloLandApi",
    baseQuery: customBaseQuery,
    endpoints: builder => ({
      queryRequest: builder.mutation<any, { token: string }>({
        query: ({ token }) => ({
          url: `/queryRequest/${token}`,
          method: "GET",
        }),
      }),
      endRequest: builder.mutation<any, { token: string }>({
        query: ({ token }) => ({
          url: `/endRequest/${token}`,
          method: "GET",
        }),
      }),
      startMatch: builder.mutation<any, ThesisData>({
        query: thesis => {
          // Check if minAskingPrice and maxAskingPrice are present
          const isFiltered = thesis.maxAskingPrice && thesis.minAskingPrice;

          let requestBody: Partial<ThesisData> = {
            thesis: thesis.thesis,
            me: thesis.me,
            trends: thesis.trends,
          };

          if (isFiltered) {
            requestBody.minAskingPrice = thesis.minAskingPrice;
            requestBody.maxAskingPrice = thesis.maxAskingPrice;
            if (thesis.countries && thesis.countries.length > 0) {
              requestBody.countries = thesis.countries;
            }
            if (
              thesis.states &&
              thesis.states.length > 0 &&
              !thesis.states.includes("All")
            ) {
              requestBody.states = thesis.states;
            }
          }

          return {
            url: isFiltered
              ? "/startApolloMatchLandFiltered"
              : "/startApolloMatchLand",
            method: "POST",
            body: requestBody,
          };
        },
      }),
      startApolloMatchPropertyExclusive: builder.mutation<any, ThesisData>({
        query: thesis => {
          const isFiltered = thesis.maxAskingPrice && thesis.minAskingPrice;

          let requestBody: Partial<ThesisData> = {
            thesis: thesis.thesis,
            me: thesis.me,
            trends: thesis.trends,
          };

          if (isFiltered) {
            requestBody.minAskingPrice = thesis.minAskingPrice;
            requestBody.maxAskingPrice = thesis.maxAskingPrice;
            if (thesis.countries && thesis.countries.length > 0) {
              requestBody.countries = thesis.countries;
            }
            if (
              thesis.states &&
              thesis.states.length > 0 &&
              !thesis.states.includes("All")
            ) {
              requestBody.states = thesis.states;
            }
          }

          return {
            url: isFiltered
              ? "/startApolloMatchLandExclusiveFiltered"
              : "/startApolloMatchLandExclusive",
            method: "POST",
            body: requestBody,
          };
        },
      }),
    }),
  });
