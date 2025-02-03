import { baseUrl } from "@/utils/baseUrl";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

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
export const createFavoritesAPI = createApi({
  reducerPath: "favoritesApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    getFavorites: builder.query<any, string | void>({
      query: type => ({
        url: type ? `/user/favorites?type=${type}` : "/user/favorites",
        method: "GET",
      }),
    }),
    addFavorite: builder.mutation<
      any,
      {
        data: any;
      }
    >({
      query: ({ data }) => ({
        url: "/user/favorites",
        method: "POST",
        body: data,
      }),
    }),
    removeFavorite: builder.mutation<
      any,
      {
        favoriteId: string;
      }
    >({
      query: ({ favoriteId }) => ({
        url: `/user/favorites/${favoriteId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useAddFavoriteMutation,
  useGetFavoritesQuery,
  useRemoveFavoriteMutation,
} = createFavoritesAPI;
