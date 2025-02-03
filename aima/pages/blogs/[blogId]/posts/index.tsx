import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";
import { BlogWrapper } from "@/components/blogs/BlogWrapper";
import { useRouter } from "next/router";
import { createBlogApi } from "@/store/features/blogApi";
import { BlogPostList } from "@/components/blogs/BlogPostList";
import Head from "next/head";

const BlogPosts = () => {
  const router = useRouter();
  const blogId = router.query.blogId as string;
  const { useGetBlogQuery } = createBlogApi;
  const { data: blog } = useGetBlogQuery({ blogId });

  if (!blog) return null;

  return (
    <BlogWrapper blog={blog} tab="posts">
      <Head>
        <title>Blogs</title>
      </Head>
      <BlogPostList blog={blog} />
    </BlogWrapper>
  );
};

export default withAuth(BlogPosts, USER_ROLES);
