import {
  IBusinessSeller,
  IBusinessSellerAdminApiData,
  IBusinessSellerEachApiData,
  IBusinessSellerApiData,
  IBusinessSellerCreate,
} from "@/interfaces/IBusinessSeller";
import { baseUrl } from "@/utils/baseUrl";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession, signOut } from "next-auth/react";

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

export const businessSellerApi = createApi({
  reducerPath: "businessSellerApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    createBusinessSeller: builder.mutation<
      IBusinessSellerCreate,
      Partial<IBusinessSeller>
    >({
      query: newBusinessSeller => ({
        url: "seller",
        method: "POST",
        body: newBusinessSeller,
      }),
    }),
    getAllBusinessSellers: builder.query<IBusinessSellerApiData, any>({
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
        return { url: `seller?${params.toString()}` };
      },
    }),
    getAllAdminBusinessSellers: builder.query<IBusinessSellerAdminApiData, any>(
      {
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
          return { url: `admin/sell-business?${params.toString()}` };
        },
      }
    ),
    getBusinessSellerById: builder.query<IBusinessSellerEachApiData, string>({
      query: id => `seller/${id}`,
    }),
    updateBusinessSeller: builder.mutation<
      IBusinessSeller,
      { id: string; data: Partial<IBusinessSeller> }
    >({
      query: ({ id, data }) => ({
        url: `seller/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteBusinessSeller: builder.mutation<{ success: boolean }, string>({
      query: id => ({
        url: `seller/${id}`,
        method: "DELETE",
      }),
    }),
    deleteAdminBusinessSeller: builder.mutation<{ success: boolean }, string>({
      query: id => ({
        url: `admin/sell-business/${id}`,
        method: "DELETE",
      }),
    }),

    getPresignedUrlForUpload: builder.mutation<
      { signedUrl: string; fileUrl: string },
      { fileType?: string; fileName?: string }
    >({
      query: file => ({
        url: `seller/generate-presigned-url`,
        body: file,
        method: "POST",
      }),
    }),
    sendFileToS3: builder.mutation<
      any,
      {
        signedUrl: string;
        file: File;
      }
    >({
      query: ({ signedUrl, file }) => ({
        url: signedUrl,
        method: "PUT",
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: file,
      }),
    }),
    toggleBusinessSellerEnabled: builder.mutation<
      IBusinessSeller,
      { id: string }
    >({
      query: ({ id }) => ({
        url: `admin/sell-business/toggle/${id}`,
        method: "PUT",
      }),
    }),
  }),
});

export const {
  useCreateBusinessSellerMutation,
  useGetAllAdminBusinessSellersQuery,
  useGetAllBusinessSellersQuery,
  useGetBusinessSellerByIdQuery,
  useUpdateBusinessSellerMutation,
  useDeleteBusinessSellerMutation,
  useDeleteAdminBusinessSellerMutation,
  useToggleBusinessSellerEnabledMutation,
  useGetPresignedUrlForUploadMutation,
  useSendFileToS3Mutation,
} = businessSellerApi;
