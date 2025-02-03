import { convertImageToBlob } from "@/helpers/convertImageToBlob";
import { IPage } from "@/interfaces/IPage";
import { baseUrl } from "@/utils/baseUrl";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
import {
  IAccountProducts,
  IAddProducts,
  IProductsParams,
} from "@/interfaces/IIntegrations";

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

export type CreatePageParamsType = {
  title: string;
  projectId: string;
  funnelId: string;
  path: string;
  templateContentUrl: string;
  templateJsonUrl?: string;
  extraHead?: string;
  extraBody?: string;
  isTemplate?: boolean;
};

export const createPageApi = createApi({
  reducerPath: "pageApi",
  baseQuery: customBaseQuery,
  tagTypes: ["Page"],
  endpoints: builder => ({
    clonePage: builder.mutation<
      any,
      {
        pageId: string;
      }
    >({
      query: ({ pageId }) => ({
        url: `/pages/clone`,
        method: "POST",
        body: {
          pageId,
        },
      }),
    }),
    updatePageSettings: builder.mutation<
      any,
      {
        pageId: string;
        title: string;
        path: string;
        favicon?: string;
      }
    >({
      query: ({ pageId, title, path }) => ({
        url: `/pages/${pageId}/settings`,
        method: "PUT",
        body: {
          title,
          path,
        },
      }),
    }),
    restorePageVersion: builder.mutation<
      any,
      {
        pageId: string;
        versionId: string;
      }
    >({
      query: ({ pageId, versionId }) => ({
        url: `/pages/${pageId}/restore`,
        method: "PUT",
        body: {
          versionId,
        },
      }),
    }),
    getPage: builder.query<
      any,
      {
        pageId: string;
      }
    >({
      query: ({ pageId }) => ({
        url: `/pages/${pageId}`,
        method: "GET",
      }),
    }),
    getFunnelPages: builder.query<
      IPage[],
      {
        funnelId: string;
      }
    >({
      query: ({ funnelId }) => ({
        url: `/pages/${funnelId}/funnel`,
        method: "GET",
      }),
    }),
    getSavedProducts: builder.query<
      { result: IAccountProducts[] },
      IProductsParams
    >({
      query: ({ params }) => ({
        url: `/pages/products`,
        method: "GET",
        params,
      }),
      providesTags: ["Page"],
    }),
    deletePage: builder.mutation<any, { pageId: string; funnelId: string }>({
      query: ({ pageId, funnelId }) => ({
        url: `/pages/${pageId}`,
        method: "DELETE",
        body: {
          funnelId,
        },
      }),
    }),

    startPageRequest: builder.mutation<any, { input: any }>({
      query: ({ input }) => ({
        url: `/pages/start`,
        method: "POST",
        body: input,
      }),
    }),
    queryPageRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/pages/query/${token}`,
        method: "POST",
      }),
    }),
    endPageRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/pages/end/${token}`,
        method: "POST",
      }),
    }),
    addProducts: builder.mutation<
      { message: string },
      {
        id: string | null;
        pageId: string;
        productIds: Omit<IAddProducts, "id">[];
      }
    >({
      query: ({ id, pageId, productIds }) => ({
        url: `/pages/products?accountId=${id}&pageId=${pageId}`,
        method: "POST",
        body: {
          productIds,
        },
      }),
    }),
    deleteProduct: builder.mutation<
      { message: string },
      { pageId: string; priceId: string }
    >({
      query: ({ pageId, priceId }) => ({
        url: `/pages/products/${pageId}?priceId=${priceId}`,
        method: "DELETE",
      }),
    }),

    startQuestionRequest: builder.mutation<any, { input: any }>({
      query: ({ input }) => ({
        url: `/question/start`,
        method: "POST",
        body: input,
      }),
    }),
    queryQuestionRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/question/query/${token}`,
        method: "POST",
      }),
    }),
    endQuestionRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/question/end/${token}`,
        method: "POST",
      }),
    }),
  }),
});
