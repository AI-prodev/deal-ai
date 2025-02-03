import Link from "next/link";
import { PropsWithChildren } from "react";
import {
  ArrowTopRightSVG,
  DotsSVG,
  GearSmallSVG,
  GlobeSVG,
  ThreeBarsSVG,
} from "../icons/SVGData";
import clsx from "clsx";
import { IBlogDetail } from "@/interfaces/IBlog";
import { NewBlogPostModal } from "./NewBlogPostModal";
import { useToggle } from "@/hooks/useToggle";
import { useHamburger } from "@/hooks/useHambuger";
import { useBlogPreviewURL } from "@/hooks/useBlogPreviewURL";

export type BlogEditTabs = "posts" | "settings";
interface IProps {
  blog: IBlogDetail;
  tab: BlogEditTabs;
}

export const BlogWrapper = ({
  blog,
  children,
  tab = "posts",
}: PropsWithChildren<IProps>) => {
  const [menuRef, showHamburger, showMenu, setShowMenu] = useHamburger();
  const [isOpenNewModal, toggleNewModal] = useToggle();

  const previewURL = useBlogPreviewURL({
    blogId: blog._id,
    domain: blog.domain?.domain,
    subdomain: blog.subdomain,
  });

  const handleToggleNewModal = () => {
    toggleNewModal();
    setShowMenu(!showMenu);
  };

  return (
    <div className="blog-editor-container">
      <ul className="flex space-x-2 rtl:space-x-reverse overflow-hidden">
        <li>
          <Link href="/blogs" className="text-primary hover:underline">
            Blogs
          </Link>
        </li>
        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 truncate">
          <span>{blog.title}</span>
        </li>
      </ul>
      <div className="pt-5">
        <div className="flex items-center justify-between relative">
          <div className="flex items-center overflow-hidden">
            {blog.logoImage ? (
              <img
                className="h-6 w-6 rounded"
                src={blog.logoImage}
                alt={blog.title}
              />
            ) : (
              <GlobeSVG />
            )}
            <h5 className="ml-3 text-base md:text-lg font-semibold truncate dark:text-white-light">
              {blog.title}
            </h5>
          </div>
          {!showHamburger || showMenu ? (
            <div
              className={clsx(
                "whitespace-nowrap font-semibold dark:border-[#191e3a] flex",
                showHamburger &&
                  "flex-col absolute top-full right-0 z-50 bg-[#f1f2f3] p-5 dark:bg-[#060818] rounded-md mt-1"
              )}
              ref={menuRef}
            >
              <button
                className="flex gap-2 border-b p-4 border-transparent hover:border-primary hover:text-primary"
                onClick={handleToggleNewModal}
              >
                + New Post
              </button>
              <Link
                href={`/blogs/${blog._id}/posts`}
                className={clsx(
                  "flex gap-2 border-b p-4",
                  tab === "posts"
                    ? "border-primary text-primary"
                    : "border-transparent hover:border-primary hover:text-primary"
                )}
              >
                <ThreeBarsSVG width={20} height={20} />
                <span>All Posts</span>
              </Link>
              <Link
                target="_blank"
                href={previewURL}
                className="flex gap-2 border-b p-4 items-center border-transparent hover:border-primary hover:text-primary"
              >
                <ArrowTopRightSVG className="size-5" />
                View Blog
              </Link>
              <Link
                href={`/blogs/${blog._id}/settings`}
                className={clsx(
                  "flex gap-2 border-b p-4",
                  tab === "settings"
                    ? "border-primary text-primary"
                    : "border-transparent hover:border-primary hover:text-primary"
                )}
              >
                <GearSmallSVG />
                <span>Settings</span>
              </Link>
            </div>
          ) : null}
          {showHamburger ? (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex gap-2 border-b p-4 border-transparent"
            >
              <DotsSVG className="size-5 rotate-90" />
            </button>
          ) : null}
        </div>

        <hr className="overflow-y-auto whitespace-nowrap border-t border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex" />

        {children}
      </div>

      <NewBlogPostModal
        isOpen={isOpenNewModal}
        onRequestClose={toggleNewModal}
        blogId={blog._id}
      />
    </div>
  );
};
