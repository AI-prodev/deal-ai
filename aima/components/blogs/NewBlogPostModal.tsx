import * as Yup from "yup";
import Modal from "@/components/Modal";
import { createBlogPostApi } from "@/store/features/blogPostApi";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { TitleInput } from "./components/TitleInput";
import { ImageInput } from "./components/ImageInput";
import { useSession } from "next-auth/react";
import { createBlogApi } from "@/store/features/blogApi";
import { useRouter } from "next/navigation";

interface IProps {
  blogId: string;
  isOpen: boolean;
  onRequestClose: () => void;
}

interface FormValues {
  title: string;
  author: string;
  heroImage?: File | null;
}

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .min(5, "must greater than 5 characters")
    .max(128, "Must less then 64 characters"),
  author: Yup.string().required("Author is required"),
  heroImage: Yup.mixed().required("Image is required"),
});

export const NewBlogPostModal = ({
  blogId,
  isOpen,
  onRequestClose,
}: IProps) => {
  const { data: session } = useSession();
  const initState: FormValues = {
    title: "",
    author: session?.user.name || "",
  };
  const router = useRouter();
  const { useCreateBlogPostMutation, useGetBlogPostsQuery } = createBlogPostApi;
  const [createBlogPost] = useCreateBlogPostMutation();
  const { useGetBlogQuery } = createBlogApi;
  const { refetch } = useGetBlogQuery({ blogId });

  const handleSubmitForm = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    try {
      const formData = new FormData();

      formData.append("title", values.title);
      formData.append("author", values.author);

      if (values.heroImage) {
        formData.append("file", values.heroImage);
      }

      const data = await createBlogPost({
        blogId,
        payload: formData,
      }).unwrap();

      await refetch();

      if (data) {
        showSuccessToast({ title: "Successfully created post!" });
      }
      onRequestClose();
      router.push(`/blogs/${blogId}/posts/${data._id}`);
    } catch (error) {
      console.error(error);
      showErrorToast(
        //@ts-ignore
        error && error.data.error ? error.data.error : error
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2 className="mb-4 text-lg font-bold text-white">Add Post</h2>

      <Formik
        initialValues={initState}
        validationSchema={validationSchema}
        onSubmit={handleSubmitForm}
      >
        {({ isSubmitting, values, touched, errors, setFieldValue }) => (
          <Form>
            <div className="space-y-4">
              <TitleInput touched={touched.title} error={errors.title} />

              <div className={errors.author ? "has-error" : ""}>
                <label htmlFor="title" className="text-white">
                  Author
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

              <ImageInput
                fieldName="heroImage"
                fieldLabel="Hero Image"
                imageFile={values.heroImage}
                setFieldValue={setFieldValue}
                error={errors.heroImage}
                maxSize={20}
                accept="image/jpg, image/jpeg, image/png, image/gif"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onRequestClose}
                  className="mr-2 rounded border border-primary px-4 py-2 text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded bg-primary px-4 py-2 text-white"
                >
                  {isSubmitting ? "Creating..." : "Add Post"}
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
