import {
  Field,
  FieldArray,
  Form,
  Formik,
  FormikProps,
  ErrorMessage,
} from "formik";
import React, { useEffect, useState } from "react";
import {
  ComponentFieldWithLabel,
  FieldWithLabel,
} from "../marketingHooks/FieldWithLabel"; // make sure to import the new component

import * as Yup from "yup";
import { showErrorToastTimer, showSuccessToast } from "@/utils/toast";

import "tippy.js/dist/tippy.css";

import { createFunnelApi } from "@/store/features/projectApi";
import { IFunnel } from "@/interfaces/IFunnel";
import { createDomainApi } from "@/store/features/domainApi";
import clsx from "clsx";

interface FormValues {
  webhooks: string[] | [];
}

const FunnelWebhooks = ({
  funnel,
  isLightMode,
}: {
  funnel: IFunnel;
  isLightMode?: boolean;
}) => {
  console.error("funnel", funnel);
  const { refetch: refetchFunnels } = createFunnelApi.useGetFunnelQuery({
    funnelId: funnel._id,
  });

  const [isLoading, setIsLoading] = useState(false);

  let formikRef: { current: FormikProps<FormValues> | null } = {
    current: null,
  };

  const FormValidation = Yup.object().shape({
    webhooks: Yup.array().of(
      Yup.string()
        .nullable()
        .matches(
          /^(http:\/\/|https:\/\/).*$|^$/,
          "Webhooks must start with http:// or https://"
        )
    ),
  });

  const [updateFunnelWebhook] =
    createFunnelApi.useUpdateFunnelWebhookMutation();

  const submitForm = async (values: FormValues) => {
    console.error("values", values);

    setIsLoading(true);

    try {
      const data = await updateFunnelWebhook({
        funnelId: funnel._id,
        webhooks: values.webhooks,
      }).unwrap();

      if (data) {
        refetchFunnels();
        setIsLoading(false);
        showSuccessToast({ title: "Webhooks Updated" });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save webhooks", error);
    }
  };

  const scrollToFirstError = (errors: any) => {
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
      const errorElement = document.querySelector(`[name=${firstErrorKey}]`);
      if (errorElement) {
        const topOffset = 100;
        const elementPosition = errorElement.getBoundingClientRect().top;
        window.scrollBy({
          top: elementPosition - topOffset,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <>
      <Formik
        initialValues={{
          webhooks: funnel?.webhooks?.length > 0 ? funnel.webhooks : [""],
        }}
        innerRef={formikInstance => {
          if (formikInstance?.errors && formikInstance.isSubmitting) {
            console.error("formikInstance.errors=", formikInstance.errors);

            scrollToFirstError(formikInstance.errors);
          }
          formikRef.current = formikInstance;
        }}
        validationSchema={FormValidation}
        onSubmit={submitForm}
      >
        {({ errors, submitCount, touched, values, setFieldValue }) => (
          <Form className="text-white">
            <FieldArray
              name="webhooks"
              render={({ insert, remove, form }) => (
                <div className="">
                  {values.webhooks.length === 0 ? (
                    <div className="flex w-full items-center py-2">
                      <Field
                        name="webhook"
                        type="text"
                        id="webhook"
                        className={clsx("form-input whitespace-pre-wrap", {
                          "!bg-white !text-[#333333]": isLightMode,
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => insert(values.webhooks.length + 1, "")}
                        className="ml-2 flex items-center justify-center rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label="Add field"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M12 4v16m8-8H4"></path>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    values.webhooks.map((webhook, index) => (
                      <div
                        key={`webhook-${index}`}
                        className="flex w-full items-center py-2"
                      >
                        <Field
                          name={`webhooks[${index}]`}
                          type="text"
                          className={clsx("form-input whitespace-pre-wrap", {
                            "!bg-white !text-[#333333]": isLightMode,
                          })}
                          placeholder="https://hooks.zapier.com/hooks/catch..."
                        />
                        {index === values.webhooks.length - 1 &&
                          values.webhooks.length < 5 && (
                            <button
                              type="button"
                              onClick={() => insert(index + 1, "")}
                              className="ml-2 flex items-center justify-center rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              aria-label="Add field"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M12 4v16m8-8H4"></path>
                              </svg>
                            </button>
                          )}
                        {values.webhooks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="mx-2 flex items-center justify-center rounded-full bg-red-500 p-2  text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            aria-label="Remove field"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            />

            <button
              disabled={isLoading}
              type="submit"
              className="btn btn-primary mt-3"
            >
              Save
            </button>
            {errors && errors.webhooks && (
              <p className="text-red-400 mt-2">
                {Array.isArray(errors.webhooks)
                  ? errors.webhooks.filter(e => e)[0]
                  : errors.webhooks}
              </p>
            )}
          </Form>
        )}
      </Formik>
    </>
  );
};

export default FunnelWebhooks;
