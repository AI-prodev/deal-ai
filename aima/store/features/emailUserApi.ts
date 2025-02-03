import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "@/utils/baseUrl";
import { getSession } from "next-auth/react";
import { IEmailUser } from "@/interfaces/IEmailUser";

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

export const createEmailUserAPI = createApi({
  reducerPath: "emailApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    getConfig: builder.query<{ defaultDomainName: string }, {}>({
      query: ({}) => ({
        url: `/emailUsers/config`,
        method: "GET",
      }),
    }),
    getQuotas: builder.query<
      {
        emailFreeQuota: number;
        emailPaidQuota: number;
        existingEmailUsers: number;
      },
      {}
    >({
      query: ({}) => ({
        url: `/emailUsers/quotas`,
        method: "GET",
      }),
    }),
    createEmailUser: builder.mutation<
      {
        emailUserId: string;
      },
      {
        domainId?: string;
        emailPrefix: string;
        password: string;
        firstName: string;
        lastName: string;
        paymentMethodId?: string;
        priceId?: string;
      }
    >({
      query: ({
        domainId,
        emailPrefix,
        password,
        firstName,
        lastName,
        paymentMethodId,
        priceId,
      }) => ({
        url: `/emailUsers?allowNewCustomer=yes`,
        method: "POST",
        body: {
          domainId,
          emailPrefix,
          password,
          firstName,
          lastName,
          paymentMethodId,
          priceId,
        },
      }),
    }),
    shareEmailCredentials: builder.mutation<
      any,
      {
        emailUserId: string;
        toEmail: string;
      }
    >({
      query: ({ emailUserId, toEmail }) => ({
        url: `/emailUsers/share`,
        method: "POST",
        body: {
          emailUserId,
          toEmail,
        },
      }),
    }),
    changeEmailPassword: builder.mutation<
      any,
      {
        emailUserId: string;
        newPassword: string;
      }
    >({
      query: ({ emailUserId, newPassword }) => ({
        url: `/emailUsers/password`,
        method: "PATCH",
        body: {
          emailUserId,
          newPassword,
        },
      }),
    }),
    getMyEmailUsers: builder.query<IEmailUser[], {}>({
      query: ({}) => ({
        url: `/emailUsers/me`,
        method: "GET",
      }),
    }),
    deleteEmailUser: builder.mutation<
      any,
      {
        emailUserId: string;
      }
    >({
      query: ({ emailUserId }) => ({
        url: `/emailUsers/${emailUserId}`,
        method: "DELETE",
        body: {},
      }),
    }),
  }),
});
