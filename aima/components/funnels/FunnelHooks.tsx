// MarketingForms.tsx
import { Field, FieldArray, Form, Formik, FormikProps } from "formik";
import React, { useEffect, useState } from "react";
import {
  ComponentFieldWithLabel,
  FieldWithLabel,
} from "../marketingHooks/FieldWithLabel"; // make sure to import the new component
import RangeSlider from "../marketingHooks/RangeSlider";

import ToneSelector from "../marketingHooks/ToneSelector";

import * as Yup from "yup";
import { showErrorToastTimer, showSuccessToast } from "@/utils/toast";

import "tippy.js/dist/tippy.css";

import { createFunnelApi } from "@/store/features/projectApi";
import { IFunnel } from "@/interfaces/IFunnel";

interface FormValues {
  businessDescription: string;
  tone: string;
  toneAdditionalInfo: string;
  aggressiveness: number;
  hookCreative: number;
  targetAudience: string;
}

const FunnelHooks = ({ funnel }: { funnel: IFunnel }) => {
  const { refetch: refetchFunnels } = createFunnelApi.useGetFunnelQuery(
    {
      funnelId: funnel._id,
    },
    { skip: !funnel }
  );
  const [isLoading, setIsLoading] = useState(false);

  let formikRef: { current: FormikProps<FormValues> | null } = {
    current: null,
  };
  const FormValidation = Yup.object().shape({
    businessDescription: Yup.string().required(
      "Please enter the business description"
    ),
  });

  const [updateFunnelSettings] =
    createFunnelApi.useUpdateFunnelSettingsMutation();

  const submitForm = async (values: FormValues) => {
    setIsLoading(true);
    const submissionData = {
      ...values,
    };

    try {
      const data = await updateFunnelSettings({
        funnelId: funnel._id,
        settings: submissionData,
      }).unwrap();

      if (data) {
        refetchFunnels();
        setIsLoading(false);
        showSuccessToast({ title: "Settings Saved" });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to create hooks", error);
    }
  };

  const scrollToFirstError = (errors: any) => {
    console.error("Errors:", errors);
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
          businessDescription: "",
          tone: funnel.settings?.tone || "",
          toneAdditionalInfo: funnel.settings?.toneAdditionalInfo || "",
          aggressiveness: funnel.settings?.aggressiveness || 8,
          hookCreative: funnel.settings?.hookCreative || 10,
          targetAudience: funnel.settings?.targetAudience || "everyone",
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
          <Form className="space-y-5 text-white">
            <FieldWithLabel
              name="businessDescription"
              label="Business Description"
              component="textarea"
              id="businessDescription"
              className="form-input whitespace-pre-wrap"
              rows={8}
              style={{ height: "180px" }}
              tooltipContent="Business Description: Briefly outlines the functionality and utility of a product or service, avoiding promotional language."
            />
            {submitCount
              ? errors.businessDescription && (
                  <div className="mt-1 text-danger">
                    {errors.businessDescription}
                  </div>
                )
              : ""}

            <ToneSelector
              tooltipContent={
                "Tone: Sets the mood. Default is 'Inspirational'. Adjust according to the message's intended impact."
              }
              setFieldValue={setFieldValue}
              values={values}
              defaultTone={funnel?.settings?.tone}
              defaultAdditionalInfo={funnel?.settings?.toneAdditionalInfo}
            />
            <div>
              <RangeSlider
                label="Persuasiveness"
                name="aggressiveness"
                min={1}
                max={10}
                tooltipContent="Persuasiveness: Controls the intensity of the sales pitch. Default for most, decrease for conservative fields like banking."
                leftLabel="Low"
                rightLabel="High"
                gradient={true}
                showValue={false}
                value={values.aggressiveness}
                onChange={value => setFieldValue("aggressiveness", value)}
              />
            </div>
            <div>
              <RangeSlider
                label="Creativity"
                name="hookCreative"
                min={1}
                max={12}
                tooltipContent="Creativity: Standard setting fits most businesses. Decrease for industries where creativity is less appreciated."
                showValue={false}
                leftLabel="Low"
                rightLabel="High"
                gradient={true}
                value={values.hookCreative}
                onChange={value => setFieldValue("hookCreative", value)}
              />
            </div>

            <FieldWithLabel
              name="targetAudience"
              label="Target audience"
              component="textarea"
              tooltipContent={`Target Audience: Specify if known, such as "busy professionals" or "medical doctors", or leave default.`}
              id="targetAudience"
              className="form-input whitespace-pre-wrap"
              rows={1}
            />
            <button
              disabled={isLoading}
              type="submit"
              className="btn btn-primary !my-6 "
            >
              Save
            </button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default FunnelHooks;
