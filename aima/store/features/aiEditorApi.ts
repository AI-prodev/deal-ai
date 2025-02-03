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

export const aiEditorApi = createApi({
  reducerPath: "aiEditorApi",
  baseQuery: customBaseQuery,
  tagTypes: ["AIEditor"],
  endpoints: builder => ({
    uploadOriginalImages: builder.mutation({
      query: formData => ({
        url: "/ai-editor/upload-original",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["AIEditor"],
    }),
    updateEditedImage: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/ai-editor/update-edited/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["AIEditor"],
    }),
    listAIEditorEntries: builder.query({
      query: () => "/ai-editor/list",
      providesTags: ["AIEditor"],
    }),
    deleteUserAIEditorEntry: builder.mutation({
      query: id => ({
        url: `/ai-editor/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AIEditor"],
    }),
  }),
});

export const {
  useUploadOriginalImagesMutation,
  useUpdateEditedImageMutation,
  useListAIEditorEntriesQuery,
  useDeleteUserAIEditorEntryMutation,
} = aiEditorApi;
