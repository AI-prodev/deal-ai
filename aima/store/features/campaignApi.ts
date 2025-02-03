import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
import { ICampaign, ICampaignAsset } from "@/interfaces/ICampaign";
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

export const campaignApi = createApi({
  reducerPath: "campaignApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    getCampaigns: builder.query<ICampaign[], void>({
      query: () => ({
        url: `/campaigns/me`,
        method: "GET",
      }),
    }),
    getCampaign: builder.query<ICampaign, { campaignId: string }>({
      query: ({ campaignId }) => ({
        url: `/campaigns/${campaignId}`,
        method: "GET",
      }),
    }),
    createCampaign: builder.mutation<any, Omit<ICampaign, "">>({
      query: campaign => ({
        url: `/campaigns`,
        method: "POST",
        body: campaign,
      }),
    }),
    deleteCampaign: builder.mutation<
      any,
      { campaignId: string; accessToken: string; fbCampaignId: string }
    >({
      query: ({ campaignId, accessToken, fbCampaignId }) => ({
        url: `/campaigns/${campaignId}?accessToken=${accessToken}&fbCampaignId=${fbCampaignId}`,
        method: "DELETE",
      }),
    }),
    updateCampaign: builder.mutation<
      ICampaign,
      Partial<ICampaign> & Pick<ICampaign, "_id">
    >({
      query: ({ _id, ...patch }) => ({
        url: `/campaigns/${_id}`,
        method: "PUT",
        body: patch,
      }),
    }),
    // Campaign Asset Endpoints
    getCampaignAssets: builder.query<ICampaignAsset[], { campaignId: string }>({
      query: ({ campaignId }) => ({
        url: `/campaigns/${campaignId}/assets`,
        method: "GET",
      }),
    }),
    createCampaignAsset: builder.mutation<any, Omit<ICampaignAsset, any>>({
      query: asset => ({
        url: `/campaign-assets`,
        method: "POST",
        body: asset,
      }),
    }),
    getCampaignAsset: builder.query<ICampaignAsset, { assetId: string }>({
      query: ({ assetId }) => ({
        url: `/campaign-assets/${assetId}`,
        method: "GET",
      }),
    }),
    updateCampaignAsset: builder.mutation<
      any,
      Partial<ICampaignAsset> & Pick<ICampaignAsset, "_id">
    >({
      query: ({ _id, ...patch }) => ({
        url: `/campaign-assets/${_id}`,
        method: "PUT",
        body: patch,
      }),
    }),
    deleteCampaignAsset: builder.mutation<any, { assetId: string }>({
      query: ({ assetId }) => ({
        url: `/campaign-assets/${assetId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetCampaignsQuery,
  useGetCampaignQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useGetCampaignAssetsQuery,
  useCreateCampaignAssetMutation,
  useGetCampaignAssetQuery,
  useUpdateCampaignAssetMutation,
  useDeleteCampaignAssetMutation,
} = campaignApi;
