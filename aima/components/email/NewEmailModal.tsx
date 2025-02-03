import React, { useEffect, useMemo, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Modal from "@/components/Modal";
import { showErrorToast } from "@/utils/toast";
import ModalLight from "@/components/ModalLight";
import { randomString } from "@/helpers/random";
import { createEmailUserAPI } from "@/store/features/emailUserApi";
import Swal from "sweetalert2";
import { createDomainApi } from "@/store/features/domainApi";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { createStripeApi } from "@/store/features/stripeApi";
import { formatPriceWithCents } from "../UnlockAccessModal";
import Link from "next/link";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

interface Props {
  isOpen: boolean;
  onRequestClose: () => void;
  onEmailCreated: (email: string, password: string) => void;
}

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("A first name is required"),
  lastName: Yup.string().required("A last name is required"),
  emailPrefix: Yup.string().required("An email address is required"),
  domainid: Yup.string(),
});

const NewEmailModal: React.FC<Props> = ({
  isOpen,
  onRequestClose,
  onEmailCreated,
}) => {
  const IS_LIGHT_MODE = true;
  const [createEmailUser] = createEmailUserAPI.useCreateEmailUserMutation();
  const { data: config } = createEmailUserAPI.useGetConfigQuery({});
  const { data: quotas, refetch: refechQuotas } =
    createEmailUserAPI.useGetQuotasQuery({});
  const { data: domains } = createDomainApi.useGetMyDomainsQuery({});
  const [error, setError] = useState("");
  const stripe = useStripe();
  const elements = useElements();
  const { data: price } = createStripeApi.useGetPriceQuery({
    priceId: process.env.NEXT_PUBLIC_STRIPE_EMAIL_PRICE_ID!,
  });
  const { data: product } = createStripeApi.useGetProductQuery({
    productId: process.env.NEXT_PUBLIC_STRIPE_EMAIL_PRODUCT_ID!,
  });

  const domainOptions = useMemo(() => {
    if (!domains || !config) {
      return [];
    }
    const result = domains.map(domain => ({
      value: domain._id,
      label: domain.domain,
    }));

    result.unshift({
      value: "",
      label: config.defaultDomainName,
    });

    return result;
  }, [domains, config]);

  useEffect(() => {
    refechQuotas();
  }, [isOpen]);

  const paymentRequired = useMemo(() => {
    if (
      quotas &&
      quotas.existingEmailUsers >= quotas.emailFreeQuota + quotas.emailPaidQuota
    ) {
      return true;
    }
    return false;
  }, [quotas]);

  const modalContent = (
    <div>
      <h2
        className={`mb-4 text-lg font-bold ${!IS_LIGHT_MODE && "text-white"}`}
      >
        New Email Account
      </h2>
      <Formik
        initialValues={{
          firstName: "",
          lastName: "",
          emailPrefix: "",
          domainId: "",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            let paymentMethodId = "";

            if (error) {
              const cardElement = elements?.getElement(CardElement);
              if (!cardElement || !stripe) {
                return;
              }
              const { paymentMethod, error } =
                await stripe?.createPaymentMethod({
                  type: "card",
                  card: cardElement,
                });
              if (error) {
                setError(error.message || "Something went wrong");
                return;
              }
              paymentMethodId = paymentMethod.id;
              setError("");
            }

            const emailPrefix = values.emailPrefix;
            const domainId = values.domainId;
            const firstName = values.firstName;
            const lastName = values.lastName;
            const password = randomString(12);
            const domainName =
              domainOptions.find(d => d.value === domainId)?.label ||
              config?.defaultDomainName;

            const emailAddress =
              emailPrefix.trim().toLowerCase() + "@" + domainName;

            const res = await createEmailUser({
              emailPrefix,
              domainId,
              firstName,
              lastName,
              password,
              priceId: paymentRequired
                ? process.env.NEXT_PUBLIC_STRIPE_EMAIL_PRICE_ID!
                : undefined,
              paymentMethodId: paymentRequired ? paymentMethodId : undefined,
            });

            // eslint-disable-next-line no-console
            console.log("res=", JSON.stringify(res));

            if ((res as any)?.error?.status == 400) {
              if ((res as any)?.error) {
                throw new Error(
                  (res as any).error?.data?.error || "Something went wrong"
                );
              } else if ((res as any)?.data?.error) {
                throw new Error(
                  (res as any).data?.error || "Something went wrong"
                );
              }
            } else if ((res as any)?.data?.error) {
              // Set the error this way so that the card form shows
              setError((res as any).data?.error || "Something went wrong");
              return;
            }

            refechQuotas();

            onEmailCreated(emailAddress, password);

            Swal.mixin({
              toast: true,
              position: "top",
              showConfirmButton: false,
              timer: 3000,
            }).fire({
              icon: "success",
              title: "New account created",
              padding: "10px 20px",
            });

            onRequestClose();
          } catch (error) {
            console.error(error);
            // //@ts-ignore
            // showErrorToast(
            //     //@ts-ignore
            //     error && error.data.error ? error.data.error : error
            // );
            //@ts-ignore
            //setError(error.toString());
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, touched, errors, setFieldValue, values }) => {
          useEffect(() => {
            if (!touched.emailPrefix) {
              const updatedEmailPrefix = values.firstName.toLowerCase();
              setFieldValue("emailPrefix", updatedEmailPrefix);
            }
          }, [values.firstName, touched.emailPrefix, setFieldValue]);

          return (
            <Form>
              <div className="">
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className={
                      touched.firstName && errors.firstName ? "has-error" : ""
                    }
                  >
                    <label
                      htmlFor="firstName"
                      className={`${!IS_LIGHT_MODE && "text-white"}`}
                    >
                      First Name
                    </label>
                    <Field
                      name="firstName"
                      type="text"
                      id="firstName"
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
                      name="firstName"
                      component="div"
                      className="mt-1 text-danger"
                    />
                  </div>
                  <div
                    className={
                      touched.lastName && errors.lastName ? "has-error" : ""
                    }
                  >
                    <label
                      htmlFor="lastName"
                      className={`${!IS_LIGHT_MODE && "text-white"}`}
                    >
                      Last Name
                    </label>
                    <Field
                      name="lastName"
                      type="text"
                      id="lastName"
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
                      name="lastName"
                      component="div"
                      className="mt-1 text-danger"
                    />
                  </div>
                </div>
                <div
                  className={`
                                        ${
                                          touched.emailPrefix &&
                                          errors.emailPrefix
                                            ? "has-error"
                                            : ""
                                        }
                                        mt-2
                                    `}
                >
                  <label
                    htmlFor="emailPrefix"
                    className={`${!IS_LIGHT_MODE && "text-white"}`}
                  >
                    Email Address
                  </label>
                  <div className="flex">
                    <Field
                      name="emailPrefix"
                      type="text"
                      id="emailPrefix"
                      className="form-input rounded-tr-none rounded-br-none border-r-0"
                      style={
                        IS_LIGHT_MODE
                          ? {
                              backgroundColor: "white",
                              color: "#333333",
                            }
                          : {}
                      }
                    />
                    <div
                      className="form-input border-t border-b rounded-none border-r-0 border-l-0 w-8 flex items-center justify-center"
                      style={
                        IS_LIGHT_MODE
                          ? {
                              backgroundColor: "#eee",
                              color: "#333333",
                            }
                          : {}
                      }
                    >
                      @
                    </div>
                    <div
                      className="form-input rounded-tl-none rounded-bl-none border-l-0"
                      style={
                        IS_LIGHT_MODE
                          ? {
                              backgroundColor: "white",
                              color: "#333333",
                            }
                          : {}
                      }
                    >
                      <select
                        onChange={e =>
                          setFieldValue("domainId", e.target.value)
                        }
                        value={values.domainId}
                        className="w-full"
                      >
                        {domainOptions.map((option, index) => (
                          <option key={index} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <ErrorMessage
                    name="emailPrefix"
                    component="div"
                    className="mt-1 text-danger"
                  />
                </div>
                <div className="flex justify-end mt-3">
                  {values.domainId ? (
                    <div className="text-sm text-gray-400">
                      Domain setup instructions will be provided
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Link
                        href="/domains"
                        className="text-sm text-blue-600 underline"
                      >
                        Add or buy a domain name
                      </Link>
                      <Tippy
                        className=""
                        content={`Connect an existing domain, or buy a new one, to get branded emails for your organization.`}
                        placement="top"
                      >
                        <div className="ml-2 rounded-full w-5 h-5 bg-gray-400 text-white text-xs flex items-center justify-center cursor-default">
                          <div>?</div>
                        </div>
                      </Tippy>
                    </div>
                  )}
                </div>
                {error && (
                  <>
                    <div className="bg-gray-500 rounded px-4 py-1.5">
                      <p className="text-white text-sm">
                        There was a problem with your purchase. Please try again
                        with a new card.
                      </p>
                    </div>
                    <div className="border rounded px-2 py-4 border-gray-500">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: "16px",
                              color: "#000",
                              "::placeholder": {
                                color: "#aab7c4",
                              },
                            },
                            invalid: {
                              color: "#9e2146",
                            },
                          },
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
              {quotas && price && product ? (
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
                    {isSubmitting
                      ? "Creating..."
                      : paymentRequired
                        ? `Create Account for ${formatPriceWithCents(price.unit_amount, price.type, price.recurring)}`
                        : "Create Account"}
                  </button>
                </div>
              ) : (
                <div className="mt-4 flex justify-end">&nbsp;</div>
              )}
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

export default NewEmailModal;
