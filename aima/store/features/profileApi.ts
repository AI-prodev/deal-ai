import { convertImageToBlob } from "@/helpers/convertImageToBlob";
import { IApp } from "@/interfaces/IApp";
import { baseUrl } from "@/utils/baseUrl";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
import { BusinessDetailsFormValues } from "@/components/profile/interfaces";

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

export const createProfileAPI = createApi({
  reducerPath: "profileApi",
  baseQuery: customBaseQuery,
  tagTypes: ["Profile"],
  endpoints: builder => ({
    getProfile: builder.query<any, void>({
      query: () => ({
        url: "/user/me",
        method: "GET",
      }),
      async transformResponse(response: any) {
        if (response.profileImage) {
          const blob = await convertImageToBlob(response.profileImage);
          if (blob) {
            const url = URL.createObjectURL(blob);
            response.profileImage = url;
          } else {
            console.error(
              "Failed to convert profile image to blob:",
              response.profileImage
            );
          }
        }

        return response;
      },
    }),
    createOrUpdateProfile: builder.mutation<
      any,
      {
        userId: string;
        fields: any;
        profileImage: File | null;
      }
    >({
      query: ({ userId, fields, profileImage }) => {
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("fields", JSON.stringify(fields));

        if (profileImage) {
          formData.append("profileImage", profileImage);
        }

        return {
          url: "/user/me",
          method: "POST",
          body: formData,
        };
      },
    }),
    changePassword: builder.mutation<
      any,
      {
        userId: string;
        newPassword: string;
        oldPassword: string;
      }
    >({
      query: ({ userId, oldPassword, newPassword }) => ({
        url: `/auth/change-password/${userId}`,
        method: "PUT",
        body: {
          oldPassword: oldPassword,
          newPassword: newPassword,
        },
      }),
    }),
    getBusinessDetails: builder.query<any, any>({
      query: () => ({
        url: "/user/business-details",
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),
    updateBusinessDetails: builder.mutation<any, BusinessDetailsFormValues>({
      query: body => ({
        url: "/user/business-details",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    getApiKey: builder.query<{ apiKey: string }, void>({
      query: () => ({
        url: "/user/api-key",
        method: "GET",
      }),
    }),
    getMyFileSize: builder.query<{ fileSize: number }, void>({
      query: () => ({
        url: "/user/fileSize/me",
        method: "GET",
      }),
    }),
    getMyApps: builder.query<IApp[], void>({
      query: () => ({
        url: "/user/apps/me",
        method: "GET",
      }),
    }),
    addApp: builder.mutation<void, { appId: string }>({
      query: ({ appId }) => ({
        url: "/user/apps/add",
        method: "POST",
        body: {
          appId,
        },
      }),
    }),
    removeApp: builder.mutation<void, { appId: string }>({
      query: ({ appId }) => ({
        url: "/user/apps/remove",
        method: "DELETE",
        body: {
          appId,
        },
      }),
    }),
    reorderApps: builder.mutation<void, { appIds: string[] }>({
      query: ({ appIds }) => ({
        url: "/user/apps/reorder",
        method: "PUT",
        body: {
          appIds,
        },
      }),
    }),
    changeApiKey: builder.mutation<void, void>({
      query: () => ({
        url: "/user/api-key/change",
        method: "POST",
      }),
    }),
  }),
});

export const { useGetBusinessDetailsQuery, useUpdateBusinessDetailsMutation } =
  createProfileAPI;
