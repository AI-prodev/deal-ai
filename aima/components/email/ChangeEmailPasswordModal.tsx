import React, { useEffect, useMemo, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Modal from "@/components/Modal";
import { showErrorToast } from "@/utils/toast";
import ModalLight from "@/components/ModalLight";
import { randomString } from "@/helpers/random";
import Swal from "sweetalert2";
import { createEmailUserAPI } from "@/store/features/emailUserApi";

interface Props {
  emailUserId: string;
  emailUserEmail: string;
  isOpen: boolean;
  onRequestClose: () => void;
  onPasswordChanged: (newPassword: string) => void;
}

const validationSchema = Yup.object().shape({
  newPassword: Yup.string().required("A password is required"),
});

const ChangeEmailPasswordModal: React.FC<Props> = ({
  emailUserId,
  emailUserEmail,
  isOpen,
  onRequestClose,
  onPasswordChanged,
}) => {
  const IS_LIGHT_MODE = true;
  const [changeEmailPassword] =
    createEmailUserAPI.useChangeEmailPasswordMutation();

  const defaultValue = randomString(10);

  const modalContent = (
    <div>
      <h2
        className={`mb-4 text-lg font-bold ${!IS_LIGHT_MODE && "text-white"}`}
      >
        Reset Password
      </h2>
      <Formik
        initialValues={{
          newPassword: defaultValue,
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            setSubmitting(true);

            const newPassword = values.newPassword;

            const res = await changeEmailPassword({
              emailUserId,
              newPassword,
            });
            if ((res as any)?.error) {
              throw new Error(
                (res as any).error?.data?.error || "Something went wrong"
              );
            }

            onPasswordChanged(newPassword);

            Swal.mixin({
              toast: true,
              position: "top",
              showConfirmButton: false,
              timer: 3000,
            }).fire({
              icon: "success",
              title: "Password changed",
              padding: "10px 20px",
            });

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
        {({ isSubmitting, touched, errors, setFieldValue, values }) => {
          return (
            <Form>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  <div
                    className={
                      touched.newPassword && errors.newPassword
                        ? "has-error"
                        : ""
                    }
                  >
                    <label
                      htmlFor="newPassword"
                      className={`${!IS_LIGHT_MODE && "text-white"}`}
                    >
                      New password for {emailUserEmail}:
                    </label>
                    <Field
                      name="newPassword"
                      type="text"
                      id="newPassword"
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
                      name="newPassword"
                      component="div"
                      className="mt-1 text-danger"
                    />
                  </div>
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
                  {isSubmitting ? "Resetting..." : "Reset"}
                </button>
              </div>
            </Form>
          );
        }}
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

export default ChangeEmailPasswordModal;
