// MarketingForms.tsx
import { Form, Formik, FormikProps } from "formik";
import React, { useState } from "react";
import { ComponentFieldWithLabel } from "../marketingHooks/FieldWithLabel"; // make sure to import the new component

import * as Yup from "yup";
import { showSuccessToast } from "@/utils/toast";

import "tippy.js/dist/tippy.css";

import { createFunnelApi } from "@/store/features/projectApi";
import { IFunnel } from "@/interfaces/IFunnel";
import { createDomainApi } from "@/store/features/domainApi";
import FormikDropDown from "./DropDown";
import Link from "next/link";
import { FunnelType } from "@/enums/funnel-type.enum";
import clsx from "clsx";

interface FormValues {
  domainId: string | undefined;
}

const FunnelDomain = ({
  isLightMode = false,
  funnel,
  type,
}: {
  isLightMode?: boolean;
  funnel: IFunnel;
  type: FunnelType;
}) => {
  const { refetch: refetchFunnels } = createFunnelApi.useGetFunnelQuery(
    {
      funnelId: funnel._id,
    },
    { skip: !funnel }
  );
  const { data: domains } = createDomainApi.useGetMyDomainsQuery({});
  const [isLoading, setIsLoading] = useState(false);

  let formikRef: { current: FormikProps<FormValues> | null } = {
    current: null,
  };
  const FormValidation = Yup.object().shape({
    domainId: Yup.string(),
  });

  const [updateFunnelDomain] = createFunnelApi.useUpdateFunnelDomainMutation();

  const submitForm = async (values: FormValues) => {
    setIsLoading(true);

    try {
      const data = await updateFunnelDomain({
        funnelId: funnel._id,
        domainId: values.domainId,
      }).unwrap();

      if (data) {
        refetchFunnels();
        setIsLoading(false);
        showSuccessToast({ title: "Domain Updated" });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save domain", error);
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
          domainId:
            funnel.domain?._id ||
            domains?.map(domain => domain.domain).join(", "),
        }}
        innerRef={formikInstance => {
          if (formikInstance?.errors && formikInstance.isSubmitting) {
            scrollToFirstError(formikInstance.errors);
          }
          formikRef.current = formikInstance;
        }}
        validationSchema={FormValidation}
        onSubmit={submitForm}
      >
        {({ errors, submitCount, touched, values, setFieldValue }) => (
          <Form
            className={clsx("", {
              "text-black": isLightMode,
              "text-white": !isLightMode,
            })}
          >
            <ComponentFieldWithLabel
              name="domainId"
              label={`What domain would you like to host your ${type !== FunnelType.ULTRA_FAST_FUNNEL ? "website" : "funnel"} on?`}
              tooltipContent={`Domain: Add a domain on your domains page and then select it here`}
              component={props => (
                <FormikDropDown isLightMode={isLightMode} {...props} />
              )}
              id="domainId"
              isLightMode={isLightMode}
              defaultValue={""}
              suggestions={
                domains
                  ? [
                      {
                        display: "(no domain)",
                        value: undefined,
                      },
                      ...domains.map(domain => ({
                        display: domain.domain,
                        value: domain._id,
                      })),
                    ]
                  : [
                      {
                        display: "(no domain)",
                        value: undefined,
                      },
                    ]
              }
            />
            <div className="flex justify-end mt-0">
              <Link href="/domains" className="underline text-blue-500">
                Manage Domains
              </Link>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="btn btn-primary mb-6"
            >
              Save
            </button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default FunnelDomain;
