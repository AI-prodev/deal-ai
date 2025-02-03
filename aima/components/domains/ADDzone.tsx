import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useSession } from "next-auth/react";
import { showSuccessToast } from "@/utils/toast";
import { createDomainApi } from "@/store/features/domainApi";
interface AddZoneProps {
  id: any;
  setData: any;
  setRefresh: any;
  setAdd: any;
}

const AddZone: React.FC<AddZoneProps> = ({
  id,
  setData,
  setRefresh,
  setAdd,
}) => {
  const { data: session } = useSession();
  const [error, setError] = useState(null);
  const [addZone] = createDomainApi.useAddZoneMutation();

  return (
    <>
      <Formik
        initialValues={{
          name: "",
          type: "",
          content: "",
        }}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const token = session?.token || "";
            const domainName = id;
            const { name, type, content } = values;
            const response = await addZone({
              domainName,
              name,
              type,
              content,
              token,
            });

            if ("data" in response) {
              setRefresh((prev: any) => prev + 1);
              showSuccessToast({ title: "created" });
              setData(response.data);
            }
          } catch (error: any) {
            console.error("Error Adding new Record:", error);
            setError(error.message || "Error adding new record");
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
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center gap-4">
                <div className="w-full">
                  <label htmlFor="type" className="text-white">
                    Type
                  </label>
                  <Field
                    as="select"
                    name="type"
                    id="type"
                    className="form-input"
                    required
                  >
                    <option value="A">A</option>
                    <option value="AAAA">AAAA</option>
                    <option value="CNAME">CNAME</option>
                    <option value="MX">MX</option>
                    <option value="URL">URL</option>
                    <option value="TXT">TXT</option>
                  </Field>
                  <ErrorMessage
                    name="type"
                    component="div"
                    className="mt-1 text-danger"
                  />
                </div>
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
                    required
                  />
                  <ErrorMessage
                    name="content"
                    component="div"
                    className="mt-1 text-danger"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  className="flex w-[100px] items-center justify-center rounded-lg mr-2 border px-4 py-2 border-primary text-primary"
                  type="button"
                  onClick={() => setAdd(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex w-[100px] items-center justify-center rounded-lg bg-primary px-4 py-2"
                  type="submit"
                >
                  <p className="text-lg text-white">
                    {isSubmitting ? " Adding... " : "Add"}
                  </p>
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
      <div>{error && <p className="mt-6 text-red-500">{error}</p>}</div>
    </>
  );
};

export default AddZone;
