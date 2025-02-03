// BusinessDescFrom.tsx
import { Field, Form, Formik, FormikProps } from "formik";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import * as Yup from "yup";
import { Switch } from "@headlessui/react";
import {
  ComponentFieldWithLabel,
  FieldWithLabel,
} from "../marketingHooks/FieldWithLabel";
import RangeSlider from "../marketingHooks/RangeSlider";

import ToneSelector from "../marketingHooks/ToneSelector";
import {
  useStartMarketingRequestMutation,
  useEndMarketingRequestMutation,
  useQueryMarketingRequestMutation,
  useStartImageRequestMutation,
  useQueryImageRequestMutation,
  useEndImageRequestMutation,
  useStartUrlRequestMutation,
  useQueryUrlRequestMutation,
  useEndUrlRequestMutation,
  useStartSeoRequestMutation,
  useQuerySeoRequestMutation,
  useEndSeoRequestMutation,
  useStartProductRequestMutation,
  useQueryProductRequestMutation,
  useEndProductRequestMutation,
} from "@/store/features/marketingHooksApi";

import { ThesisBuildingProgress } from "../ThesisBuildingProgress";

import { showErrorToast, showErrorToastTimer } from "@/utils/toast";
import FormikCapsuleDropDown from "../marketingHooks/CapsuleDropDown";
import { ToggleField } from "../marketingHooks/ToggleField";

import { createFunnelApi } from "@/store/features/projectApi";
import {
  useLocalStorageForm,
  useSelectiveLocalStorageForm,
} from "@/hooks/useLocalStorageForm";

import { languages } from "@/utils/data/Languages";
import useServerTokenTracking, {
  updateRatingsInLocalStorage,
} from "@/hooks/useServerTokenTracking";
import VisionSelector from "../marketingHooks/VisionSelector";
import VisionImageUpload from "../marketingHooks/VisionImageUpload";
import VisionWebsiteInput from "../marketingHooks/VisionWebsiteInput";
import { ImageListType } from "react-images-uploading";
import { ProcessBanner } from "../ProcessBanner";
import AnimateHeight from "react-animate-height";
import { BusinessDescHookType } from "@/pages/apps/business-description";
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
  hookLength: number;
  valence: boolean;
  tone: string;
  toneAdditionalInfo: string;
  aggressiveness: number;
  hookCreative: number;
  priceDriven: string;
  priceDrivenCheck: boolean;
  targetAudience: string;
  goodHooks: string;
  goodHooksCheck: boolean;
  instructions: string;
  emoji: boolean;
  language: string;
  triggerWords: string;
  imageDescription: string;

  targeting: number;
}

const FormValidation = Yup.object().shape({
  businessDescription: Yup.string().required(
    "Please enter the business description"
  ),
});

