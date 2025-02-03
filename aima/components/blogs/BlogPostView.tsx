import { IBlogPost } from "@/interfaces/IBlogPost";

interface IProps {
  post: IBlogPost;
}

export const BlogPostView = ({ post }: IProps) => {
  return (
    <div className="max-w-5xl">
      <h2 className="font-semibold dark:text-white-light text-3xl">
        {post.title}
      </h2>

      {post.heroImage ? (
        <img
          className="mt-6 max-h-96 w-full mx-auto rounded-md object-cover"
          src={post.heroImage}
          alt={post.title}
        />
      ) : null}

      <div
        className="mt-6 prose prose-lg max-w-none prose-invert"
        dangerouslySetInnerHTML={{
          __html: post.content || "No content",
        }}
      />
    </div>
  );
};
