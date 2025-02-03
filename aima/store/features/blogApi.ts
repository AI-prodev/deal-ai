import {
  IBlog,
  ICreateBlog,
  IUpdateBlog,
  IUpdateBlogLog,
  IBlogDetail,
} from "@/interfaces/IBlog";
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

interface GetBlogParams {
  domain: string;
  output_model?: "basic" | "full";
}
export const createBlogApi = createApi({
  reducerPath: "blogsApi",
  baseQuery: customBaseQuery,
  endpoints: ({ mutation, query }) => ({
    createBlog: mutation<IBlog, ICreateBlog>({
      query: payload => ({
        url: `/blogs`,
        method: "POST",
        body: payload,
      }),
    }),
    deleteBlog: mutation<any, { blogId: string }>({
      query: ({ blogId }) => ({
        url: `/blogs/${blogId}`,
        method: "DELETE",
      }),
    }),
    updateBlog: mutation<any, IUpdateBlog>({
      query: ({ _id, ...rest }) => ({
        url: `/blogs/${_id}`,
        method: "PATCH",
        body: rest,
      }),
    }),
    updateBlogLogo: mutation<any, IUpdateBlogLog>({
      query: ({ blogId, formData }) => ({
        url: `/blogs/${blogId}/logo`,
        method: "PATCH",
        body: formData,
      }),
    }),
    deleteBlogLogo: mutation<any, { blogId: string }>({
      query: ({ blogId }) => ({
        url: `/blogs/${blogId}/logo`,
        method: "DELETE",
      }),
    }),
    getMyBlogs: query<IBlog[], {}>({
      query: ({}) => ({
        url: `/blogs/me`,
        method: "GET",
      }),
    }),
    getBlog: query<IBlogDetail, { blogId: string }>({
      query: ({ blogId }) => ({
        url: `/blogs/${blogId}`,
        method: "GET",
      }),
    }),
  }),
});
