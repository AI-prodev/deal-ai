import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:3000";

const customBaseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  prepareHeaders: async headers => {
    const session = await getSession();
    if (session?.token) {
      headers.set("Authorization", `Bearer ${session.token}`);
    }
    return headers;
  },
});

export const marketingHooksApi = createApi({
  reducerPath: "marketingHooksApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    startMarketingRequest: builder.mutation<any, { input: any }>({
      query: ({ input }) => ({
        url: `/marketing-hooks/start`,
        method: "POST",
        body: input,
      }),
    }),
    endMarketingRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/marketing-hooks/end/${token}`,
        method: "POST",
      }),
    }),
    queryMarketingRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/marketing-hooks/query/${token}`,
        method: "POST",
      }),
    }),
    rateCreation: builder.mutation<any, { creationId: string; rating: number }>(
      {
        query: ({ creationId, rating }) => ({
          url: `/creation/update/${creationId}/${rating}`,
          method: "PATCH",
        }),
      }
    ),
    // Image processing endpoints
    startImageRequest: builder.mutation<any, FormData>({
      query: formData => ({
        url: `/marketing-hooks/image/start`,
        method: "POST",
        body: formData,
      }),
    }),
    queryImageRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/marketing-hooks/image/query/${token}`,
        method: "POST",
      }),
    }),
    endImageRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/marketing-hooks/image/end/${token}`,
        method: "POST",
      }),
    }),

    // URL processing endpoints
    startUrlRequest: builder.mutation<any, { input: any }>({
      query: ({ input }) => ({
        url: `/marketing-hooks/url/start`,
        method: "POST",
        body: input,
      }),
    }),
    queryUrlRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/marketing-hooks/url/query/${token}`,
        method: "POST",
      }),
    }),
    endUrlRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/marketing-hooks/url/end/${token}`,
        method: "POST",
      }),
    }),

    // SEO processing endpoints
    startSeoRequest: builder.mutation<any, { input: any }>({
      query: ({ input }) => ({
        url: `/seo/start`,
        method: "POST",
        body: input,
      }),
    }),
    querySeoRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/seo/query/${token}`,
        method: "POST",
      }),
    }),
    endSeoRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/seo/end/${token}`,
        method: "POST",
      }),
    }),

    // Product processing endpoints
    startProductRequest: builder.mutation<any, { input: any }>({
      query: ({ input }) => ({
        url: `/product/start`,
        method: "POST",
        body: input,
      }),
    }),
    queryProductRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/product/query/${token}`,
        method: "POST",
      }),
    }),
    endProductRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/product/end/${token}`,
        method: "POST",
      }),
    }),

    // Product Placement
    startProductPlacementRequest: builder.mutation<any, { input: any }>({
      query: ({ input }) => ({
        url: `/product-placement/start`,
        method: "POST",
        body: input,
      }),
    }),
    queryProductPlacementRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/product-placement/query/${token}`,
        method: "POST",
      }),
    }),
    endProductPlacementRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/product-placement/end/${token}`,
        method: "POST",
      }),
    }),

    compositeCreationFinalizeEcommerce: builder.mutation<any, { input: any }>({
      query: ({ input }) => ({
        url: `/composite-creation/finalize/ecommerce/${input.creationId}`,
        method: "POST",
        body: input,
      }),
    }),

    compositeCreationFinalizeBusinessDesc: builder.mutation<
      any,
      { input: any }
    >({
      query: ({ input }) => ({
        url: `/composite-creation/finalize/business-description/${input.creationId}`,
        method: "POST",
        body: input,
      }),
    }),

    // Email Sequence
    startEmailSequenceRequest: builder.mutation<any, { input: any }>({
      query: ({ input }) => ({
        url: `/email-sequence/start`,
        method: "POST",
        body: input,
      }),
    }),
    queryEmailSequenceRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/email-sequence/query/${token}`,
        method: "POST",
      }),
    }),
    endEmailSequenceRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/email-sequence/end/${token}`,
        method: "POST",
      }),
    }),

    uploadEditedImage: builder.mutation<any, FormData>({
      query: formData => ({
        url: "/upload-edited-image",
        method: "POST",
        body: formData,
      }),
    }),

    startInpaintRequest: builder.mutation<any, FormData>({
      query: formData => ({
        url: `/inpaint/start`,
        method: "POST",
        body: formData,
      }),
    }),

    getInpaintStatusRequest: builder.query<any, string>({
      query: id => `/inpaint/status/${id}`,
    }),

    cleanImageRequest: builder.mutation<any, FormData>({
      query: formData => ({
        url: `/clean/image`,
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useStartMarketingRequestMutation,
  useEndMarketingRequestMutation,
  useQueryMarketingRequestMutation,
  useRateCreationMutation,
  useStartImageRequestMutation,
  useQueryImageRequestMutation,
  useEndImageRequestMutation,
  useStartUrlRequestMutation,
  useQueryUrlRequestMutation,
  useEndUrlRequestMutation,
  useStartSeoRequestMutation,
  useQuerySeoRequestMutation,
  useEndSeoRequestMutation,
  useStartProductRequestMutation,
  useQueryProductRequestMutation,
  useEndProductRequestMutation,
  useStartProductPlacementRequestMutation,
  useQueryProductPlacementRequestMutation,
  useEndProductPlacementRequestMutation,
  useCompositeCreationFinalizeEcommerceMutation,
  useCompositeCreationFinalizeBusinessDescMutation,
  useStartEmailSequenceRequestMutation,
  useQueryEmailSequenceRequestMutation,
  useEndEmailSequenceRequestMutation,
  useUploadEditedImageMutation,
  useStartInpaintRequestMutation,
  useGetInpaintStatusRequestQuery,
  useCleanImageRequestMutation,
} = marketingHooksApi;