const BusinessDescFrom = ({
  hooksData,
  setHooksData,
  hookRatingsId,
  appName,
  setAppDataLoading,
  projectId,
}: {
  hooksData: BusinessDescHookType[];
  setHooksData: React.Dispatch<React.SetStateAction<BusinessDescHookType[]>>;
  hookRatingsId: { [key: string]: number };
  appName: string;
  setAppDataLoading: React.Dispatch<React.SetStateAction<boolean>>;
  projectId: string;
}) => {
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
    hookLength: 4,
    targeting: 4,
    valence: false,
    priceDriven: "",
    priceDrivenCheck: false,
    goodHooks: "",
    goodHooksCheck: false,
    emoji: false,
    instructions: "",
    language: "English",
    triggerWords: "",
    imageDescription: "",
  };

  const localStorageKeyShared = "sharedFormValues";
  const sharedFieldsToPersist: (keyof FormValues)[] = [
    "businessDescription",
    "aggressiveness",
    "hookCreative",
    "targetAudience",
    "language",
  ];
  const localStorageKeyForm = "commerceFormValues";
  const formFieldsToPersist: (keyof FormValues)[] = [
    "hookLength",
    "valence",
    "priceDriven",
    "priceDrivenCheck",
    "goodHooks",
    "goodHooksCheck",
    "emoji",
    "instructions",
    "triggerWords",
    "tone",
    "toneAdditionalInfo",

    "targeting",
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
  const [goodHooksCheck, setGoodHooksCheck] = React.useState(false);
  const [instructionsCheck, setInstructionsCheck] = React.useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [selectedTab, setSelectedTab] = useState<string>("Website");
  const [businessDescriptionText, setBusinessDescriptionText] = useState(
    formValues.businessDescription
  );
  const [images, setImages] = useState<ImageListType>([]);
  const [visionIsLoading, setVisionIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [hookId, setHookId] = useState<string>("");
  const [generateSEO, setGenerateSEO] = useState<boolean>(true);

  let formikRef: { current: FormikProps<FormValues> | null } = {
    current: null,
  };

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  const [startMarketingRequest, { isLoading: isStarting }] =
    useStartMarketingRequestMutation();
  const [queryMarketingRequest] = useQueryMarketingRequestMutation();
  const [endMarketingRequest] = useEndMarketingRequestMutation();

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

  const [startSeo, { isLoading: isLoadingStartSeo }] =
    useStartSeoRequestMutation();
  const [querySeo] = useQuerySeoRequestMutation();
  const [endSeo] = useEndSeoRequestMutation();

  const [startProduct, { isLoading: isLoadingStartProduct }] =
    useStartProductRequestMutation();
  const [queryProduct] = useQueryProductRequestMutation();
  const [endProduct] = useEndProductRequestMutation();

  const tokenKey = "commerceJooksRequestToken";

  useEffect(() => {
    updateRatingsInLocalStorage(hookRatingsId, tokenKey);
  }, [hookRatingsId]);

  // const handleEndResponse = (data: any) => {
  //   const response = data?.response;
  //   if (response) {
  //     const newMagicHookData = {
  //       id: `magic-hook-${Date.now()}`,
  //       magicHook: {
  //         content: response.map((item: any) => item.h),
  //         isLoading: false,
  //       },

  //       seoTags: { content: [], isLoading: false },
  //       productDescription: { content: [], isLoading: false },
  //       benefitStack: { content: [], isLoading: false },
  //       faq: { content: [], isLoading: false },
  //     };
  //     setHooksData((prev) => [newMagicHookData, ...prev]);
  //   }
  // };

  const handleEndImageResponse = (data: any) => {
    const responseText = data?.data.response;
    const responseImage = data?.data.imgUrl;

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

    if (responseImage) {
      setImageUrl(responseImage);

      localStorage.setItem("savedCommerceImageUrl", responseImage);
    }
  };
  useEffect(() => {
    if (selectedTab === "Image") {
      const savedImageUrl = localStorage.getItem("savedCommerceImageUrl");

      if (savedImageUrl) {
        setImageUrl(savedImageUrl);
      }
    } else {
      setImageUrl(undefined);
    }
  }, [selectedTab]);

  useEffect(() => {
    if (formikRef.current) {
      formikRef.current.setFieldValue(
        "businessDescription",
        businessDescriptionText
      );
    }
  }, [businessDescriptionText, formikRef]);

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
  const updateHookData = (updatedHook: any) => {
    setHooksData(prevData => {
      const updatedData = prevData.map(hook => {
        if (hook.id === updatedHook.id) {
          return { ...hook, ...updatedHook };
        }
        return hook;
      });

      return updatedData;
    });

    const localStorageData = JSON.parse(
      localStorage.getItem("businessDescHookData") || "[]"
    );
    const updatedLocalStorageData = localStorageData.map((hook: any) => {
      if (hook.id === updatedHook.id) {
        return { ...hook, ...updatedHook };
      }
      return hook;
    });

    localStorage.setItem(
      "businessDescHookData",
      JSON.stringify(updatedLocalStorageData)
    );
  };

  // const handleEndResponseMagic = (data: any) => {
  //   const response = data?.response;
  //   if (response) {
  //     const correlationId = response[0]?.input?.correlationId;
  //     const updatedHookData: Partial<BusinessDescHookType> = {
  //       id: correlationId,
  //       magicHook: {
  //         content: response.map((item: any) => item.h),
  //         isLoading: false,
  //       },
  //     };
  //     updateHookData(updatedHookData);
  //   }
  // };

  // const handleEndResponseMagic = (data: any) => {
  //   const response = data?.response;
  //   console.log(response, "response");
  //   if (response) {
  //     refetchAppData();
  //   }
  // };

  // const handleEndResponseSeo = (data: any) => {
  //   const response = data?.response;
  //   if (response) {
  //     const correlationId = response[0]?.input?.correlationId;
  //     const updatedHookData: Partial<BusinessDescHookType> = {
  //       id: correlationId,
  //       seoTags: {
  //         content: response.map((item: any) => item.tag),
  //         isLoading: false,
  //       },
  //     };
  //     updateHookData(updatedHookData);

  //     const submissionDataProduct = {
  //       ...formValues,
  //       seoTags: response.map((item: any) => item.tag),
  //       n: 1,
  //       correlationId: correlationId,
  //       type: "business",
  //     };
  //     startAndTrackProduct(submissionDataProduct);
  //   }
  // };

  // const handleEndResponseProduct = (data: any) => {
  //   const response = data?.response;
  //   if (response) {
  //     const correlationId = response[0]?.input?.correlationId;
  //     const updatedHookData: Partial<BusinessDescHookType> = {
  //       id: correlationId,
  //       productDescription: {
  //         content: response.map((item: any) => item.product),
  //         isLoading: false,
  //       },
  //     };
  //     updateHookData(updatedHookData);
  //   }
  // };

  const handleEndResponseMagic = (data: any) => {
    const response = data?.response;
    if (response) {
      const correlationId = response[0]?.input?.correlationId;
      const updatedHookData: Partial<BusinessDescHookType> = {
        id: correlationId,
        magicHook: {
          content: response.map((item: any) => ({
            id: item.id,
            h: item.h,
          })),
          isLoading: false,
        },
      };
      updateHookData(updatedHookData);
    }
  };

  const handleEndResponseSeo = (data: any) => {
    const response = data?.response;
    if (response) {
      const correlationId = response[0]?.input?.correlationId;
      const updatedHookData: Partial<BusinessDescHookType> = {
        id: correlationId,
        seoTags: {
          content: response.map((item: any) => ({
            id: item.id,
            tag: item.tag,
          })),
          isLoading: false,
        },
      };
      updateHookData(updatedHookData);

      const submissionDataProduct = {
        ...formValues,
        seoTags: response.map((item: any) => item.tag),
        n: 1,
        correlationId: correlationId,
        type: "business",
      };
      startAndTrackProduct(submissionDataProduct);
    }
  };

  const handleEndResponseProduct = (data: any) => {
    const response = data?.response;
    if (response) {
      const correlationId = response[0]?.input?.correlationId;
      const updatedHookData: Partial<BusinessDescHookType> = {
        id: correlationId,
        productDescription: {
          content: response.map((item: any) => ({
            id: item.id,
            product: item.product,
          })),
          isLoading: false,
        },
      };
      updateHookData(updatedHookData);
    }
  };

  // const handleEndResponseProductPlacement = (data: any) => {
  //   const response = data?.response;
  //   if (response) {
  //     const correlationId = response[0]?.input?.correlationId;
  //     const updatedHookData: Partial<BusinessDescHookType> = {
  //       id: correlationId,
  //       image: {
  //         content: response && response[0]?.url,
  //         input: response && response[0]?.input?.prompt,
  //         originUrl: imageUrl,
  //         isLoading: false,
  //       },
  //     };
  //     updateHookData(updatedHookData);
  //   }
  // };
  // const { startAndTrack, isLoading, generationCount } = useServerTokenTracking({
  //   //@ts-ignore
  //   startRequest: startMarketingRequest,
  //   //@ts-ignore
  //   queryRequest: queryMarketingRequest,
  //   //@ts-ignore
  //   endRequest: endMarketingRequest,
  //   tokenKey: tokenKey,
  //   onEndResponse: handleEndResponse,
  //   geneationType: false,
  // });

  const {
    startAndTrack: startAndTrackMagic,
    isLoading: isLoadingMagic,
    generationCount: generationCountMagic,
  } = useServerTokenTracking({
    startRequest: startMarketingRequest as any,
    queryRequest: queryMarketingRequest as any,
    endRequest: endMarketingRequest as any,
    tokenKey: "commerceMagicHookToken",
    onEndResponse: handleEndResponseMagic,
    geneationType: false,
    projectId: projectId,
    appName: appName,
    appData: appData,
    isContentItems: true,
  });

  const {
    startAndTrack: startAndTrackSeo,
    isLoading: isLoadingSeo,
    generationCount: generationCountSeo,
  } = useServerTokenTracking({
    startRequest: startSeo as any,
    queryRequest: querySeo as any,
    endRequest: endSeo as any,
    tokenKey: "seoToken", // Unique token key for SEO requests
    onEndResponse: handleEndResponseSeo,
    geneationType: false,
    projectId: projectId,
    appName: appName,
    appData: appData,
    isContentItems: true,
  });

  const {
    startAndTrack: startAndTrackProduct,
    isLoading: isLoadingProduct,
    generationCount: generationCountProduct,
  } = useServerTokenTracking({
    startRequest: startProduct as any,
    queryRequest: queryProduct as any,
    endRequest: endProduct as any,
    tokenKey: "productToken",
    onEndResponse: handleEndResponseProduct,
    geneationType: false,
    projectId: projectId,
    appName: appName,
    appData: appData,
    isContentItems: true,
  });

  const generateNewHookId = () => {
    return `hook-${Date.now()}`;
  };

  const determineCurrentHookId = () => {
    const newHookId = generateNewHookId();
    setHookId(newHookId);

    setHooksData(prev => [
      {
        id: newHookId,
        contentItemsId: "",
        image: {
          content: imageUrl as string,
          isLoading: false,
        },
        magicHook: { content: [], isLoading: true },
        seoTags: { content: [], isLoading: true },
        productDescription: {
          content: [],
          isLoading: true,
        },
        benefitStack: { content: [], isLoading: true },
        faq: { content: [], isLoading: true },
      },
      ...prev,
    ]);

    return newHookId;
  };

  const submitForm = async (values: FormValues) => {
    values.businessDescription = businessDescriptionText;
    initialFormValues.triggerWords = values.triggerWords;
    setFormValues(values);
    manuallyUpdateFormValues(values);
    setRemainingTime(180);
    values.priceDrivenCheck = priceDrivenCheck;
    values.goodHooksCheck = goodHooksCheck;
    const currentHookId = determineCurrentHookId();

    const submissionDataMagic = {
      ...values,
      n: 10,
      type: "business",
      correlationId: currentHookId,
      valence: false,
      hookLength: 5,
    };

    const submissionDataSEO = {
      ...values,
      n: 10,
      type: "business",
      correlationId: currentHookId,
    };
    const submissionDataProduct = {
      ...values,
      n: 1,
      type: "business",
      correlationId: currentHookId,
    };

    setHookId(currentHookId);
    await startAndTrackMagic(submissionDataMagic);

    if (generateSEO) {
      await startAndTrackSeo(submissionDataSEO);
    } else {
      const updatedHookData: Partial<BusinessDescHookType> = {
        id: currentHookId,
        seoTags: {
          content: [],
          isLoading: false,
        },
      };
      updateHookData(updatedHookData);

      await startAndTrackProduct(submissionDataProduct);
    }

    // if (values.imagePlacement && imageUrl) {
    //   const submissionDataProductPlacement = {
    //     ...values,
    //     n: 1,
    //     correlationId: currentHookId,
    //     url: imageUrl,
    //     prompt: values.imagePlacement,
    //   };

    //   const updatedHookData: Partial<BusinessDescHookType> = {
    //     id: currentHookId,
    //     image: {
    //       content: imageUrl,
    //       originUrl: imageUrl,
    //       isLoading: true,
    //     },
    //   };

    //   updateHookData(updatedHookData);
    //   // await startAndTrackProductPlacement(submissionDataProductPlacement);
    // }
    // await startAndTrackFAQ(submissionDataFAQ);
    // await startAndTrack(submissionData);
  };

  useEffect(() => {
    if (formValues.goodHooks && formValues.goodHooksCheck) {
      setGoodHooksCheck(true);
    } else {
      setGoodHooksCheck(false);
    }
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
  }, [formValues]);

  const convertToBoolean = (value: boolean | "yes" | "no"): boolean => {
    if (value === "yes") return true;
    if (value === "no") return false;
    return value;
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
    "businessDescHookData",
    appName,
    false,
    false,
    true
  );

  useEffect(() => {
    if (isMigrationNeeded) {
      console.error("Data migration is needed.", isMigrationNeeded);
    }
  }, []);

  useEffect(() => {
    if (isMigrationSuccess) {
      refetchAppData();
    }
  }, [isMigrationSuccess, isMigrationNeeded]);

  useEffect(() => {
    setAppDataLoading(isAppDataLoading);
    const newGenerations = appData?.generations.map((gen: any) => {
      const hookData = {
        id: gen.generationNumber.toString(),
        contentItemsId: gen.contentItemsId._id,
        magicHook: { content: [], isLoading: false },
        seoTags: { content: [], isLoading: false },
        productDescription: { content: [], isLoading: false },
        rating: gen.contentItemsId.rating,
      };

      gen.contentItems.forEach((item: any) => {
        const content = item.contentId.map(
          (cid: any) => cid.output.h || cid.output.tag || cid.output.product
        );
        switch (item.name) {
          case "magicHook":
            hookData.magicHook.content = content;
            break;
          case "seoTags":
            hookData.seoTags.content = content;
            break;
          case "productDescription":
            hookData.productDescription.content = content;
            break;
          default:
            break;
        }
      });

      return hookData;
    });

    setHooksData(newGenerations || []);
  }, [appData, isAppDataLoading]);

  if (isAppDataLoading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <VisionSelector onTabChange={handleTabChange} defaultTabIndex={2} />
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
          <Form className="space-y-5 text-white">
            {selectedTab === "Text" && (
              <>
                <div className="mt-4">
                  {visionIsLoading && <ProcessBanner />}
                  <FieldWithLabel
                    name="businessDescription"
                    label="Product Description"
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
                    tooltipContent="Briefly outlines the functionality and utility of a product or service, avoiding promotional language."
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
                  imageUrl={imageUrl}
                />
                {visionIsLoading && <ProcessBanner />}

                <FieldWithLabel
                  name="businessDescription"
                  label="Product Description"
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
                  tooltipContent="Briefly outlines the functionality and utility of a product or service, avoiding promotional language."
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
                  tooltipContent="Briefly outlines the functionality and utility of a product or service, avoiding promotional language."
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

            {/* <FieldWithLabel
              name="imagePlacement"
              label="Product Placement (optional)"
              component="textarea"
              tooltipContent={`If you uploaded a product image, describe where you would like to see your product (e.g. at a beach, in a kitchen, etc.)`}
              id="imagePlacement"
              className="form-input whitespace-pre-wrap"
              rows={2}
            /> */}

            <div>
              <Tippy
                content={
                  "Choose whether you want to generate SEO tags for your product or service"
                }
                placement="top"
              >
                <label htmlFor="seo" className="w-fit font-semibold text-white">
                  Auto SEO?
                </label>
              </Tippy>

              <div className="inline-flex items-center">
                <span className="mr-2">No</span>
                <Switch
                  name="generateSEO"
                  checked={generateSEO}
                  onChange={() => setGenerateSEO(!generateSEO)}
                  className={`${
                    generateSEO ? "bg-blue-600" : "bg-gray-500"
                  } relative my-2 inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span className="sr-only">SEO</span>
                  <span
                    className={`${
                      generateSEO ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
                <span className="ml-2">Yes</span>
              </div>
            </div>

            <div>
              <RangeSlider
                label="Long Tail Keyword Targeting"
                name="targeting"
                min={2}
                max={5}
                showValue={false}
                leftLabel="short"
                rightLabel="long"
                gradient={true}
                value={values.targeting}
                tooltipContent="Low authority domains may want to use longer tags, which will increase the ability to optimise for those tags. High authority domains will generally benefit from shorter tags"
                onChange={value => setFieldValue("targeting", value)}
              />
            </div>

            <div className="mb-4">
              <Tippy
                content={
                  "Experimental! Languages other than English may not work as well. Please let us know how they work for your language using the Contact Us form."
                }
                placement="top"
              >
                <label htmlFor="language" className="font-semibold text-white">
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
                <div className="mt-1 text-danger">{errors.language}</div>
              ) : null}
            </div>

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

                      <div className="mt-5">
                        <RangeSlider
                          label="Length"
                          name="hookLength"
                          min={4}
                          max={6}
                          showValue={false}
                          leftLabel="Very short"
                          rightLabel="Very long"
                          gradient={true}
                          value={values.hookLength}
                          tooltipContent="Length of the Hook: Default length is suggested. Deviating significantly from this may affect the hook's impact and clickability."
                          onChange={value => setFieldValue("hookLength", value)}
                        />
                      </div>

                      {/* <div
                        className={
                          touched.valence
                            ? errors.valence
                              ? "has-error"
                              : "has-success"
                            : ""
                        }
                      >
                        <Tippy
                          content={
                            "Valence: Choose between positive language or a negative-to-positive approach. Negative valence highlights a pain point before presenting a solution."
                          }
                          placement="top"
                        >
                          <label
                            htmlFor="valence"
                            className="w-fit font-semibold text-white"
                          >
                            Valence
                          </label>
                        </Tippy>
                        <div className="inline-flex items-center">
                          <span className="mr-2">Positive</span>
                          <Switch
                            name="valence"
                            checked={convertToBoolean(values.valence)}
                            onChange={() =>
                              setFieldValue(
                                "valence",
                                convertToBoolean(!values.valence),
                              )
                            }
                            className={`${
                              convertToBoolean(values.valence)
                                ? "bg-blue-600"
                                : "bg-gray-500"
                            } relative my-2 inline-flex h-6 w-11 items-center rounded-full`}
                          >
                            <span className="sr-only">Valence</span>
                            <span
                              className={`${
                                convertToBoolean(values.valence)
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                            />
                          </Switch>
                          <span className="ml-2">Negative</span>
                        </div>
                        {touched.valence && errors.valence ? (
                          <div className="mt-1 text-danger">
                            {errors.valence}
                          </div>
                        ) : null}
                      </div> */}

                      <ToneSelector
                        tooltipContent={
                          "Tone: Sets the hook's mood. Default is 'Inspirational'. Adjust according to the message's intended impact."
                        }
                        setFieldValue={setFieldValue}
                        values={values}
                        defaultTone={funnel?.settings?.tone || formValues.tone}
                        defaultAdditionalInfo={
                          funnel?.settings?.toneAdditionalInfo ||
                          formValues.toneAdditionalInfo
                        }
                      />

                      <ToggleField
                        fieldId="priceDriven"
                        checkFieldId="priceDrivenCheck"
                        label="Is this a price-driven hook?"
                        isChecked={priceDrivenCheck}
                        onChange={e => setPriceDrivenCheck(e.target.checked)}
                        submitCount={submitCount}
                        errors={errors}
                        tooltipContent={`Price: Toggle this for promotional pricing. Enter the special price and deadline (e.g., "Only $19.95 until next Friday").`}
                      />

                      <div
                        className={
                          touched.emoji
                            ? errors.emoji
                              ? "has-error"
                              : "has-success"
                            : ""
                        }
                      >
                        <label
                          htmlFor="emoji"
                          className="font-semibold text-white"
                        >
                          Use emoji in hooks?
                        </label>

                        <div className="inline-flex items-center">
                          <span className="mr-2">No</span>
                          <Switch
                            name="emoji"
                            checked={convertToBoolean(values.emoji)}
                            onChange={() =>
                              setFieldValue(
                                "emoji",
                                convertToBoolean(!values.emoji)
                              )
                            }
                            className={`${
                              convertToBoolean(values.emoji)
                                ? "bg-blue-600"
                                : "bg-gray-500"
                            } relative my-2 inline-flex h-6 w-11 items-center rounded-full`}
                          >
                            <span className="sr-only">Use emoji in hooks?</span>
                            <span
                              className={`${
                                convertToBoolean(values.emoji)
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                            />
                          </Switch>
                          <span className="ml-2">Yes</span>
                        </div>
                        {touched.emoji && errors.emoji ? (
                          <div className="mt-1 text-danger">{errors.emoji}</div>
                        ) : null}
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

                      <ToggleField
                        fieldId="goodHooks"
                        checkFieldId="goodHooksCheck"
                        label="Do you have some example good hooks you’ve thought of?"
                        isChecked={goodHooksCheck}
                        onChange={e => {
                          setGoodHooksCheck(e.target.checked);
                          if (!e.target.checked) {
                            formikRef.current?.setFieldValue("goodHooks", "");
                          }
                        }}
                        submitCount={submitCount}
                        errors={errors}
                      />

                      <ComponentFieldWithLabel
                        name="triggerWords"
                        label="Do you have any recommended trigger words that you want to use in your hook? (Optional)"
                        tooltipContent={`Trigger Words: You can leave blank, or use words like "Free", "You", "Your", "Instantly" that can boost engagement. Enter preferred words; the system will prioritize but not force them. Leave blank if not sure.`}
                        component={FormikCapsuleDropDown}
                        id="triggerWords"
                        suggestions={[
                          "Easy",
                          "Effortlessly",
                          "Every Time",
                          "First",
                          "Free",
                          "Instant",
                          "Instantly",
                          "Lucky",
                          "Money",
                          "Never",
                          "Quick",
                          "Secret",
                          "You",
                        ]}
                        defaultValue={formValues.triggerWords}
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
                    </div>
                  </AnimateHeight>
                </div>
              </div>
            </div>

            {isLoadingSeo ? (
              <ThesisBuildingProgress
                minutes={minutes}
                seconds={seconds}
                progressCss={
                  "bg-primary h-4 rounded-full w-12/12 animated-progress"
                }
              />
            ) : (
              <button
                disabled={isLoadingSeo || visionIsLoading}
                type="submit"
                className="btn btn-primary !mt-6 w-full"
              >
                {hooksData && hooksData.length >= 1
                  ? "Create Another SEO Optimized Intro"
                  : "Create SEO Optimized Intro"}
              </button>
            )}
          </Form>
        )}
      </Formik>
    </>
  );
};

export default BusinessDescFrom;
