import React, { useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import { showErrorToast, showSuccessToast } from "@/utils/toast";
import LoadingSpinner from "@/pages/components/loadingSpinner";
import { createProfileAPI } from "@/store/features/profileApi";

interface ChangePasswordProps {
  userID: string;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({
  userID,
}: ChangePasswordProps) => {
  const profileApiClient = createProfileAPI;
  const [changePassword, { isLoading, isError, isSuccess, error }] =
    profileApiClient.useChangePasswordMutation();

  const initialValues = {
    oldPassword: "",
    newPassword: "",
  };

  const validationSchema = Yup.object({
    oldPassword: Yup.string().required("Old password is required"),
    newPassword: Yup.string()
      .required("New password is required")
      .min(6, "New password must be at least 6 characters long")
      .notOneOf(
        [Yup.ref("oldPassword")],
        "New password must be different from the old password"
      ),
  });

  const handleSubmit = async (
    values: typeof initialValues,
    {
      setSubmitting,
      resetForm,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
      resetForm: () => void;
    }
  ) => {
    try {
      await changePassword({
        userId: userID,
        newPassword: values.newPassword,
        oldPassword: values.oldPassword,
      }).unwrap();
      resetForm();
    } catch (err: any) {
      showErrorToast(err.data.error ? err.data.error : err.data.errors[0].msg);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      showSuccessToast({ title: "Password changed successfully!" });
    }
  }, [isSuccess]);

  return (
    <div className="mt-10">
      <h5 className="mb-4 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
        Change Password
      </h5>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="space-y-5">
            <div
              className={
                touched.oldPassword && errors.oldPassword ? "has-error" : ""
              }
            >
              <label htmlFor="oldPassword">Old Password</label>
              <Field
                name="oldPassword"
                type="password"
                id="oldPassword"
                className="form-input"
              />
              <ErrorMessage
                name="oldPassword"
                component="div"
                className="mt-1 text-danger"
              />
            </div>

            <div
              className={
                touched.newPassword && errors.newPassword ? "has-error" : ""
              }
            >
              <label htmlFor="newPassword">New Password</label>
              <Field
                name="newPassword"
                type="password"
                id="newPassword"
                className="form-input"
              />
              <ErrorMessage
                name="newPassword"
                component="div"
                className="mt-1 text-danger"
              />
            </div>

            <div className="mt-3 mb-3">
              <button
                disabled={isSubmitting}
                type="submit"
                className="btn btn-primary"
              >
                {isLoading && <LoadingSpinner isLoading />}
                Change Password
              </button>
            </div>
            {/* {isError && <p>Error: {error?.msg ? error?.msg : error}</p>} */}
            {/* {isSuccess && <p>Password changed successfully!</p>} */}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ChangePassword;
