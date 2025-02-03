import { Field, FieldArray, Form, Formik, FormikProps } from "formik";
import { useRouter } from "next/router";
import React, { ChangeEvent, useEffect, useState } from "react";
import { FieldWithLabel } from "./FieldWithLabel";
import RangeSlider from "./RangeSlider";

import ToneSelector from "./ToneSelector";
import {
  useStartBenefitStackRequestMutation,
  useEndBenefitStackRequestMutation,
  useQueryBenefitStackRequestMutation,
} from "@/store/features/benefitStacksApi";

import { ThesisBuildingProgress } from "../ThesisBuildingProgress";
import * as Yup from "yup";
import { showErrorToast, showErrorToastTimer } from "@/utils/toast";
import { ToggleField } from "./ToggleField";

import "tippy.js/dist/tippy.css";
import { HookData } from "@/pages/apps/magic-hooks";

import { createFunnelApi } from "@/store/features/projectApi";
import Tippy from "@tippyjs/react";
import { useSelectiveLocalStorageForm } from "@/hooks/useLocalStorageForm";

import { languages } from "@/utils/data/Languages";
import useServerTokenTracking, {
  updateRatingsInLocalStorage,
} from "@/hooks/useServerTokenTracking";
import VisionSelector from "./VisionSelector";
import { ProcessBanner } from "../ProcessBanner";
import VisionImageUpload from "./VisionImageUpload";
import VisionWebsiteInput from "./VisionWebsiteInput";
import { ImageListType } from "react-images-uploading";
import {
  useEndImageRequestMutation,
  useEndUrlRequestMutation,
  useQueryImageRequestMutation,
  useQueryUrlRequestMutation,
  useStartImageRequestMutation,
  useStartUrlRequestMutation,
} from "@/store/features/marketingHooksApi";
import AnimateHeight from "react-animate-height";
import {
  useGetSpecifcAppsPojectAppNameQuery,
  useLoadDefaultAppsProjectQuery,
  useMigrateDataToAppsProjectMutation,
} from "@/store/features/appsProjectApi";
import useDataMigration from "@/hooks/useDataMigration";
import { useHandleFormServer } from "@/hooks/useHandleFormServer";

interface Generation {
  generationNumber: number;
  creations: string[];
}

interface Application {
  appName: string;
  generations: Generation[];
}

interface DefaultProjectData {
  _id: string;
  applications: Application[];
}

interface FormValues {
  businessDescription: string;
  tone: string;
  toneAdditionalInfo: string;
  aggressiveness: number;
  hookCreative: number;
  priceDrivenCheck: boolean;
  priceDriven: string;
  targetAudience: string;
  dimensionsOfNeed: Array<string>;
  instructions: string;
  hookLength: number;
  language: string;
}

