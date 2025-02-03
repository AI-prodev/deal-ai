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
import { createDomainApi } from "@/store/features/domainApi";

interface NewDomainModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onDomainCreated: () => void;
}

const domainRegex =
  /^(?![.-])([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?<![-.])$/;
const validationSchema = Yup.object().shape({
  domain: Yup.string()
    .required("Domain is required")
    .matches(
      domainRegex,
      'Format should be "hostname.com" or "subdomain.hostname.com", without leading or trailing characters.'
    ),
});

const NewDomainModal: React.FC<NewDomainModalProps> = ({
  isOpen,
  onRequestClose,
  onDomainCreated,
}) => {
  const [createDomain] = createDomainApi.useCreateDomainMutation();

  const stopPropagation = (event: any) => {
    event.stopPropagation();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div>
        <h2 className="mb-4 text-lg font-bold text-white">Add Domain</h2>
        <Formik
          initialValues={{
            domain: "",
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const data = await createDomain({
                domain: values.domain,
                external: false,
              }).unwrap();

              onDomainCreated();
              if (data) {
                await showSuccessToast({ title: data.message });
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
                  className={touched.domain && errors.domain ? "has-error" : ""}
                >
                  <label htmlFor="domain" className="text-white">
                    Domain
                  </label>
                  <div className="text-white text-sm font-normal mb-2">
                    "example.com" or "subdomain.example.com"
                  </div>
                  <Field
                    name="domain"
                    type="text"
                    id="domain"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="domain"
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
                  {isSubmitting ? "Creating..." : "Add Domain"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default NewDomainModal;
