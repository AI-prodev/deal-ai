"use client";

import * as Yup from "yup";
import dynamic from "next/dynamic";
import {
  ErrorMessage,
  Field,
  Form,
  Formik,
  FormikHelpers,
  FormikProps,
  yupToFormErrors,
} from "formik";
import { MouseEvent, useEffect, useMemo, useRef } from "react";
import { IBlogPost } from "@/interfaces/IBlogPost";
import {
  ArrowTopRightSVG,
  ArrowDownSVG,
  TrashSVG,
  SaveSVG,
  DotsSVG,
} from "../../icons/SVGData";
import { BlogPostHeroImage } from "./BlogPostHeroImage";
import Link from "next/link";
import { IBlogDetail } from "@/interfaces/IBlog";
import { useSession } from "next-auth/react";
import { useHamburger } from "@/hooks/useHambuger";
import clsx from "clsx";
import { useBlogPreviewURL } from "@/hooks/useBlogPreviewURL";
import { showErrorToast } from "@/utils/toast";
import { createBlogPostApi } from "@/store/features/blogPostApi";

const TextEditor = dynamic(() => import("@/components/TextEditor"), {
  ssr: false,
});

const editorToolBar = [
  "heading",
  "|",
  "bold",
  "italic",
  "strikethrough",
  "link",
  "underline",
  "|",
  "bulletedList",
  "numberedList",
  "subscript",
  "superscript",
  "|",
  "outdent",
  "alignment",
  "indent",
  "|",
  "fontSize",
  "fontFamily",
  "fontColor",
  "fontBackgroundColor",
  "|",
  "codeBlock",
  "code",
  "horizontalLine",
  "blockQuote",
  "|",
  "insertTable",
  "imageUpload",
  "mediaEmbed",
  "undo",
  "redo",
];

interface IProps {
  blog: IBlogDetail;
  post: IBlogPost;
  onSubmit: (data: FormData) => Promise<void>;
  onRemove: (evt: MouseEvent) => void;
}

interface FormValues {
  title: string;
  heroImage?: File | null;
  content: string;
  author: string;
}

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .min(5, "Must be greater than 5 characters")
    .max(128, "Must be less then 128 characters"),
  content: Yup.string()
    .required("Content is required")
    .min(128, "Must be greater than 128 characters")
    .max(500000, "Must be less then 500000 characters"),
  author: Yup.string().required("Author is required"),
});

