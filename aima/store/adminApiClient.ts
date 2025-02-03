import { baseUrl } from "@/utils/baseUrl";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession, useSession } from "next-auth/react";
import { useMemo } from "react";

const customBaseQuery = fetchBaseQuery({
  baseUrl: `${baseUrl}/admin`,
  prepareHeaders: async headers => {
    const session = await getSession();
    if (session && session.token) {
      headers.set("Authorization", `Bearer ${session.token}`);
    }
    return headers;
  },
});
export const createAdminApiClient = (jwtToken: string) =>
  createApi({
    baseQuery: customBaseQuery,
    endpoints: builder => ({
      listUsers: builder.query({
        query: ({ page = 1, limit = 15, sort, filters = {} }) => {
          let params = new URLSearchParams();
          params.append("page", String(page));
          params.append("limit", String(limit));
          if (sort) {
            params.append("sort", sort);
          }
          for (const key in filters) {
            if (Object.prototype.hasOwnProperty.call(filters, key)) {
              params.append(key, filters[key]);
            }
          }
          return { url: `users?${params.toString()}` };
        },
      }),
      addUser: builder.mutation({
        query: user => ({
          url: "user",
          method: "POST",
          body: user,
        }),
      }),
      suspendUser: builder.mutation({
        query: id => ({
          url: `user/suspend/${id}`,
          method: "PATCH",
        }),
      }),
      deleteUser: builder.mutation({
        query: id => ({
          url: `user/${id}`,
          method: "DELETE",
        }),
      }),
      setUserRoles: builder.mutation({
        query: ({ id, roles }) => ({
          url: `user/roles/${id}`,
          method: "PUT",
          body: { roles },
        }),
      }),
      resetUserPassword: builder.mutation({
        query: ({ id, password }) => ({
          url: `user/reset-password/${id}`,
          method: "PUT",
          body: { password },
        }),
      }),
      downloadUsersCSV: builder.query<Blob, void>({
        query: () => ({
          url: "users/csv",
          responseHandler: response => response.text(),
        }),
      }),
      getStats: builder.query({
        query: () => ({
          url: "getStats",
          method: "GET",
        }),
      }),
      getStripePortalUrls: builder.query({
        query: () => "user/stripePortalUrls",
      }),

      updateUserExpireDate: builder.mutation({
        query: ({ id, expiryDate }) => ({
          url: `user/updateExpire/${id}`,
          method: "PATCH",
          body: { expiryDate },
        }),
      }),
    }),
  });
export type AdminApiClient = ReturnType<typeof createAdminApiClient>;
