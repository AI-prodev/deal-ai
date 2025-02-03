import { IDomain } from "@/interfaces/IDomain";
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

export const createStripeApi = createApi({
  reducerPath: "stripeApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    getConfig: builder.query<any, {}>({
      query: ({}) => ({
        url: `/stripe/config`,
        method: "GET",
      }),
    }),
    getPrice: builder.query<any, { priceId: string }>({
      query: ({ priceId }) => ({
        url: `/stripe/price/${priceId}`,
        method: "GET",
      }),
    }),
    getProduct: builder.query<any, { productId: string }>({
      query: ({ productId }) => ({
        url: `/stripe/product/${productId}`,
        method: "GET",
      }),
    }),
    purchase: builder.mutation<
      any,
      { priceId: string; paymentMethodId?: string }
    >({
      query: ({ priceId, paymentMethodId }) => ({
        url: `/stripe/purchase`,
        method: "POST",
        body: {
          priceId,
          paymentMethodId,
        },
      }),
    }),
  }),
});
