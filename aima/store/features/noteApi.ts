import { baseUrl } from "@/utils/baseUrl";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
import { getSession as getPubSession } from "@/utils/note";
import { IPubSession } from "@/interfaces/IPubSession";

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

export const createNoteApi = createApi({
  reducerPath: "noteApi",
  baseQuery: customBaseQuery,

  endpoints: builder => ({
    getNotes: builder.mutation<any, {}>({
      query: () => {
        return {
          url: `/notes`,
          method: "GET",
        };
      },
    }),

    createNote: builder.mutation<any, { json: string }>({
      query: ({ json }) => ({
        url: `/notes`,
        method: "POST",
        body: {
          data: json,
        },
      }),
    }),

    updateNote: builder.mutation<any, { shareId: string; json: string }>({
      query: ({ shareId, json }) => ({
        url: `/notes/${shareId}`,
        method: "PATCH",
        body: {
          data: json,
        },
      }),
    }),

    updateNoteCollab: builder.mutation<
      any,
      { shareId: string; shareMode: string; json: string }
    >({
      query: ({ shareId, shareMode, json }) => {
        const session: IPubSession | null = getPubSession();

        let url = "";

        if (shareMode === "public") {
          url = `/notes/${shareMode}/${shareId}`;
        } else {
          if (session && session[shareId]) {
            url = `/notes/${shareMode}/${shareId}/${session[shareId]}`;
          } else {
            url = `/notes/${shareMode}/${shareId}`;
          }
        }

        return {
          url: url,
          method: "PATCH",
          body: {
            data: json,
          },
        };
      },
    }),

    deleteNote: builder.mutation<any, { shareId: string }>({
      query: ({ shareId }) => ({
        url: `/notes/${shareId}`,
        method: "DELETE",
      }),
    }),

    deleteAll: builder.mutation<any, {}>({
      query: ({}) => ({
        url: `/notes`,
        method: "DELETE",
      }),
    }),

    getNoteCollab: builder.mutation<
      any,
      { shareId: string; shareMode: string }
    >({
      query: ({ shareId, shareMode }) => {
        const session: IPubSession | null = getPubSession();

        let url = "";

        if (shareMode === "public") {
          url = `/notes/${shareMode}/${shareId}`;
        } else {
          if (session && session[shareId]) {
            url = `/notes/${shareMode}/${shareId}/${session[shareId]}`;
          } else {
            url = `/notes/${shareMode}/${shareId}`;
          }
        }

        return {
          url,
          method: "GET",
        };
      },
    }),

    getAuth: builder.mutation<any, { shareId: string; password: string }>({
      query: ({ shareId, password }) => {
        return {
          url: `/notes/auth/${shareId}`,
          method: "POST",
          body: {
            password,
          },
        };
      },
    }),
  }),
});
