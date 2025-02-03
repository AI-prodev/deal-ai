import {
  ICommercialSeller,
  ICommercialAdminSellerApiData,
  ICommercialSellerEachApiData,
  ICommercialSellerApiData,
} from "@/interfaces/ICommercialSeller";
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

export const propertySellerApi = createApi({
  reducerPath: "propertySellerApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    createPropertySeller: builder.mutation<
      ICommercialSeller,
      Partial<ICommercialSeller>
    >({
      query: newPropertySeller => ({
        url: "seller/property",
        method: "POST",
        body: newPropertySeller,
      }),
    }),
    getAllPropertySellers: builder.query<ICommercialSellerApiData, any>({
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
        return { url: `seller/property?${params.toString()}` };
      },
    }),
    getAllAdminPropertySellers: builder.query<
      ICommercialAdminSellerApiData,
      any
    >({
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
        return { url: `admin/sell-property?${params.toString()}` };
      },
    }),
    getPropertySellerById: builder.query<ICommercialSellerEachApiData, string>({
      query: id => `seller/property/${id}`,
    }),
    updatePropertySeller: builder.mutation<
      ICommercialSeller,
      { id: string; data: Partial<ICommercialSeller> }
    >({
      query: ({ id, data }) => ({
        url: `seller/property/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deletePropertySeller: builder.mutation<{ success: boolean }, string>({
      query: id => ({
        url: `seller/property/${id}`,
        method: "DELETE",
      }),
    }),
    deleteAdminPropertySeller: builder.mutation<{ success: boolean }, string>({
      query: id => ({
        url: `admin/sell-property/${id}`,
        method: "DELETE",
      }),
    }),
    togglePropertySellerEnabled: builder.mutation<
      ICommercialSeller,
      { id: string }
    >({
      query: ({ id }) => ({
        url: `admin/sell-property/toggle/${id}`,
        method: "PUT",
      }),
    }),
  }),
});

export const {
  useCreatePropertySellerMutation,
  useGetAllAdminPropertySellersQuery,
  useGetAllPropertySellersQuery,
  useGetPropertySellerByIdQuery,
  useUpdatePropertySellerMutation,
  useDeletePropertySellerMutation,
  useDeleteAdminPropertySellerMutation,
  useTogglePropertySellerEnabledMutation,
} = propertySellerApi;
