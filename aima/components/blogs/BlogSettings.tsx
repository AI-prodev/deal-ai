import * as Yup from "yup";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { IBlogDetail } from "@/interfaces/IBlog";
import { BlogDomains } from "./components/BlogDomains";
import { BlogLogoIcon } from "./components/BlogLogoIcon";
import { TitleInput } from "./components/TitleInput";
import { useMemo, useState } from "react";
import { createBlogApi } from "@/store/features/blogApi";
import { showSuccessToast } from "@/utils/toast";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { TrashSVG } from "../icons/SVGData";
import { BlogSubdomain } from "./components/BlogSubdomain";
import { ConfirmModal } from "../ConfirmModal";

interface IProps {
  blog: IBlogDetail;
}

interface FormValues {
  title: string;
  subdomain?: string;
}

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .min(5, "must greater than 5 characters")
    .max(64, "Must less then 64 characters"),
  subdomain: Yup.string()
    .max(64, "Must less then 64 characters")
    .matches(/^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)$/, {
      excludeEmptyString: true,
      message: "Invalid subdomain",
    }),
});

export const BlogSettings = ({ blog }: IProps) => {
  const router = useRouter();
  const {
    useGetBlogQuery,
    useGetMyBlogsQuery,
    useUpdateBlogMutation,
    useDeleteBlogMutation,
  } = createBlogApi;
  const [updateBlog] = useUpdateBlogMutation();
  const [deleteBlog] = useDeleteBlogMutation();
  const { refetch: refetchBlog } = useGetBlogQuery({
    blogId: blog._id,
  });
  const { refetch: refetchBlogs } = useGetMyBlogsQuery({});

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, deleteModalHandler] = useDisclosure(false);

  const submitForm = async (values: FormValues) => {
    try {
      setIsLoading(true);

      const data = await updateBlog({
        _id: blog._id,
        title: values.title,
        subdomain: values.subdomain,
      }).unwrap();

      if (data) {
        refetchBlog();
        showSuccessToast({ title: "Blog Updated" });
      }
    } catch (error) {
      console.error("Failed to save domain", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBlog = async () => {
    await deleteBlog({ blogId: blog._id });
    refetchBlogs();
    router.replace("/blogs");
  };

  const initialValues = useMemo(
    () => ({
      title: blog.title || "",
      subdomain: blog.subdomain || "",
    }),
    [blog.title, blog.subdomain]
  );

  const domain = useMemo(() => {
    return (process.env.NEXT_PUBLIC_BLOG_URL || "")
      .replace("http:", "")
      .replace("www.", "")
      .replace("https:", "")
      .replace(/\//g, "");
  }, []);

  return (
    <div className="max-w-lg">
      <div className="mt-3 pt-2">
        <h2 className="mt-2 text-2xl font-bold">Settings</h2>
      </div>
      <div className="mt-6 w-full ">
        <h2 className="text-xl font-bold">Domains</h2>
      </div>
      <div className="mt-4 w-full max-w-lg">
        <BlogDomains blog={blog} />
      </div>

      <div className="mt-8 w-full max-w-lg">
        <h2 className="text-xl font-bold">Logo</h2>
      </div>
      <BlogLogoIcon blog={blog} />

      <div className="mt-8 w-full max-w-lg">
        <h2 className="text-xl font-bold">Other</h2>
        <div className="mt-4">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={submitForm}
          >
            {({ touched, errors }) => (
              <Form className="space-y-5 text-white">
                <TitleInput touched={touched.title} error={errors.title} />

                <BlogSubdomain
                  touched={touched.subdomain}
                  error={errors.subdomain}
                  domain={domain}
                />

                <button
                  disabled={isLoading}
                  type="submit"
                  className="btn btn-primary !my-6 "
                >
                  Save
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      <hr className="border border-[#ebedf2] font-semibold dark:border-[#191e3a]" />

      <div className="flex justify-end mt-4">
        <button
          type="button"
          className="btn btn-danger"
          onClick={deleteModalHandler.open}
        >
          <TrashSVG className="size-5" />
          <span className="ml-1">Delete Blog</span>
        </button>
      </div>

      <ConfirmModal
        text={`Are you sure you want to delete your blog: "${blog.title}"? This cannot be undone.`}
        isOpen={isDeleteModalOpen}
        close={deleteModalHandler.close}
        confirm={handleDeleteBlog}
      />
    </div>
  );
};
