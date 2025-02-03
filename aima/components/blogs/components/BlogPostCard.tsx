import { IBlogPost } from "@/interfaces/IBlogPost";
import Link from "next/link";
import {
  ArrowTopRightSVG,
  PencilSquareSVG,
  TrashSVG,
} from "../../icons/SVGData";
import clsx from "clsx";
import { IBlogDetail } from "@/interfaces/IBlog";
import { createBlogPostApi } from "@/store/features/blogPostApi";
import { createBlogApi } from "@/store/features/blogApi";
import { useBlogPreviewURL } from "@/hooks/useBlogPreviewURL";
import { useDisclosure } from "@mantine/hooks";
import { ConfirmModal } from "@/components/ConfirmModal";

interface IProps {
  blog: IBlogDetail;
  post: IBlogPost;
}

export const BlogPostCard = ({ blog, post }: IProps) => {
  const { useDeletePostMutation } = createBlogPostApi;
  const { useGetBlogQuery } = createBlogApi;
  const [deletePost] = useDeletePostMutation();
  const { refetch } = useGetBlogQuery({ blogId: blog._id });
  const [isDeleteModalOpen, deleteModalHandler] = useDisclosure(false);

  const previewURL = useBlogPreviewURL({
    blogId: blog._id,
    domain: blog.domain?.domain,
    subdomain: blog.subdomain,
    slug: post.slug,
  });

  const handleDeletePost = async () => {
    await deletePost({ blogId: blog._id, postId: post._id });
    refetch();
  };

  return (
    <div
      className={clsx(
        "bg-white-light/40 dark:bg-dark/40",
        "rounded-md p-2 shadow-sm relative",
        "cursor-pointer border mb-2",
        "border-transparent hover:border-primary"
      )}
    >
      <div className="aspect-w-2 aspect-h-1 relative block overflow-hidden bg-secondary-200 shadow-md rounded">
        <img
          className="h-full w-full object-cover"
          src={post.heroImage}
          alt={post.title}
        />
      </div>
      <div className="overflow-hidden mt-2">
        <h5 className="text-xl font-semibold overflow-hidden whitespace-nowrap overflow-ellipsis">
          {post.title}
        </h5>
      </div>
      <div className="grid grid-cols-3 items-center mt-2 gap-2 text-white">
        <Link
          target="_blank"
          href={previewURL}
          className="flex gap-2 items-center justify-center px-3 py-2 rounded bg-primary"
        >
          <ArrowTopRightSVG className="size-5" />
          <span>View</span>
        </Link>
        <Link
          href={`/blogs/${blog._id}/posts/${post._id}`}
          className="flex gap-2 items-center justify-center px-3 py-2 rounded bg-primary"
        >
          <PencilSquareSVG className="size-5" />
          <span>Edit</span>
        </Link>
        <button
          className="flex gap-2 items-center justify-center px-3 py-2 rounded bg-primary"
          onClick={deleteModalHandler.open}
        >
          <TrashSVG className="size-5" />
          <span>Delete</span>
        </button>
      </div>

      <ConfirmModal
        text={`Are you sure you want to delete your blog post "${post.title}"?`}
        isOpen={isDeleteModalOpen}
        close={deleteModalHandler.close}
        confirm={handleDeletePost}
      />
    </div>
  );
};
