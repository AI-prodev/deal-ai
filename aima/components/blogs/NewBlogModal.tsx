import Modal from "@/components/Modal";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { ICreateBlog } from "@/interfaces/IBlog";
import { TitleInput } from "./components/TitleInput";
import { createBlogApi } from "@/store/features/blogApi";

interface NewBlogModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onBlogCreated: (blogId: string) => void;
}

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .min(5, "must greater than 5 characters")
    .max(64, "Must less then 64 characters"),
});

const initState: ICreateBlog = {
  title: "",
};

const NewBlogModal = ({
  isOpen,
  onRequestClose,
  onBlogCreated,
}: NewBlogModalProps) => {
  const [createBlog] = createBlogApi.useCreateBlogMutation();

  const handleSubmitForm = async (
    values: ICreateBlog,
    { setSubmitting }: FormikHelpers<ICreateBlog>
  ) => {
    try {
      const data = await createBlog(values).unwrap();

      onRequestClose();
      onBlogCreated(data._id);
      if (data) {
        showSuccessToast({ title: "Successfully created blog!" });
      }
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
      <h2 className="mb-4 text-lg font-bold text-white">Add Blog</h2>

      <Formik
        initialValues={initState}
        validationSchema={validationSchema}
        onSubmit={handleSubmitForm}
      >
        {({ isSubmitting, touched, errors }) => (
          <Form>
            <div className="space-y-4">
              <TitleInput touched={touched.title} error={errors.title} />
            </div>

            <div className="mt-4 flex justify-end">
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
                {isSubmitting ? "Creating..." : "Add Blog"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default NewBlogModal;
