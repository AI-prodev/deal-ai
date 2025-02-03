import { BlogPostForm } from "@/components/blogs/posts/BlogPostForm";
import { IRootState } from "@/store";
import { createBlogApi } from "@/store/features/blogApi";
import { createBlogPostApi } from "@/store/features/blogPostApi";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useDisclosure } from "@mantine/hooks";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function BlogPostEdit() {
  const router = useRouter();
  const blogId = router.query.blogId as string;
  const postId = router.query.postId as string;
  const {
    useGetBlogPostQuery,
    useDeletePostMutation,
    useUpdateBlogPostMutation,
  } = createBlogPostApi;

  const { useGetBlogQuery } = createBlogApi;
  const { data: blog, refetch } = useGetBlogQuery(
    { blogId },
    { skip: !blogId }
  );
  const [isDeleteModalOpen, deleteModalHandler] = useDisclosure(false);
  const { data: post, refetch: refetchPost } = useGetBlogPostQuery(
    { postId },
    { skip: !postId }
  );
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const [deletePost] = useDeletePostMutation();
  const [updateBlogPost] = useUpdateBlogPostMutation();

  const handleDeletePost = async () => {
    if (post) {
      await deletePost({ blogId, postId: post._id });
      await refetch();
      router.push(`/blogs/${blogId}/posts`);
    }
  };

  useEffect(() => {
    if (themeConfig.isDarkMode) {
      document.querySelector("body")?.classList.remove("dark");
    }

    return () => {
      if (themeConfig.isDarkMode) {
        document.querySelector("body")?.classList.add("dark");
      }
    };
  }, [themeConfig.isDarkMode]);

  if (!post || !blog) return null;

  const handleSubmit = async (data: FormData) => {
    try {
      const resp = await updateBlogPost({
        postId: post._id,
        formData: data,
      }).unwrap();

      if (resp) {
        showSuccessToast({ title: "Successfully published post!" });
      }
      refetchPost();
    } catch (error) {
      console.error(error);
      showErrorToast(
        //@ts-ignore
        error && error.data.error ? error.data.error : error
      );
    }
  };

  return (
    <div className="container mx-auto max-w-5xl">
      <Head>
        <title>Blogs</title>
      </Head>
      <BlogPostForm
        post={post}
        blog={blog}
        onSubmit={handleSubmit}
        onRemove={deleteModalHandler.open}
      />
      <ConfirmModal
        text={`Are you sure you want to delete your blog post "${post.title}"?`}
        isOpen={isDeleteModalOpen}
        close={deleteModalHandler.close}
        confirm={handleDeletePost}
      />
    </div>
  );
}
