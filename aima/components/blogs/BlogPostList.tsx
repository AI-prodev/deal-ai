import { IBlogDetail } from "@/interfaces/IBlog";
import { BlogPostCard } from "./components/BlogPostCard";
import { useToggle } from "@/hooks/useToggle";
import { NewBlogPostModal } from "./NewBlogPostModal";

interface IProps {
  blog: IBlogDetail;
}

export const BlogPostList = ({ blog }: IProps) => {
  const [isOpenNewModal, toggleNewModal] = useToggle();

  if (!blog.posts?.length) {
    return (
      <div className="py-20">
        <NewBlogPostModal
          isOpen={isOpenNewModal}
          onRequestClose={toggleNewModal}
          blogId={blog._id}
        />

        <p className="text-xl text-center mb-4">You have no blog posts yet.</p>

        <div className="mt-6 flex justify-center gap-4 max-w-[780px] mx-auto">
          <button
            onClick={toggleNewModal}
            className="rounded bg-primary px-4 py-2 text-white"
          >
            <span>+ Add Post</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-8 max-w-5xl mx-auto">
      {blog.posts?.map(post => (
        <BlogPostCard key={post._id} blog={blog} post={post} />
      ))}
    </div>
  );
};
