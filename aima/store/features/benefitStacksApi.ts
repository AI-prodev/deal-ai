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

export const benefitStackHooksApi = createApi({
  reducerPath: "benefitStacksApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    startBenefitStackRequest: builder.mutation<any, { input: any }>({
      query: ({ input }) => ({
        url: `/benefit-stacks/start`,
        method: "POST",
        body: input,
      }),
    }),
    endBenefitStackRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/benefit-stacks/end/${token}`,
        method: "POST",
      }),
    }),
    queryBenefitStackRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/benefit-stacks/query/${token}`,
        method: "POST",
      }),
    }),
    benefitStackRateCreation: builder.mutation<
      any,
      { creationId: string; rating: number }
    >({
      query: ({ creationId, rating }) => ({
        url: `/creation/update/${creationId}/${rating}`,
        method: "PATCH",
      }),
    }),
  }),
});

export const {
  useStartBenefitStackRequestMutation,
  useEndBenefitStackRequestMutation,
  useQueryBenefitStackRequestMutation,
  useBenefitStackRateCreationMutation,
} = benefitStackHooksApi;
