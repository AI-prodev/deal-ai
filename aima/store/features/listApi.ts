import { fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "@/utils/baseUrl";
import { getSession } from "next-auth/react";
import { IList } from "@/interfaces/IList";
import { IContacts } from "@/interfaces/IContact";

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

export const createListsApi = createApi({
  reducerPath: "listsApi",
  baseQuery: customBaseQuery,
  tagTypes: ["Lists"],
  endpoints: builder => ({
    listLists: builder.query({
      query: ({ page = 1, limit = 15, sort, filters }) => {
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
        return { url: `list/?${params.toString()}`, method: "GET" };
      },
      providesTags: ["Lists"],
    }),
    createList: builder.mutation<IList, Partial<IList>>({
      query: payload => ({
        url: `/list/create`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Lists"],
    }),
    getOneList: builder.query<IList, { listId: string }>({
      query: ({ listId }) => ({
        url: `/list/${listId}`,
        method: "GET",
      }),
    }),
    updateList: builder.mutation<
      IList,
      { id: string; data: { title: string } }
    >({
      query: ({ id, data }) => ({
        url: `list/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Lists"],
    }),
    deleteList: builder.mutation({
      query: listId => ({
        url: `list/${listId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Lists"],
    }),
    addListToContact: builder.mutation<
      IContacts,
      { contactId: string; listIds: string[] }
    >({
      query: payload => ({
        url: `list/addListToContact`,
        method: "POST",
        body: payload,
      }),
    }),
    getOneListContacts: builder.query({
      query: ({ listId, sort, filters }) => {
        let params = new URLSearchParams();

        if (sort) {
          params.append("sort", sort);
        }

        for (const key in filters) {
          if (Object.prototype.hasOwnProperty.call(filters, key)) {
            params.append(key, filters[key]);
          }
        }
        return {
          url: `userContactsByListId/${listId}?${params.toString()}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useListListsQuery,
  useGetOneListQuery,
  useCreateListMutation,
  useUpdateListMutation,
  useDeleteListMutation,
  useAddListToContactMutation,
  useGetOneListContactsQuery,
} = createListsApi;
