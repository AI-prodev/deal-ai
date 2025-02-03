import { IBlog } from "@/interfaces/IBlog";
import Link from "next/link";
import { GlobeSVG } from "@/components/icons/SVGData";
import clsx from "clsx";

interface BlogListProps {
  blogs: IBlog[];
}

export default function BlogList({ blogs }: BlogListProps) {
  return (
    <div className="mb-5 mt-6 grid gap-4 grid-cols-1 max-w-[780px] mx-auto">
      {blogs.map(blog => (
        <div
          className="w-full rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none"
          key={blog._id}
        >
          <Link href={`/blogs/${blog._id}/posts`}>
            <div className="flex items-center py-4 px-6">
              <div className="flex-shrink-0">
                {blog.logoImage ? (
                  <img
                    className="h-6 w-6 rounded"
                    src={blog.logoImage}
                    alt=""
                  />
                ) : (
                  <GlobeSVG />
                )}
              </div>

              <h5
                className={clsx(
                  "mx-3 font-semibold text-[#3b3f5c] dark:text-white-light truncate",
                  "text-sm sm:text-base md:text-lg lg:text-xl"
                )}
              >
                {blog.title}
              </h5>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
