import { getSession } from "next-auth/react";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  IAccountProducts,
  IIntegrationStripeAccounts,
  IIntegrationStripeConnect,
} from "@/interfaces/IIntegrations";
import { baseUrl } from "@/utils/baseUrl";

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

export const createIntegrationApi = createApi({
  reducerPath: "integrationApi",
  baseQuery: customBaseQuery,
  tagTypes: ["Integration", "Page"],
  endpoints: builder => ({
    getConnectedStripeAccounts: builder.query<
      IIntegrationStripeAccounts[],
      void
    >({
      query: () => ({
        url: `/user/accounts`,
        method: "GET",
      }),
      providesTags: ["Integration"],
    }),
    getAccountProducts: builder.query<
      { data: IAccountProducts[] },
      string | undefined
    >({
      query: id => ({
        url: `/user/accounts/${id}`,
        method: "GET",
      }),
    }),
    createStripeConnect: builder.mutation<IIntegrationStripeConnect, void>({
      query: () => ({
        url: `/user/create-connect-account`,
        method: "POST",
      }),
    }),
    deleteStripeAccount: builder.mutation<any, string>({
      query: id => ({
        url: `/user/accounts/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Integration", "Page"],
    }),
    getIntegrations: builder.query<any, string>({
      query: (type: "sendgrid" | "stripe" | "zapier") => ({
        url: `/integrations/${type}`,
        method: "GET",
      }),
      providesTags: ["Integration"],
    }),
    addIntegration: builder.mutation<
      any,
      { type: "sendgrid" | "stripe" | "zapier"; data: any }
    >({
      query: ({ type, data }) => ({
        url: `/integrations`,
        method: "POST",
        body: { type, data },
      }),
      invalidatesTags: ["Integration"],
    }),
    deleteIntegration: builder.mutation<any, string>({
      query: (id: string) => ({
        url: `/integrations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Integration"],
    }),
  }),
});

export const {
  useGetConnectedStripeAccountsQuery,
  useGetAccountProductsQuery,
  useCreateStripeConnectMutation,
  useDeleteStripeAccountMutation,
  useGetIntegrationsQuery,
  useAddIntegrationMutation,
  useDeleteIntegrationMutation,
} = createIntegrationApi;
