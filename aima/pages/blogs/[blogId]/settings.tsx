import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";
import { BlogWrapper } from "@/components/blogs/BlogWrapper";
import { useRouter } from "next/router";
import { createBlogApi } from "@/store/features/blogApi";
import { BlogSettings } from "@/components/blogs/BlogSettings";
import Head from "next/head";

const SettingsPage = () => {
  const router = useRouter();
  const blogId = router.query.blogId as string;
  const { useGetBlogQuery } = createBlogApi;
  const { data: blog } = useGetBlogQuery({ blogId });

  if (!blog) return null;

  return (
    <BlogWrapper blog={blog} tab="settings">
      <Head>
        <title>Blogs</title>
      </Head>
      <BlogSettings blog={blog} />
    </BlogWrapper>
  );
};

export default withAuth(SettingsPage, USER_ROLES);