const BenefitStackForm = ({
  hooksData,
  setHooksData,
  formatHookRatingData,
  setSubmissionData,
  hookRatingsId,
  setAppDataLoading,
  projectId,
}: {
  hooksData: HookData[];
  setHooksData: React.Dispatch<React.SetStateAction<HookData[]>>;
  setSubmissionData: React.Dispatch<React.SetStateAction<any>>;
  formatHookRatingData: () => string;
  hookRatingsId: { [key: string]: number };
  setAppDataLoading: React.Dispatch<React.SetStateAction<boolean>>;
  projectId: string;
}) => {
  const appName = "benefit-stack";
  const router = useRouter();
  const funnelId = router.query.funnelId as string;

  const { data: funnel } = createFunnelApi.useGetFunnelQuery(
    { funnelId },
    { skip: !funnelId }
  );

  const initialFormValues: FormValues = {
    businessDescription: "",
    tone: funnel?.settings?.tone || "",
    toneAdditionalInfo: funnel?.settings?.toneAdditionalInfo || "",
    aggressiveness: funnel?.settings?.aggressiveness || 8,
    hookCreative: funnel?.settings?.hookCreative || 10,
    targetAudience: funnel?.settings?.targetAudience || "everyone",
    priceDriven: "",
    priceDrivenCheck: false,
    dimensionsOfNeed: [""],
    instructions: "",
    hookLength: 7,
    language: "English",
  };

  const localStorageKeyShared = "sharedFormValues";
  const sharedFieldsToPersist: (keyof FormValues)[] = [
    "businessDescription",
    "aggressiveness",
    "hookCreative",
    "targetAudience",
    "language",
  ];
  const localStorageKeyForm = "benefitFormValues";
  const formFieldsToPersist: (keyof FormValues)[] = [
    "priceDrivenCheck",
    "priceDriven",
    "dimensionsOfNeed",
    "instructions",
    "hookLength",
    "tone",
    "toneAdditionalInfo",
  ];

  // const [formValues, setFormValues] =
  //     useSelectiveLocalStorageForm<FormValues>(
  //         initialFormValues,
  //         localStorageKeyShared,
  //         sharedFieldsToPersist,
  //         localStorageKeyForm,
  //         formFieldsToPersist
  //     );

  const { formValues, setFormValues, manuallyUpdateFormValues, isUpdating } =
    useHandleFormServer(
      projectId,
      appName,
      localStorageKeyForm,
      initialFormValues,
      sharedFieldsToPersist,
      formFieldsToPersist
    );
  const [priceDrivenCheck, setPriceDrivenCheck] = React.useState(false);
  const [instructionsCheck, setInstructionsCheck] = React.useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [selectedTab, setSelectedTab] = useState<string>("Text");
  const [businessDescriptionText, setBusinessDescriptionText] = useState(
    formValues.businessDescription
  );
  const [images, setImages] = useState<ImageListType>([]);
  const [visionIsLoading, setVisionIsLoading] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  // const [generationCount, setGenerationCount] = useState(0);

  let formikRef: { current: FormikProps<FormValues> | null } = {
    current: null,
  };
  const FormValidation = Yup.object().shape({
    businessDescription: Yup.string().required(
      "Please enter the business description"
    ),
    priceDriven: priceDrivenCheck
      ? Yup.string().required("Please enter the low price")
      : Yup.string().optional(),
  });

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  const [startBenefitRequest, { isLoading: isStarting }] =
    useStartBenefitStackRequestMutation();
  const [queryBenefitRequest] = useQueryBenefitStackRequestMutation();
  const [endBenefitRequest] = useEndBenefitStackRequestMutation();
  const [startImageRequest] = useStartImageRequestMutation();
  const [queryImageRequest] = useQueryImageRequestMutation();
  const [endImageRequest] = useEndImageRequestMutation();
  const [startUrlRequest] = useStartUrlRequestMutation();
  const [queryUrlRequest] = useQueryUrlRequestMutation();
  const [endUrlRequest] = useEndUrlRequestMutation();

  const {
    data: appData,
    refetch: refetchAppData,
    isLoading: isAppDataLoading,
  } = useGetSpecifcAppsPojectAppNameQuery(
    {
      projectId: projectId,

      appName: appName,
    },
    { skip: !projectId }
  );

  useEffect(() => {
    if (projectId) {
      refetchAppData();
    }
  }, [projectId]);

  const tokenKey = "benefitRequestToken";

  useEffect(() => {
    updateRatingsInLocalStorage(hookRatingsId, tokenKey);
  }, [hookRatingsId]);

  const handleEndResponse = (data: any) => {
    const response = data?.response;
    if (response) {
      refetchAppData();
    }
  };
  const handleEndImageResponse = (data: any) => {
    const responseText = data?.data.response;
    if (responseText) {
      try {
        const parsedText = JSON.parse(responseText);
        setBusinessDescriptionText(parsedText);

        formikRef.current?.setFieldValue("businessDescription", parsedText);
        const values = {
          ...formValues,
          businessDescription: parsedText,
        };
        setFormValues(values);
      } catch (error) {
        console.error("Error parsing response:", error);
      }
    }
  };

  const handleEndWebResponse = (data: any) => {
    const response = data?.data?.response;

    if (response && response.length > 0) {
      const text = response[0].text;
      setBusinessDescriptionText(text);
      setImages([]);
      formikRef.current?.setFieldValue("businessDescription", text);
      const values = { ...formValues, businessDescription: text };
      setFormValues(values);
    } else {
      showErrorToast("No data found for the provided URL.");
      setBusinessDescriptionText("");
      formikRef.current?.setFieldValue("businessDescription", "");
    }
  };

  useEffect(() => {
    if (formikRef.current) {
      formikRef.current.setFieldValue(
        "businessDescription",
        businessDescriptionText
      );
    }
  }, [businessDescriptionText, formikRef]);

  const { startAndTrack, isLoading, generationCount } = useServerTokenTracking({
    //@ts-ignore
    startRequest: startBenefitRequest,
    //@ts-ignore
    queryRequest: queryBenefitRequest,
    //@ts-ignore
    endRequest: endBenefitRequest,
    tokenKey: tokenKey,
    onEndResponse: handleEndResponse,
    projectId: projectId,
    appName: appName,
    appData: appData,
  });

  // useEffect(() => {
  //   const savedGenerations = JSON.parse(
  //     localStorage.getItem(`${tokenKey}Generations`) || "[]",
  //   ) as HookData[];

  //   const reversedGenerations = [...savedGenerations].sort(
  //     (a, b) => b.id - a.id,
  //   );

  //   setHooksData(reversedGenerations);
  // }, [tokenKey, isLoading]);

  useEffect(() => {
    if (formValues.priceDriven && formValues.priceDrivenCheck) {
      setPriceDrivenCheck(true);
    } else {
      setPriceDrivenCheck(false);
    }
    if (formValues.instructions) {
      setInstructionsCheck(true);
    } else {
      setInstructionsCheck(false);
    }

    setBusinessDescriptionText(formValues?.businessDescription);
  }, [formValues, isAppDataLoading]);

  const submitForm = async (values: FormValues) => {
    values.businessDescription === businessDescriptionText;
    setFormValues(values);
    manuallyUpdateFormValues(values);
    setRemainingTime(180);
    values.priceDrivenCheck = priceDrivenCheck;
    const dimensionsOfNeedString = values.dimensionsOfNeed.join(", ");

    const formattedRatingHooks = formatHookRatingData();
    const submissionData = {
      ...values,
      businessDescription: businessDescriptionText,
      dimensionsOfNeed: dimensionsOfNeedString,
      ratedHooks: formattedRatingHooks,
    };
    setSubmissionData(submissionData);
    await startAndTrack(submissionData);
  };

  useEffect(() => {
    if (!hooksData && isLoading) {
      const timer = setInterval(() => {
        if (remainingTime == 0) return;
        setRemainingTime(prevTime => prevTime - 1);
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [hooksData, isLoading]);

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
  const handleTabChange = (index: number) => {
    setSelectedTab(["Text", "Image", "Website"][index]);
  };

  const [active, setActive] = useState<string>(
    localStorage.getItem("activeState") || "0"
  );
  const togglePara = (value: string) => {
    setActive(oldValue => {
      return oldValue === value ? "" : value;
    });
  };
  useEffect(() => {
    localStorage.setItem("activeState", active);
  }, [active]);

  const { isMigrationNeeded, isMigrationSuccess } = useDataMigration(
    tokenKey,
    appName,
    true
  );

  useEffect(() => {
    if (isMigrationNeeded) {
      console.error("Data migration is needed.", isMigrationNeeded);
    }
  }, [isMigrationNeeded]);

  useEffect(() => {
    if (isMigrationSuccess) {
      refetchAppData();
    }
  }, [isMigrationSuccess, isMigrationNeeded]);

  useEffect(() => {
    setAppDataLoading(isAppDataLoading);
    const newGenerations = appData?.generations.map((gen: any) => {
      return {
        id: gen.generationNumber,
        hooks: gen.creations.map((hook: any) => {
          const output = {
            a: hook.output?.a,
            n: hook.output?.n,
            rating: hook.rating,
            id: hook._id,
          };
          return output;
        }),
      };
    });

    setHooksData(newGenerations || []);
  }, [appData, isAppDataLoading]);

  if (isAppDataLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <VisionSelector onTabChange={handleTabChange} />
      <Formik
        initialValues={formValues}
        enableReinitialize={true}
        innerRef={formikInstance => {
          formikRef.current = formikInstance;
          if (formikInstance?.errors && formikInstance.isSubmitting) {
            scrollToFirstError(formikInstance.errors);
          }
        }}
        validationSchema={FormValidation}
        onSubmit={submitForm}
      >
        {({ errors, submitCount, touched, values, setFieldValue }) => (
          <Form className="mt-5 space-y-5 text-white">
            {selectedTab === "Text" && (
              <>
                <div className="mt-4">
                  {visionIsLoading && <ProcessBanner />}
                  <FieldWithLabel
                    name="businessDescription"
                    label="Business Description"
                    component="textarea"
                    id="businessDescription"
                    value={businessDescriptionText}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      const newValue = e.target.value;
                      setBusinessDescriptionText(newValue);
                      formikRef.current?.setFieldValue(
                        "businessDescription",
                        newValue
                      );
                    }}
                    className="form-input  whitespace-pre-wrap"
                    rows={8}
                    style={{ height: "180px" }}
                    tooltipContent="Business Description: Briefly outlines the functionality and utility of a product or service, avoiding promotional language."
                  />
                </div>
              </>
            )}
            {selectedTab === "Image" && (
              <>
                <VisionImageUpload
                  startImageRequest={startImageRequest}
                  queryImageRequest={queryImageRequest as any}
                  endImageRequest={endImageRequest as any}
                  handleEndResponse={handleEndImageResponse}
                  images={images}
                  setImages={setImages}
                  isLoading={visionIsLoading}
                  setIsLoading={setVisionIsLoading}
                />
                {visionIsLoading && <ProcessBanner />}

                <FieldWithLabel
                  name="businessDescription"
                  label="Image Description"
                  value={businessDescriptionText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const newValue = e.target.value;
                    setBusinessDescriptionText(newValue);
                    formikRef.current?.setFieldValue(
                      "businessDescription",
                      newValue
                    );
                  }}
                  component="textarea"
                  id="businessDescription"
                  className="form-input whitespace-pre-wrap"
                  rows={8}
                  style={{ height: "180px" }}
                  tooltipContent="Business Description: Briefly outlines the functionality and utility of a product or service, avoiding promotional language."
                />
              </>
            )}
            {selectedTab === "Website" && (
              <>
                <VisionWebsiteInput
                  startWebRequest={startUrlRequest}
                  queryWebRequest={queryUrlRequest}
                  endWebRequest={endUrlRequest}
                  handleEndResponse={handleEndWebResponse}
                  isLoading={visionIsLoading}
                  setIsLoading={setVisionIsLoading}
                />
                {visionIsLoading && <ProcessBanner />}
                <FieldWithLabel
                  name="businessDescription"
                  label="Website Description"
                  component="textarea"
                  id="businessDescription"
                  className="form-input whitespace-pre-wrap"
                  value={businessDescriptionText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const newValue = e.target.value;
                    setBusinessDescriptionText(newValue);
                    formikRef.current?.setFieldValue(
                      "businessDescription",
                      newValue
                    );
                  }}
                  rows={8}
                  style={{ height: "180px" }}
                  tooltipContent="Business Description: Briefly outlines the functionality and utility of a product or service, avoiding promotional language."
                />
              </>
            )}
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
              defaultTone={funnel?.settings?.tone || formValues.tone}
              defaultAdditionalInfo={
                funnel?.settings?.toneAdditionalInfo ||
                formValues.toneAdditionalInfo
              }
            />

            <div className="mb-5">
              <div className="space-y-2 font-semibold">
                <div className="">
                  <button
                    type="button"
                    className={`flex w-full items-center justify-between rounded-xl p-4 text-white`}
                    onClick={() => togglePara("1")}
                  >
                    <div className="mr-5 flex-grow text-right">
                      Advanced Options
                    </div>
                    <div
                      className={`ltr:ml-auto rtl:mr-auto ${
                        active === "1" ? "animate-[spin_1s_ease-in-out]" : ""
                      }`}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M3.66122 10.6392C4.13377 10.9361 4.43782 11.4419 4.43782 11.9999C4.43781 12.558 4.13376 13.0638 3.66122 13.3607C3.33966 13.5627 3.13248 13.7242 2.98508 13.9163C2.66217 14.3372 2.51966 14.869 2.5889 15.3949C2.64082 15.7893 2.87379 16.1928 3.33973 16.9999C3.80568 17.8069 4.03865 18.2104 4.35426 18.4526C4.77508 18.7755 5.30694 18.918 5.83284 18.8488C6.07287 18.8172 6.31628 18.7185 6.65196 18.5411C7.14544 18.2803 7.73558 18.2699 8.21895 18.549C8.70227 18.8281 8.98827 19.3443 9.00912 19.902C9.02332 20.2815 9.05958 20.5417 9.15224 20.7654C9.35523 21.2554 9.74458 21.6448 10.2346 21.8478C10.6022 22 11.0681 22 12 22C12.9319 22 13.3978 22 13.7654 21.8478C14.2554 21.6448 14.6448 21.2554 14.8478 20.7654C14.9404 20.5417 14.9767 20.2815 14.9909 19.9021C15.0117 19.3443 15.2977 18.8281 15.7811 18.549C16.2644 18.27 16.8545 18.2804 17.3479 18.5412C17.6837 18.7186 17.9271 18.8173 18.1671 18.8489C18.693 18.9182 19.2249 18.7756 19.6457 18.4527C19.9613 18.2106 20.1943 17.807 20.6603 17C20.8677 16.6407 21.029 16.3614 21.1486 16.1272M20.3387 13.3608C19.8662 13.0639 19.5622 12.5581 19.5621 12.0001C19.5621 11.442 19.8662 10.9361 20.3387 10.6392C20.6603 10.4372 20.8674 10.2757 21.0148 10.0836C21.3377 9.66278 21.4802 9.13092 21.411 8.60502C21.3591 8.2106 21.1261 7.80708 20.6601 7.00005C20.1942 6.19301 19.9612 5.7895 19.6456 5.54732C19.2248 5.22441 18.6929 5.0819 18.167 5.15113C17.927 5.18274 17.6836 5.2814 17.3479 5.45883C16.8544 5.71964 16.2643 5.73004 15.781 5.45096C15.2977 5.1719 15.0117 4.6557 14.9909 4.09803C14.9767 3.71852 14.9404 3.45835 14.8478 3.23463C14.6448 2.74458 14.2554 2.35523 13.7654 2.15224C13.3978 2 12.9319 2 12 2C11.0681 2 10.6022 2 10.2346 2.15224C9.74458 2.35523 9.35523 2.74458 9.15224 3.23463C9.05958 3.45833 9.02332 3.71848 9.00912 4.09794C8.98826 4.65566 8.70225 5.17191 8.21891 5.45096C7.73557 5.73002 7.14548 5.71959 6.65205 5.4588C6.31633 5.28136 6.0729 5.18269 5.83285 5.15108C5.30695 5.08185 4.77509 5.22436 4.35427 5.54727C4.03866 5.78945 3.80569 6.19297 3.33974 7C3.13231 7.35929 2.97105 7.63859 2.85138 7.87273"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </button>
                  <AnimateHeight
                    duration={1000}
                    height={active === "1" ? "auto" : 0}
                  >
                    <div className="space-y-6">
                      <div className="mt-5">
                        <RangeSlider
                          label="Blurb Length"
                          name="hookLength"
                          min={1}
                          max={10}
                          showValue={false}
                          leftLabel="Very short"
                          rightLabel="Very long"
                          gradient={true}
                          value={values.hookLength}
                          tooltipContent="Length of the Blurb: Default length is suggested. Deviating significantly from this may affect the benefit's impact and clickability."
                          onChange={value => setFieldValue("hookLength", value)}
                        />
                      </div>
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
                          onChange={value =>
                            setFieldValue("aggressiveness", value)
                          }
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
                          onChange={value =>
                            setFieldValue("hookCreative", value)
                          }
                        />
                      </div>

                      <ToggleField
                        fieldId="priceDriven"
                        checkFieldId="priceDrivenCheck"
                        label="Is low price or cost saving one of the main benefits?"
                        isChecked={priceDrivenCheck}
                        onChange={e => setPriceDrivenCheck(e.target.checked)}
                        submitCount={submitCount}
                        errors={errors}
                        tooltipContent={`Explain how your product can help your customer save money`}
                      />

                      <FieldWithLabel
                        name="targetAudience"
                        label="Target audience"
                        component="textarea"
                        tooltipContent={`Target Audience: Specify if known, such as "busy professionals" or "medical doctors", or leave default.`}
                        id="targetAudience"
                        className="form-input whitespace-pre-wrap"
                        rows={1}
                      />

                      <Tippy
                        content={
                          "(Example: Saving Time, Saving Money, Self Expression etc. If left empty, the system will auto generate. The more you dimensionalize the needs for the customer, the more persuasive your benefit stack will become.)"
                        }
                        placement="top"
                      >
                        <label htmlFor={"dimensionsOfNeed"} className="w-fit">
                          What are some specific needs that your product
                          satisfies?
                        </label>
                      </Tippy>

                      <FieldArray
                        name="dimensionsOfNeed"
                        render={arrayHelpers =>
                          values?.dimensionsOfNeed?.map((need, index) => (
                            <div
                              key={index}
                              className="flex w-full items-center"
                            >
                              <Field
                                name={`dimensionsOfNeed.${index}`}
                                className="form-input h-full w-10/12"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  arrayHelpers.insert(index + 1, "")
                                }
                                className="mx-2 flex items-center justify-center rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => arrayHelpers.remove(index)}
                                  className="flex items-center justify-center rounded-full bg-red-500 p-2 px-2 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
                        }
                      />

                      <ToggleField
                        fieldId="instructions"
                        checkFieldId="instructionsCheck"
                        label="Any other instructions? (We recommend leaving empty)"
                        isChecked={instructionsCheck}
                        onChange={e => {
                          setInstructionsCheck(e.target.checked);
                          if (!e.target.checked) {
                            formikRef.current?.setFieldValue(
                              "instructions",
                              ""
                            );
                          }
                        }}
                        submitCount={submitCount}
                        errors={errors}
                      />

                      <div className="mb-4">
                        <Tippy
                          content={
                            "Experimental! Languages other than English may not work as well. Please let us know how they work for your language using the Contact Us form."
                          }
                          placement="top"
                        >
                          <label
                            htmlFor="language"
                            className="font-semibold text-white"
                          >
                            Language
                          </label>
                        </Tippy>
                        <Field
                          as="select"
                          name="language"
                          className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                            const selectedLanguage = e.target.value;
                            setFieldValue("language", selectedLanguage);
                          }}
                        >
                          {languages.map((language, index) => (
                            <option key={index} value={language.name}>
                              {language.name}
                            </option>
                          ))}
                        </Field>
                        {touched.language && errors.language ? (
                          <div className="mt-1 text-danger">
                            {errors.language}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </AnimateHeight>
                </div>
              </div>
            </div>

            {isLoading ? (
              <ThesisBuildingProgress
                minutes={minutes}
                seconds={seconds}
                progressCss={
                  "bg-primary h-4 rounded-full w-12/12 animated-progress"
                }
              />
            ) : (
              <button
                disabled={isLoading}
                type="submit"
                className="btn btn-primary !mt-6 w-full"
              >
                {hooksData && hooksData.length >= 1
                  ? "Create More Benefit Stacks"
                  : "Create Benefit Stacks"}
              </button>
            )}
          </Form>
        )}
      </Formik>
    </>
  );
};

export default BenefitStackForm;