export const BlogPostForm = ({ blog, post, onRemove, onSubmit }: IProps) => {
  const { data: session } = useSession();
  const initState = useMemo<FormValues>(
    () => ({
      title: post.title,
      content: post.content || "",
      author: session?.user.name || "",
    }),
    []
  );
  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [menuRef, showHamburger, showMenu, setShowMenu] = useHamburger();

  const handleSubmitForm = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    try {
      await validationSchema.validate(values);

      setSubmitting(true);

      const formData = new FormData();

      if (values.heroImage) {
        formData.append("file", values.heroImage);
      }

      formData.append("title", values.title);
      formData.append("content", values.content);
      formData.append("author", values.author);

      await onSubmit(formData);

      setSubmitting(false);
    } catch (error) {
      const yupErrors = yupToFormErrors<Record<string, string>>(error);
      Object.keys(yupErrors).forEach(k => showErrorToast(yupErrors[k] || ""));
    }
  };

  const previewURL = useBlogPreviewURL({
    blogId: blog._id,
    domain: blog.domain?.domain,
    subdomain: blog.subdomain,
    slug: post.slug,
  });

  useEffect(() => {
    formikRef.current?.resetForm({ values: initState });
  }, [initState, post.heroImage]);

  const { useCompleteBlogPostMutation } = createBlogPostApi;
  const [completeBlogPost, { isLoading }] = useCompleteBlogPostMutation();

  const handleCompleteWithAI = async (
    content: string,
    setFieldValue: (field: string, value: any) => void
  ) => {
    try {
      setFieldValue(
        "content",
        `${content}\n\n${
          (await completeBlogPost({ content }).unwrap()).choices[0].message
            .content
        }`
      );
    } catch (error) {
      console.error("Error completing post with AI:", error);
      showErrorToast(
        "Apologies, we weren't able to complete your post with AI."
      );
    }
  };

  return (
    <Formik
      initialValues={initState}
      // validationSchema={validationSchema}
      innerRef={formikRef}
      onSubmit={handleSubmitForm}
    >
      {({ isSubmitting, values, setFieldValue }) => (
        <Form className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#ebedf2] dark:border-[#191e3a] relative">
            <span />
            {!showHamburger || showMenu ? (
              <div
                className={clsx(
                  "flex",
                  !showHamburger && "items-center",
                  showHamburger &&
                    "flex-col items-stretch top-full right-0 z-50 absolute bg-white shadow-lg rounded-md"
                )}
                ref={menuRef}
              >
                <Link
                  href={`/blogs/${blog._id}/posts`}
                  className="flex items-center gap-2 border-b border-transparent p-4 hover:bg-white-light dark:hover:bg-[#1e2444]"
                >
                  <ArrowDownSVG className="size-4 rotate-90" />
                  <span className="whitespace-nowrap">Back to Posts</span>
                </Link>
                <Link
                  target="_blank"
                  href={previewURL}
                  className="flex items-center gap-2 border-b border-transparent p-4 hover:bg-white-light dark:hover:bg-[#1e2444] [&>svg]:size-5"
                >
                  <ArrowTopRightSVG />
                  <span className="whitespace-nowrap">View Published</span>
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 border-b border-transparent p-4 hover:bg-white-light dark:hover:bg-[#1e2444]"
                >
                  <SaveSVG size={20} />
                  <span className="whitespace-nowrap">Save and Publish</span>
                </button>
                <button
                  type="button"
                  onClick={onRemove}
                  className="flex items-center gap-2 border-b border-transparent p-4 hover:bg-white-light dark:hover:bg-[#1e2444] [&>svg]:size-5"
                >
                  <TrashSVG />
                  <span className="whitespace-nowrap">Delete</span>
                </button>
              </div>
            ) : null}

            {showHamburger ? (
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 border-b border-transparent p-4 hover:bg-white-light dark:hover:bg-[#1e2444] [&>svg]:size-5"
              >
                <DotsSVG className="size-5 rotate-90" />
              </button>
            ) : null}
          </div>
          <div className="mt-8 space-y-4">
            <div>
              <Field
                name="title"
                type="text"
                id="title"
                className="form-input text-3xl font-bold xl:text-4xl"
              />
              <ErrorMessage
                name="title"
                component="div"
                className="mt-1 text-danger"
              />
            </div>

            <BlogPostHeroImage
              imageFile={values.heroImage}
              imageSrc={post.heroImage}
              setFieldValue={setFieldValue}
            />

            <button
              type="button"
              onClick={() =>
                handleCompleteWithAI(values.content, setFieldValue)
              }
              className={`bg-primary text-white px-4 py-2 rounded ${
                isLoading || !values.content || values.content.length > 20000
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={
                isLoading || !values.content || values.content.length > 20000
              }
            >
              {isLoading
                ? "Loading..."
                : !values.content
                  ? "Write some text first"
                  : values.content.length > 20000
                    ? "Text too long to complete with AI"
                    : "Complete my post with AI (experimental)"}
            </button>

            <TextEditor
              name="content"
              toolbar={editorToolBar}
              allowedFileSize={20}
              acceptFileTypes="image/jpg, image/jpeg, image/png, image/gif"
            />

            <div className="flex items-center gap-4">
              <label htmlFor="author" className="m-0 text-lg">
                Author:
              </label>
              <div>
                <Field
                  name="author"
                  type="text"
                  id="author"
                  className="form-input"
                />
                <ErrorMessage
                  name="author"
                  component="div"
                  className="mt-1 text-danger"
                />
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
