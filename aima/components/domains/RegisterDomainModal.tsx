import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Modal from "@/components/Modal";
import StripeButton from "@/components/domains/Stripe";
import { createDomainApi } from "@/store/features/domainApi";
import { useSession } from "next-auth/react";
import { CustomGlobeSVG } from "../apollo/Svg/SvgData";
interface RegisterDomainModalProps {
  isOpen: boolean;
  isOpenForm: boolean;
  setOpenForm: any;
  onRequestClose: () => void;
  onDomainCreated: () => void;
  setIsExists: (isExists: boolean) => void;
  seIsAvailable: (notAvailable: boolean) => void;
  notAvailable: boolean;
  isExists: boolean;
  setPaid: any;
  paid: boolean;
  setSubID: any;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  setDomainInfo: any;
  domainInfo: any;
}

const domainRegex =
  /^(?![.-])([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?<![-.])$/;
const validationSchema = Yup.object().shape({
  domain: Yup.string()
    .required("Domain is required")
    .matches(
      domainRegex,
      'Format should be "hostname.com" without leading or trailing characters.'
    ),
});

const RegisterDomainModal: React.FC<RegisterDomainModalProps> = ({
  isOpen,
  isOpenForm,
  setOpenForm,
  onRequestClose,
  setSubID,
  isExists,
  notAvailable,
  seIsAvailable,
  setIsExists,
  setPaid,
  paid,
  setIsProcessing,
  isProcessing,
  setDomainInfo,
  domainInfo,
}) => {
  const [domainNotFoundError, setDomainNotFoundError] =
    useState<boolean>(false);
  const [checkDomain] = createDomainApi.useCheckDomainMutation();
  const { data: session } = useSession();

  const handleModalClose = () => {
    setDomainInfo(null);
    setDomainNotFoundError(false);
    seIsAvailable(false);
    setIsExists(false);
    onRequestClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={handleModalClose}>
      <div>
        <h2 className="mb-4 text-lg font-bold text-white">
          Register New Domain
        </h2>
        <Formik
          initialValues={{
            domain: "",
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const domainName = values.domain;
              const token = session?.token || "";

              const response = await checkDomain({
                token,
                domainName,
              });

              if ("data" in response) {
                const data = response.data;

                if (data) {
                  setDomainInfo(data);
                }
              } else {
                const error = response.error;
                console.error("Error fetching domain availability:", error);
              }
            } catch (error) {
              console.error("Error fetching domain availability:", error);
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
                  <div className="mb-2 text-sm font-normal text-white">
                    "example.com"
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
                  onClick={handleModalClose}
                  className="mr-2 rounded border border-primary px-4 py-2 text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded bg-primary px-4 py-2 text-white"
                >
                  {isSubmitting ? "Searching..." : "Search for a Domain"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
        {domainInfo ? (
          domainInfo.available ? (
            <div className="mt-4 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white">Domain</h3>
              <div className="flex items-center justify-between rounded-md bg-white p-2 form-input">
                <div className="flex items-center gap-2">
                  <CustomGlobeSVG className="h-6 w-6 text-white" />
                  <p className="text-lg text-white">{domainInfo.domain}</p>
                </div>
                <StripeButton
                  setIsProcessing={setIsProcessing}
                  isProcessing={isProcessing}
                  setSubID={setSubID}
                  domain={domainInfo.domain}
                  setPaid={setPaid}
                  paid={paid}
                  setOpenForm={setOpenForm}
                  isOpenForm={isOpenForm}
                  onRequestClose={onRequestClose}
                  handleModalClose={handleModalClose}
                />
              </div>
            </div>
          ) : (
            <div className="mt-4">
              {notAvailable && (
                <p className="text-red-500">The domain is already registered</p>
              )}
            </div>
          )
        ) : domainNotFoundError ? (
          <div className="mt-4">
            {isExists && (
              <p className="text-red-500">The entered domain does not exist.</p>
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default RegisterDomainModal;
