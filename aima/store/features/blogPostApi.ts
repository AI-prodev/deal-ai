import {
  IBlog,
  ICreateBlog,
  IUpdateBlog,
  IUpdateBlogLog,
} from "@/interfaces/IBlog";
import {
  IBlogPost,
  ICreateBlogPost,
  IUpdateBlogPost,
} from "@/interfaces/IBlogPost";
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

interface CreateBlogPost {
  blogId: string;
  payload: FormData;
}

interface CompleteBlogPostPayload {
  content: string;
}

export const createBlogPostApi = createApi({
  reducerPath: "blogPostApi",
  baseQuery: customBaseQuery,
  endpoints: ({ mutation, query }) => ({
    createBlogPost: mutation<IBlogPost, CreateBlogPost>({
      query: ({ blogId, payload }) => ({
        url: `/blog-posts/${blogId}`,
        method: "POST",
        body: payload,
      }),
    }),
    getBlogPosts: query<IBlogPost[], { blogId: string }>({
      query: ({ blogId }) => ({
        url: `/blog-posts/blog/${blogId}`,
        method: "GET",
      }),
    }),
    getBlogPost: query<IBlogPost, { postId: string }>({
      query: ({ postId }) => ({
        url: `/blog-posts/${postId}`,
        method: "GET",
      }),
    }),
    updateBlogPost: mutation<any, IUpdateBlogPost>({
      query: ({ postId, formData }) => ({
        url: `/blog-posts/${postId}`,
        method: "PATCH",
        body: formData,
      }),
    }),
    deletePost: mutation<any, { blogId: string; postId: string }>({
      query: ({ blogId, postId }) => ({
        url: `/blog-posts/${postId}`,
        method: "DELETE",
        body: { blogId },
      }),
    }),
    completeBlogPost: mutation<any, CompleteBlogPostPayload>({
      query: ({ content }) => ({
        url: `/blogs/completeBlogPost`,
        method: "POST",
        body: { content },
      }),
    }),
  }),
});
