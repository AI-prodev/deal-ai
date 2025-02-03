import { baseUrl } from "@/utils/baseUrl";
import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

const customBaseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
});

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    requestPasswordReset: builder.mutation<
      any,
      {
        email: string;
      }
    >({
      query: ({ email }) => ({
        url: "/auth/request-password-reset",
        method: "POST",
        body: {
          email: email,
        },
      }),
    }),
    resetPassword: builder.mutation<
      any,
      {
        resetToken: string;
        newPassword: string;
      }
    >({
      query: ({ resetToken, newPassword }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: {
          resetToken: resetToken,
          newPassword: newPassword,
        },
      }),
    }),
  }),
});

export const { useRequestPasswordResetMutation, useResetPasswordMutation } =
  authApi;
