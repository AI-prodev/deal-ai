import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAdminApiClient } from "@/hooks/useAdminApiClient";
import Modal from "@/components/Modal";
import Select, { MenuProps, components } from "react-select";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { generatePassword } from "@/utils/passwordGenerator";
import { createProjectApi } from "@/store/features/projectApi";

interface NewProjectModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onProjectCreated: () => void;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
});
const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onRequestClose,
  onProjectCreated,
}) => {
  const projectApiClient = createProjectApi;
  const [createProject] = projectApiClient.useCreateProjectMutation();

  const stopPropagation = (event: any) => {
    event.stopPropagation();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div>
        <h2 className="mb-4 text-lg font-bold text-white">New Project</h2>
        <Formik
          initialValues={{
            title: "",
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            try {
              const data = await createProject(values).unwrap();

              onProjectCreated();
              if (data) {
                await showSuccessToast({
                  title: "Project created successfully",
                });
              }
              onRequestClose();
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
                  {isSubmitting ? "Creating..." : "Create Project"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default NewProjectModal;
