import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Modal from "@/components/Modal";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { createFileAPI } from "@/store/features/fileApi";
import ModalLight from "@/components/ModalLight";

interface Props {
  itemId: string;
  type: "file" | "folder";
  currentName: string;
  isOpen: boolean;
  onRequestClose: () => void;
  onNameChanged: (newName: string) => void;
}

const validationSchema = Yup.object().shape({
  newName: Yup.string().required("A name is required"),
});

const NewNameModal: React.FC<Props> = ({
  currentName,
  type,
  itemId,
  isOpen,
  onRequestClose,
  onNameChanged,
}) => {
  const IS_LIGHT_MODE = true;
  const [renameFile] = createFileAPI.useRenameFileMutation();
  const [renameFolder] = createFileAPI.useRenameFolderMutation();

  const modalContent = (
    <div>
      <h2
        className={`mb-4 text-lg font-bold ${!IS_LIGHT_MODE && "text-white"}`}
      >
        Rename
      </h2>
      <Formik
        initialValues={{
          newName: currentName,
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting, setErrors }) => {
          try {
            const newName = values.newName;

            if (type === "file") {
              renameFile({ fileId: itemId, newName });
            } else if (type === "folder") {
              renameFolder({ folderId: itemId, newName });
            }

            onNameChanged(newName);
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
                className={touched.newName && errors.newName ? "has-error" : ""}
              >
                <Field
                  name="newName"
                  type="text"
                  id="newName"
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
                  name="newName"
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
                {isSubmitting ? "..." : "Save"}
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

export default NewNameModal;
