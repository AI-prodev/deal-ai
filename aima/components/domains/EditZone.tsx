import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Modal from "@/components/Modal";
import { showSuccessToast } from "@/utils/toast";
import { createDomainApi } from "@/store/features/domainApi";
import { useSession } from "next-auth/react";
interface EditZoneProps {
  isOpen: boolean;
  setEdit: any;
  info: any;
  setRefresh: any;
}

const EditZone: React.FC<EditZoneProps> = ({
  isOpen,
  setEdit,
  info,
  setRefresh,
}) => {
  const [error, setError] = useState(null);
  const [EditZone] = createDomainApi.useEditZoneMutation();
  const { data: session } = useSession();

  const handleModalClose = () => {
    setEdit(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {
        handleModalClose();
      }}
      customClassName="w-1/2"
    >
      <h2 className="mb-4 text-lg font-bold text-white">Edit Zone Record</h2>
      <Formik
        initialValues={{
          name: info.name,
          content: info.content,
        }}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const { zone_id, id } = info;
            const { name, content } = values;
            const token = session?.token || "";
            const response = await EditZone({
              zone_id,
              id,
              name,
              content,
              token,
            });

            if ("data" in response) {
              setRefresh((prev: any) => prev + 1);
              showSuccessToast({ title: "updated" });
              setEdit(false);
            }
          } catch (error: any) {
            // Handle fetch error here
            console.error("Error Updating Record:", error);
            setError(error.message || "Error updating record");
            setTimeout(() => {
              setError(null);
            }, 3000);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="flex flex-col gap-4 ">
              <div className="flex items-center justify-center gap-4">
                <div className="w-full">
                  <label htmlFor="name" className="text-white">
                    Name
                  </label>
                  <Field
                    name="name"
                    type="text"
                    id="name"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="mt-1 text-danger"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="content" className="text-white">
                    Content
                  </label>
                  <Field
                    name="content"
                    type="text"
                    id="content"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="content"
                    component="div"
                    className="mt-1 text-danger"
                  />
                </div>
              </div>
              <div className="flex justify-end items-center gap-4">
                <button
                  className="flex w-[100px] items-center justify-center rounded-lg mr-2 border border-primary px-4 py-2 text-primary"
                  onClick={() => setEdit(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex w-[100px] items-center justify-center rounded-lg px-4 py-2 bg-primary"
                  type="submit"
                >
                  <p className="text-lg text-white">
                    {isSubmitting ? " updating... " : " update "}
                  </p>
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
      <div>{error && <p className="mt-6 text-red-500">{error}</p>}</div>
    </Modal>
  );
};

export default EditZone;
