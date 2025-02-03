import React, { useEffect, useMemo, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Modal from "@/components/Modal";
import { showErrorToast } from "@/utils/toast";
import ModalLight from "@/components/ModalLight";
import { randomString } from "@/helpers/random";
import { createEmailUserAPI } from "@/store/features/emailUserApi";
import Swal from "sweetalert2";

interface Props {
  emailUserId: string;
  emailUserEmail: string;
  isOpen: boolean;
  onRequestClose: () => void;
  onEmailShared: () => void;
}

const validationSchema = Yup.object().shape({
  toEmail: Yup.string().required("An email address is required"),
});

const ShareEmailModal: React.FC<Props> = ({
  emailUserId,
  emailUserEmail,
  isOpen,
  onRequestClose,
  onEmailShared,
}) => {
  const IS_LIGHT_MODE = true;
  const [shareEmailCredentials] =
    createEmailUserAPI.useShareEmailCredentialsMutation();

  const modalContent = (
    <div>
      <h2
        className={`mb-4 text-lg font-bold ${!IS_LIGHT_MODE && "text-white"}`}
      >
        Share Credentials
      </h2>
      <Formik
        initialValues={{
          toEmail: "",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            setSubmitting(true);

            const toEmail = values.toEmail;

            const res = await shareEmailCredentials({
              emailUserId,
              toEmail,
            });
            if ((res as any)?.error) {
              throw new Error(
                (res as any).error?.data?.error || "Something went wrong"
              );
            }

            onEmailShared();

            Swal.mixin({
              toast: true,
              position: "top",
              showConfirmButton: false,
              timer: 3000,
            }).fire({
              icon: "success",
              title: "Email credentials sent",
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
                      touched.toEmail && errors.toEmail ? "has-error" : ""
                    }
                  >
                    <label
                      htmlFor="toEmail"
                      className={`${!IS_LIGHT_MODE && "text-white"}`}
                    >
                      Send login credentials for {emailUserEmail} to this email:
                    </label>
                    <Field
                      name="toEmail"
                      type="text"
                      id="toEmail"
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
                      name="toEmail"
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
                  {isSubmitting ? "Sending..." : "Send Now"}
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

export default ShareEmailModal;
