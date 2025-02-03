import * as Yup from "yup";
import { useMemo, useState } from "react";
import { IBlogDetail } from "@/interfaces/IBlog";
import { createBlogApi } from "@/store/features/blogApi";
import { createDomainApi } from "@/store/features/domainApi";
import { Form, Formik, FormikProps } from "formik";
import { ComponentFieldWithLabel } from "../../marketingHooks/FieldWithLabel";
import FormikDropDown from "./FormikDropDown";
import Link from "next/link";
import { showSuccessToast } from "@/utils/toast";
import "tippy.js/dist/tippy.css";

interface IProps {
  blog: IBlogDetail;
}

interface FormValues {
  domain: string | undefined;
}

const FormValidation = Yup.object().shape({
  domainId: Yup.string(),
});

export const BlogDomains = ({ blog }: IProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { useGetBlogQuery, useGetMyBlogsQuery, useUpdateBlogMutation } =
    createBlogApi;

  const { refetch: refetchBlog } = useGetBlogQuery({
    blogId: blog._id,
  });

  const [updateBlog] = useUpdateBlogMutation();

  const { data: domains } = createDomainApi.useGetMyDomainsQuery({});
  const { data: blogs, refetch: refetchBlogs } = useGetMyBlogsQuery({});

  let formikRef: { current: FormikProps<FormValues> | null } = {
    current: null,
  };

  const scrollToFirstError = (errors: any) => {
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
      const errorElement = document.querySelector(`[name=${firstErrorKey}]`);
      if (errorElement) {
        const topOffset = 100;
        const elementPosition = errorElement.getBoundingClientRect().top;
        window.scrollBy({
          top: elementPosition - topOffset,
          behavior: "smooth",
        });
      }
    }
  };

  const submitForm = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const data = await updateBlog({
        _id: blog._id,
        title: blog.title,
        domain: values.domain || null,
      }).unwrap();

      if (data) {
        refetchBlog();
        refetchBlogs();
        setIsLoading(false);
        showSuccessToast({ title: "Domains Updated" });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save domain", error);
    }
  };

  const usedDomainIds = useMemo(() => {
    if (!blogs) return [];
    return blogs
      .filter(item => item._id !== blog._id)
      .map(item => item.domain)
      .filter((id): id is string => !!id);
  }, [blogs]);

  const suggestions = useMemo(() => {
    if (domains) {
      return [
        {
          display: "wordhotel.com (default)",
          value: undefined,
        },
        ...domains
          .map(domain => ({
            display: domain.domain,
            value: domain._id,
          }))
          .filter(item => !usedDomainIds.includes(item.value)),
      ];
    }
    return [
      {
        display: "wordhotel.com (default)",
        value: undefined,
      },
    ];
  }, [domains, usedDomainIds]);

  return (
    <Formik
      initialValues={{
        domain: blog.domain?._id,
      }}
      innerRef={formikInstance => {
        if (formikInstance?.errors && formikInstance.isSubmitting) {
          scrollToFirstError(formikInstance.errors);
        }
        formikRef.current = formikInstance;
      }}
      validationSchema={FormValidation}
      onSubmit={submitForm}
    >
      {() => (
        <Form className="text-white">
          <ComponentFieldWithLabel
            label={`What domains would you like to host your blog on?`}
            tooltipContent={`Domain: Add a domain on your domains page and then select it here`}
            component={FormikDropDown}
            name="domain"
            id="domain"
            suggestions={suggestions}
          />
          <div className="flex justify-end mt-0">
            <Link href="/domains" className="underline text-blue-500">
              Manage Domains
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary mb-6"
          >
            Save
          </button>
        </Form>
      )}
    </Formik>
  );
};
