import React from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Modal from "@/components/Modal";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { createStore } from "@/store/features/storeApi";
import { getSession } from "next-auth/react";
import { ComponentFieldWithLabel } from "../marketingHooks/FieldWithLabel";
import FormikCapsuleDropDown from "../marketingHooks/CapsuleDropDown";

interface NewStoreModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onStoreCreated: (data: any) => void;
}

const validationSchema = Yup.object().shape({
  store_name: Yup.string().required("Store Name is required"),
  first_name: Yup.string().required("First Name is required"),
  last_name: Yup.string().required("Last Name is required"),
  password: Yup.string().required("Password is required"),
  logo: Yup.string(),
  meta_data: Yup.string(),
  email: Yup.string().email().required("Email is required"),
});

const NewStoreModal = ({
  isOpen,
  onRequestClose,
  onStoreCreated,
}: NewStoreModalProps) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div>
        <h2 className="mb-4 text-lg font-bold text-white">Create Store</h2>
        <Formik
          initialValues={{
            store_name: "",
            first_name: "",
            last_name: "",
            email: "",
            password: "",
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            const userData = await getSession();
            if (!userData) {
              setSubmitting(false);
              showErrorToast("User not found");
              return;
            }
            const data = await createStore({
              ...values,
              user_id: userData.id,
            });
            if (data?.error) {
              setSubmitting(false);
              showErrorToast(data.error);
              return;
            }
            // using values from user input to show the store name in list
            onStoreCreated(values);
            if (data) {
              showSuccessToast({
                title: "Store created successfully",
              });
            }
            onRequestClose();
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form>
              <div className="space-y-4">
                <div
                  className={
                    touched.store_name && errors.store_name ? "has-error" : ""
                  }
                >
                  <label htmlFor="store_name" className="text-white">
                    Store Name
                  </label>
                  <Field
                    name="store_name"
                    type="text"
                    id="store_name"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="store_name"
                    component="div"
                    className="mt-1 text-danger"
                  />
                </div>
                <div
                  className={
                    touched.first_name && errors.first_name ? "has-error" : ""
                  }
                >
                  <label htmlFor="first_name" className="text-white">
                    First Name
                  </label>
                  <Field
                    name="first_name"
                    type="text"
                    id="first_name"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="first_name"
                    component="div"
                    className="mt-1 text-danger"
                  />
                </div>
                <div
                  className={
                    touched.last_name && errors.last_name ? "has-error" : ""
                  }
                >
                  <label htmlFor="last_name" className="text-white">
                    Last Name
                  </label>
                  <Field
                    name="last_name"
                    type="text"
                    id="last_name"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="last_name"
                    component="div"
                    className="mt-1 text-danger"
                  />
                </div>
                <div
                  className={touched.email && errors.email ? "has-error" : ""}
                >
                  <label htmlFor="email" className="text-white">
                    Email
                  </label>
                  <Field
                    name="email"
                    type="email"
                    id="email"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="mt-1 text-danger"
                  />
                </div>
                <div
                  className={
                    touched.password && errors.password ? "has-error" : ""
                  }
                >
                  <label htmlFor="password" className="text-white">
                    Password
                  </label>
                  <Field
                    name="password"
                    type="password"
                    id="password"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="mt-1 text-danger"
                  />
                </div>
                <div>
                  <label htmlFor="logo" className="text-white">
                    Logo
                  </label>
                  <Field
                    name="logo"
                    type="file"
                    id="logo"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="logo"
                    component="div"
                    className="mt-1 text-danger"
                  />
                </div>
                <div className="mt-4">
                  <label htmlFor="meta_data" className="text-white">
                    Meta Data
                  </label>
                  <ComponentFieldWithLabel
                    label=""
                    name="meta_data"
                    component={FormikCapsuleDropDown}
                    id="meta_data"
                    suggestions={["meta1", "meta2", "meta3", "meta4"]}
                    defaultValue={"meta1, meta2"}
                  />
                  <ErrorMessage
                    name="meta_data"
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
                  {isSubmitting ? "Creating..." : "Create Store"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default NewStoreModal;
