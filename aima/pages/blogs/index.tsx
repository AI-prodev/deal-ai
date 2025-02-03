import withAuth from "@/helpers/withAuth";
import { createBlogApi } from "@/store/features/blogApi";
import { USER_ROLES } from "@/utils/roles";
import { GlobeSVG } from "@/components/apollo/Svg/SvgData";
import NewBlogModal from "@/components/blogs/NewBlogModal";
import { useToggle } from "@/hooks/useToggle";
import BlogList from "@/components/blogs/BlogList";
import { useRouter } from "next/navigation";
import Head from "next/head";

const Blogs = () => {
  const router = useRouter();
  const [isOpenNewModal, toggleNewBlogModal] = useToggle();
  const { useGetMyBlogsQuery } = createBlogApi;
  const { data: blogs, refetch: refetchBlogs } = useGetMyBlogsQuery({});

  const handleBlogCreated = (blogId: string) => {
    refetchBlogs();
    router.push(`/blogs/${blogId}/posts`);
  };

  return (
    <div className="p-3">
      <Head>
        <title>Blogs</title>
      </Head>

      <div className="mt-3 mb-6 flex items-center">
        <GlobeSVG />
        <h2 className="ml-3 text-2xl font-bold">Blogs</h2>
      </div>

      <NewBlogModal
        isOpen={isOpenNewModal}
        onRequestClose={toggleNewBlogModal}
        onBlogCreated={handleBlogCreated}
      />
      <hr className="overflow-y-auto whitespace-nowrap border-t border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex" />

      <p className="max-w-[780px] text-center mx-auto pt-8 text-base md:text-xl">
        Welcome! To create a blog, press the “Add Blog” button.
        <br />
        To add posts or make edits to an existing blog, select that blog below.
      </p>

      {blogs && blogs.length > 0 ? (
        <BlogList blogs={blogs} />
      ) : (
        <div className="sr-only">There are no blogs to display.</div>
      )}

      <div className="mt-6 flex justify-center gap-4 max-w-[780px] mx-auto">
        <button
          onClick={toggleNewBlogModal}
          className="rounded bg-primary px-4 py-2 text-white"
        >
          <span>+ Add Blog</span>
        </button>
      </div>
    </div>
  );
};

export default withAuth(Blogs, USER_ROLES);
