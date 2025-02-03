import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Modal from "@/components/Modal";
import "tippy.js/dist/tippy.css";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { IProject } from "@/interfaces/IProject";
import { IFunnel } from "@/interfaces/IFunnel";
import { createPageApi } from "@/store/features/pageApi";
import { IPage } from "@/interfaces/IPage";

interface PageSettingsModalProps {
  page: IPage;
  isOpen: boolean;
  onRequestClose: ({ isDeleted }: { isDeleted?: boolean }) => void;
  onPageSettingsUpdated: () => void;
}

const validationSchema = Yup.object().shape({
  pageId: Yup.string().required("Page ID is required"),
  title: Yup.string().required("Title is required"),
  path: Yup.string(),
});

const PageSettingsModal: React.FC<PageSettingsModalProps> = ({
  page,
  isOpen,
  onRequestClose,
  onPageSettingsUpdated,
}) => {
  const [updatePageSettings] = createPageApi.useUpdatePageSettingsMutation();
  // const [deletePage] = createPageApi.useDeletePageMutation();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this page?")) {
      return;
    }
    // await deletePage({ pageId: page._id });
    onPageSettingsUpdated();
    onRequestClose({ isDeleted: true });
  };

  const stopPropagation = (event: any) => {
    event.stopPropagation();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={() => onRequestClose({})}>
      <div>
        <h2 className="mb-4 text-lg font-bold text-white">Page Settings</h2>
        <Formik
          initialValues={{
            title: page.title,
            pageId: page._id,
            path: page.path,
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            try {
              const data = await updatePageSettings(values).unwrap();

              onPageSettingsUpdated();
              if (data) {
                await showSuccessToast({ title: data.message });
              }
              onRequestClose({});
            } catch (error) {
              console.error(error);
              // prettier-ignore
              //@ts-ignore
              showErrorToast(
                              // prettier-ignore
                                //@ts-ignore
                                error && error.data.error? error.data.error: error
                            );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form>
              <div className="space-y-4">
                <div
                  className={touched.title && errors.title ? "has-error" : ""}
                >
                  <label htmlFor="title" className="text-white">
                    Title
                  </label>
                  <Field
                    name="title"
                    type="text"
                    id="title"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="title"
                    component="div"
                    className="mt-1 text-danger"
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className={touched.path && errors.path ? "has-error" : ""}>
                  <label htmlFor="title" className="text-white">
                    Path
                  </label>
                  <Field
                    name="path"
                    type="text"
                    id="path"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="path"
                    component="div"
                    className="mt-1 text-danger"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="flex justify-start items-center">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded border border-danger px-4 py-2 text-danger"
                  >
                    Delete Page
                  </button>
                </div>
                <div className="flex justify-end items-center">
                  <button
                    type="button"
                    onClick={() => onRequestClose({})}
                    className="mr-2 rounded border border-primary px-4 py-2 text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded bg-primary px-4 py-2 text-white"
                  >
                    {isSubmitting ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default PageSettingsModal;
