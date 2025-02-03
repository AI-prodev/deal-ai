import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Modal from "@/components/Modal";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { createFileAPI } from "@/store/features/fileApi";
import ModalLight from "@/components/ModalLight";

interface NewFolderModalProps {
  parentFolderId: string;
  isOpen: boolean;
  onRequestClose: () => void;
  onFolderCreated: () => void;
}

const validationSchema = Yup.object().shape({
  displayName: Yup.string().required("Folder name is required"),
});

const NewFolderModal: React.FC<NewFolderModalProps> = ({
  parentFolderId,
  isOpen,
  onRequestClose,
  onFolderCreated,
}) => {
  const IS_LIGHT_MODE = true;
  const [createFolder] = createFileAPI.useCreateFolderMutation();

  const modalContent = (
    <div>
      <h2
        className={`mb-4 text-lg font-bold ${!IS_LIGHT_MODE && "text-white"}`}
      >
        New Folder
      </h2>
      <Formik
        initialValues={{
          displayName: "Untitled Folder",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            const displayName = values.displayName;
            const data = await createFolder({
              displayName,
              parentFolderId,
            }).unwrap();

            onFolderCreated();
            if (data) {
              await showSuccessToast({ title: "Folder created" });
            }
            onRequestClose();
          } catch (error) {
            console.error(error);
            //@ts-ignore
            showErrorToast(
              //@ts-ignore
              error && error.data.error ? error.data.error : error
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
                className={
                  touched.displayName && errors.displayName ? "has-error" : ""
                }
              >
                <label
                  htmlFor="displayName"
                  className={`${!IS_LIGHT_MODE && "text-white"}`}
                >
                  Folder Name
                </label>
                <Field
                  name="displayName"
                  type="text"
                  id="displayName"
                  className="form-input"
                  style={
                    IS_LIGHT_MODE
                      ? {
                          backgroundColor: "white",
                          color: "#333333",
                        }
                      : {}
                  }
                />
                <ErrorMessage
                  name="displayName"
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
                className={`rounded bg-primary px-4 py-2 text-white`}
              >
                {isSubmitting ? "Creating..." : "Create Folder"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );

  return (
    <>
      {IS_LIGHT_MODE ? (
        <ModalLight isOpen={isOpen} onRequestClose={onRequestClose}>
          {modalContent}
        </ModalLight>
      ) : (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
          {modalContent}
        </Modal>
      )}
    </>
  );
};

export default NewFolderModal;
