import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
import { IAccount, IBusiness } from "@/interfaces/IAccount";
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

export const accountApi = createApi({
  reducerPath: "accountApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    getAccounts: builder.query<IAccount[], void>({
      query: () => ({
        url: `/accounts/me`,
        method: "GET",
      }),
    }),

    updateAccount: builder.mutation<
      IBusiness,
      Partial<IBusiness> & Pick<IBusiness, "_id">
    >({
      query: ({ _id, ...patch }) => ({
        url: `/business/${_id}`,
        method: "PUT",
        body: patch,
      }),
    }),

    deleteAccount: builder.mutation<any, { accountId: string }>({
      query: ({ accountId }) => ({
        url: `/accounts/${accountId}`,
        method: "DELETE",
      }),
    }),

    createAccount: builder.mutation<IAccount, Partial<IAccount>>({
      query: payload => ({
        url: `/accounts`,
        method: "POST",
        body: payload,
      }),
    }),

    getCSRF: builder.query<IAccount, void>({
      query: () => ({
        url: `/accounts/csrf`,
        method: "PATCH",
      }),
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
  useCreateAccountMutation,
  useGetCSRFQuery,
} = accountApi;
