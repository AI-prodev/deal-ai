import { baseUrl } from "@/utils/baseUrl";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
import { IContacts, IContactsParams } from "@/interfaces/IContact";

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

export const createContactApi = createApi({
  reducerPath: "contactApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    listFunnelContacts: builder.query({
      query: ({ funnelId, page = 1, limit = 15, sort, filters = {} }) => {
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
        return {
          url: `/contacts/${funnelId}/funnel?${params.toString()}`,
        };
      },
    }),
    downloadFunnelContactsCSV: builder.query<Blob, { funnelId: string }>({
      query: ({ funnelId }) => ({
        url: `/contacts/${funnelId}/funnel/csv`,
        responseHandler: response => response.text(),
      }),
    }),
    deleteContact: builder.mutation<any, { contactId: string }>({
      query: ({ contactId }) => ({
        url: `/contacts/${contactId}`,
        method: "DELETE",
      }),
    }),
    listContacts: builder.query<any, IContactsParams>({
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
        return {
          url: `contacts/all?${params.toString()}`,
          method: "GET",
        };
      },
    }),
    contactLists: builder.query<any, IContactsParams & { contactId: string }>({
      query: ({ contactId, page = 1, limit = 15, sort, filters }) => {
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
        return {
          url: `list/contact/${contactId}?${params.toString()}`,
          method: "GET",
        };
      },
    }),
    contactPurchases: builder.query<
      any,
      IContactsParams & { contactId: string }
    >({
      query: ({ contactId, page = 1, limit = 15, sort, filters }) => {
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
        return {
          url: `user/paymentbyContactId/${contactId}?${params.toString()}`,
          method: "GET",
        };
      },
    }),
    createContact: builder.mutation<IContacts, Partial<IContacts>>({
      query: payload => ({
        url: `userContacts`,
        method: "POST",
        body: payload,
      }),
    }),
    getOneContact: builder.query<IContacts, { contactId: string }>({
      query: ({ contactId }) => ({
        url: `userContacts/${contactId}`,
        method: "GET",
      }),
    }),
    updateContact: builder.mutation<
      IContacts,
      {
        id: string;
        data: Omit<IContacts, "numOfLists" | "numOfPurchases">;
      }
    >({
      query: ({ id, data }) => ({
        url: `userContacts/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteUserContact: builder.mutation({
      query: contactId => ({
        url: `userContacts/${contactId}`,
        method: "DELETE",
      }),
    }),
    getAllContacts: builder.query<{ totalCount: number }, any>({
      query: () => ({
        url: `/broadcast-email/all-contacts-count`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useListContactsQuery,
  useCreateContactMutation,
  useDeleteUserContactMutation,
  useGetOneContactQuery,
  useUpdateContactMutation,
  useContactListsQuery,
  useContactPurchasesQuery,
  useGetAllContactsQuery,
} = createContactApi;
