import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IFile } from "@/interfaces/IFile";
import { baseUrl } from "@/utils/baseUrl";
import { getSession } from "next-auth/react";
import { IFolder } from "@/interfaces/IFolder";

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

export const createFileAPI = createApi({
  reducerPath: "fileApi",
  baseQuery: customBaseQuery,
  tagTypes: ["File", "Files"],
  endpoints: builder => ({
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
        body: file,
      }),
    }),
    createFile: builder.mutation<
      {
        fileId: string;
        signedUrl: string;
      },
      {
        folderId: string;
        displayName: string;
        mimeType: string;
        size: number;
      }
    >({
      query: ({ folderId, displayName, mimeType, size }) => ({
        url: `/files`,
        method: "POST",
        body: {
          folderId,
          displayName,
          mimeType,
          size,
        },
      }),
      invalidatesTags: ["File"],
    }),
    moveFolder: builder.mutation<
      IFolder[],
      {
        folderId: string;
        parentFolderId: string;
      }
    >({
      query: ({ folderId, parentFolderId }) => ({
        url: `/files/${folderId}/moveFolder`,
        method: "POST",
        body: {
          parentFolderId,
        },
      }),
      invalidatesTags: ["File"],
    }),
    createFolder: builder.mutation<
      any,
      {
        parentFolderId: string;
        displayName: string;
      }
    >({
      query: ({ displayName, parentFolderId }) => ({
        url: `/folders`,
        method: "POST",
        body: {
          displayName,
          parentFolderId,
        },
      }),
      invalidatesTags: ["File"],
    }),
    copyFile: builder.mutation<
      any,
      {
        fileId: string;
      }
    >({
      query: ({ fileId }) => ({
        url: `/files/${fileId}/copy`,
        method: "POST",
        body: {},
      }),
    }),
    getFolderByName: builder.query<IFolder, { folderName: string }>({
      query: ({ folderName }) => ({
        url: `/folders/name?folderName=${encodeURIComponent(folderName)}`,
        method: "GET",
      }),
    }),
    getFolder: builder.query<IFolder, { folderId: string }>({
      query: ({ folderId }) => ({
        url: `/folders/${folderId}`,
        method: "GET",
      }),
    }),
    getFileDownloadUrl: builder.query<
      { signedUrl: string },
      { fileId: string }
    >({
      query: ({ fileId }) => ({
        url: `/files/${fileId}/download`,
        method: "GET",
      }),
    }),
    getFileShareToken: builder.query<
      { shareToken: string },
      { fileId: string }
    >({
      query: ({ fileId }) => ({
        url: `/files/${fileId}/share`,
        method: "GET",
      }),
    }),
    getFoldersByFolder: builder.query<IFolder[], { parentFolderId: string }>({
      query: ({ parentFolderId }) => ({
        url: `/folders/${parentFolderId}/parentFolder`,
        method: "GET",
      }),
    }),
    getFilesByFolder: builder.query<IFile[], { folderId: string }>({
      query: ({ folderId }) => ({
        url: `/files/${folderId}/folder`,
        method: "GET",
      }),
    }),
    renameFile: builder.mutation<
      any,
      {
        fileId: string;
        newName: string;
      }
    >({
      query: ({ fileId, newName }) => ({
        url: `/files/${fileId}/name`,
        method: "PATCH",
        body: {
          newName,
        },
      }),
      invalidatesTags: ["File"],
    }),
    renameFolder: builder.mutation<
      any,
      {
        folderId: string;
        newName: string;
      }
    >({
      query: ({ folderId, newName }) => ({
        url: `/folders/${folderId}/name`,
        method: "PATCH",
        body: {
          newName,
        },
      }),
      invalidatesTags: ["File"],
    }),
    moveFile: builder.mutation<
      any,
      {
        fileId: string;
        folderId: string;
      }
    >({
      query: ({ fileId, folderId }) => ({
        url: `/files/${folderId}/${fileId}/moveFolder`,
        method: "GET",
      }),
    }),
    deleteFile: builder.mutation<
      any,
      {
        fileId: string;
      }
    >({
      query: ({ fileId }) => ({
        url: `/files/${fileId}`,
        method: "DELETE",
        body: {},
      }),
      invalidatesTags: ["File"],
    }),
    deleteFolder: builder.mutation<
      any,
      {
        folderId: string;
      }
    >({
      query: ({ folderId }) => ({
        url: `/folders/${folderId}`,
        method: "DELETE",
        body: {},
      }),
      invalidatesTags: ["File"],
    }),
  }),
});
