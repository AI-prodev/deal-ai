import React, { ChangeEvent, useEffect, useState, useRef } from "react";
import { ImageListType } from "react-images-uploading";
import { Field, Formik, Form, FormikProps } from "formik";
import { isEmpty, values } from "lodash";
import * as Yup from "yup";
import Modal from "@/components/Modal";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { randomString } from "@/helpers/random";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { IProject } from "@/interfaces/IProject";
import useServerTokenTrackingAiFunnel from "@/hooks/useServerTokenTrackingAiFunnel";
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
  useStartProductRequestMutation,
  useQueryProductRequestMutation,
  useEndProductRequestMutation,
} from "@/store/features/marketingHooksApi";
import {
  useEndBenefitStackRequestMutation,
  useQueryBenefitStackRequestMutation,
  useStartBenefitStackRequestMutation,
} from "@/store/features/benefitStacksApi";
import {
  useEndBonusStackRequestMutation,
  useQueryBonusStackRequestMutation,
  useStartBonusStackRequestMutation,
  useEndFaqRequestMutation,
  useQueryFaqRequestMutation,
  useStartFaqRequestMutation,
} from "@/store/features/bonusAndFaqApi";
import {
  useStartHeroRequestMutation,
  useEndHeroRequestMutation,
  useQueryHeroRequestMutation,
} from "@/store/features/heroApi";
import { createFunnelApi } from "@/store/features/projectApi";
import { createPageApi } from "@/store/features/pageApi";
import { AI_STEP_TEMPLATES } from "@/utils/data/FunnelStepTemplates";
import { ctaData } from "@/utils/data/Languages";

import VisionSelector from "../marketingHooks/VisionSelector";
import VisionImageUpload from "../marketingHooks/VisionImageUpload";
import { FieldWithLabel } from "../marketingHooks/FieldWithLabel";
import VisionWebsiteInput from "../marketingHooks/VisionWebsiteInput";
import { ProcessBanner } from "../ProcessBanner";
import Link from "next/link";
import { PlusSVG, EyeSVG } from "@/components/icons/SVGData";
import LoadingAnimation from "../LoadingAnimation";

interface NewFunnelModalProps {
  project: IProject | null;
  isOpen: boolean;
  onRequestClose: () => void;
  onFunnelCreated: (url: string) => void;
}

const validationSchema = Yup.object().shape({
  projectId: Yup.string().required("Project ID is required"),
  businessName: Yup.string().required("Name is required"),
  businessDescription: Yup.string().required("Description is required"),
  cta: Yup.string().required("CTA is required"),
  businessLogoUrl: Yup.string(),
  businessEmail: Yup.string().email("Invalid email"),
  busniessPhoneNumber: Yup.number().positive(
    "businessPhoneNumber must be positive"
  ),
});

type FormProps = {
  projectId: string;
  businessName: string;
  businessDescription: string;
  cta: string;
  businessLogoUrl: string;
  businessPhoneNumber: string;
  businessEmail: string;
};

const NewFunnelAIModal: React.FC<NewFunnelModalProps> = ({
  project,
  isOpen,
  onRequestClose,
  onFunnelCreated,
}) => {
  const [hooksData, setHooksData] = useState<any>({});
  const [selectedTab, setSelectedTab] = useState<"Text" | "Image" | "Website">(
    "Text"
  );
  const [images, setImages] = useState<ImageListType>([]);
  const [visionIsLoading, setVisionIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [step, setStep] = useState(1);
  const [logoImages, setLogoImages] = useState<ImageListType>([]);
  const [showTemplateOptions, setShowTemplateOptions] = useState(-1);
  const [funnelId, setFunnelId] = useState("");

  const formikRef = useRef<FormikProps<FormProps>>(null);

  const [startMarketingRequest] = useStartMarketingRequestMutation();
  const [queryMarketingRequest] = useQueryMarketingRequestMutation();
  const [endMarketingRequest] = useEndMarketingRequestMutation();

  const [startBenefitRequest] = useStartBenefitStackRequestMutation();
  const [queryBenefitRequest] = useQueryBenefitStackRequestMutation();
  const [endBenefitRequest] = useEndBenefitStackRequestMutation();

  const [startFaqRequest] = useStartFaqRequestMutation();
  const [queryFaqRequest] = useQueryFaqRequestMutation();
  const [endFaqRequest] = useEndFaqRequestMutation();

  const [startBonusRequest] = useStartBonusStackRequestMutation();
  const [queryBonusRequest] = useQueryBonusStackRequestMutation();
  const [endBonusRequest] = useEndBonusStackRequestMutation();

  const [startHeroRequest] = useStartHeroRequestMutation();
  const [queryHeroRequest] = useQueryHeroRequestMutation();
  const [endHeroRequest] = useEndHeroRequestMutation();

  const [startImageRequest] = useStartImageRequestMutation();
  const [queryImageRequest] = useQueryImageRequestMutation();
  const [endImageRequest] = useEndImageRequestMutation();
  const [startUrlRequest] = useStartUrlRequestMutation();
  const [queryUrlRequest] = useQueryUrlRequestMutation();
  const [endUrlRequest] = useEndUrlRequestMutation();

  const [startProduct, { isLoading: isLoadingStartProduct }] =
    useStartProductRequestMutation();
  const [queryProduct] = useQueryProductRequestMutation();
  const [endProduct] = useEndProductRequestMutation();

  const [createFunnelWithAI] = createFunnelApi.useCreateFunnelWithAIMutation();

  const [startPageRequest] = createPageApi.useStartPageRequestMutation();
  const [queryPageRequest] = createPageApi.useQueryPageRequestMutation();
  const [endPageRequest] = createPageApi.useEndPageRequestMutation();

  const handleEndResponseMagic = async (data: any) => {
    const response = data?.response;
    if (response) {
      if (hooksData.magic.pos) {
        if (response.length > 0) {
          setHooksData((prev: any) => ({
            ...prev,
            magic: [
              ...hooksData.magic.pos,
              ...response.map((item: any) => item.h),
            ],
          }));
        } else {
          setHooksData((prev: any) => ({
            ...prev,
            magic: [...hooksData.magic.pos],
          }));
        }
      } else {
        setHooksData((prev: any) => ({
          ...prev,
          magic: {
            isLoading: true,
            pos: response.map((item: any) => item.h),
          },
        }));

        const currentHookId = `hook-${Date.now()}`;
        const submissionDataMagic = {
          ...hooksData.input,
          n: 1,
          valence: false,
          correlationId: currentHookId,
          language: "English",
        };
        await startAndTrackMagic(submissionDataMagic);
      }
    }
  };

  const handleEndResponseSeoMagic = async (data: any) => {
    const response = data?.response;
    const currentHookId = `hook-${Date.now()}`;

    if (response) {
      setHooksData((prev: any) => ({
        ...prev,
        businessDesc: {
          isLoading: true,
          title: response[0]?.h,
        },
      }));

      const submissionDataProduct = {
        ...hooksData.input,
        n: 1,
        type: "business",
        language: "English",
        aggressiveness: 8,
        targetAudience: "everyone",
        tone: "Inspirational",
        correlationId: currentHookId,
      };
      await startAndTrackProduct(submissionDataProduct);
    }
  };

  const handleEndResponseBenefit = (data: any, submissionData: any) => {
    const response = data?.response;
    if (response) {
      setHooksData((prev: any) => ({
        ...prev,
        benefitStack: response.map((item: any) => ({
          n: item.n,
          a: item.a,
        })),
      }));

      const benefitStack = response
        .map((hook: any) => `${hook.n} - ${hook.a}`)
        .join("\n");

      const submissionDataFAQ = {
        ...submissionData,
        n: 10,
        benefitStack,
      };
      startAndTrackFAQ(submissionDataFAQ);

      const submissionDataBonus = {
        ...submissionData,
        benefitStack,
        // ratedHooks: formattedRatingHooks,
      };
      startAndTrackBonus(submissionDataBonus);
    }
  };

  const handleEndResponseFAQ = (data: any) => {
    const response = data?.response;
    if (response) {
      setHooksData((prev: any) => ({
        ...prev,
        faq: response.map((item: any) => ({ q: item.q, a: item.a })),
      }));
    }
  };

  const handleEndResponseHeroImage = async (data: any) => {
    let submissionDataHero = {
      ...hooksData.input,
      heroDescription: hooksData.input.businessDescription,
      language: "English",
      aspectRatio: "Square (Stories / Reel)",
      isolation: "None",
      imageType: "None",
      imageStyle: "None",
      impacts: [
        { "Color Palette": true },
        { Lighting: true },
        { Composition: true },
        { "Perspective and Angle": true },
        { "Facial Expressions and Body Language": true },
        { "Textures and Patterns": true },
        { Symbolism: true },
        { "Contrast and Saturation": true },
        { "Context and Setting": true },
        { "Narrative Elements": true },
      ],
    };

    const response = data?.response;

    if (response) {
      const template = hooksData.input.template;
      const imagesLength = template.images.length + template.images2.length; // 4 = 3 + 1
      if (hooksData.hero.heroImages) {
        const templateImagesLen = template.images.length;
        const heroImagesLen = hooksData.hero.heroImages.length;

        if (heroImagesLen < imagesLength - 1) {
          if (heroImagesLen < templateImagesLen - 1) {
            submissionDataHero.isolation =
              template.images[heroImagesLen]?.isolationMode || "None";
            submissionDataHero.imageType =
              template.images[heroImagesLen]?.type || "None";
            submissionDataHero.imageStyle =
              template.images[heroImagesLen]?.style || "None";
          } else {
            submissionDataHero.isolation =
              template.images2[templateImagesLen - 1 - heroImagesLen]
                ?.isolationMode || "None";
            submissionDataHero.imageType =
              template.images2[templateImagesLen - 1 - heroImagesLen]?.type ||
              "None";
            submissionDataHero.imageStyle =
              template.images2[templateImagesLen - 1 - heroImagesLen]?.style ||
              "None";
          }
          setHooksData((prev: any) => ({
            ...prev,
            hero: {
              isLoading: true,
              heroImages: [...hooksData.hero.heroImages, response[0]],
            },
          }));

          await startAndTrackHeroImage(submissionDataHero);
        } else {
          setHooksData((prev: any) => ({
            ...prev,
            hero: [...hooksData.hero.heroImages, response[0]],
          }));
        }
      } else {
        if (imagesLength > 1) {
          setHooksData((prev: any) => ({
            ...prev,
            hero: {
              isLoading: true,
              heroImages: [response[0]],
            },
          }));

          if (template.images.length > 1) {
            submissionDataHero.isolation =
              template.images[1]?.isolationMode || "None";
            submissionDataHero.imageType = template.images[1]?.type || "None";
            submissionDataHero.imageStyle = template.images[1]?.style || "None";
          } else {
            submissionDataHero.isolation =
              template.images2[0]?.isolationMode || "None";
            submissionDataHero.imageType = template.images2[0]?.type || "None";
            submissionDataHero.imageStyle =
              template.images2[0]?.style || "None";
          }

          await startAndTrackHeroImage(submissionDataHero);
        } else {
          setHooksData((prev: any) => ({
            ...prev,
            hero: [response[0]],
          }));
        }
      }
    }
  };

  const handleEndResponseBonus = (data: any) => {
    const response = data?.response;
    if (response) {
      setHooksData((prev: any) => ({
        ...prev,
        bonus: response.map((hook: any) => ({ b: hook.b, r: hook.r })),
      }));
    }
  };

  const handleEndImageResponse = (data: any) => {
    const responseText = data?.data.response;
    if (responseText) {
      try {
        const parsedText = JSON.parse(responseText);
        formikRef.current?.setFieldValue("businessDescription", parsedText);
      } catch (error) {
        console.error("Error parsing response:", error);
      }
    }
  };

  const handleEndWebResponse = (data: any) => {
    const response = data?.data?.response;

    if (response && response.length > 0) {
      const text = response[0].text;
      setImages([]);
      formikRef.current?.setFieldValue("businessDescription", text);
    } else {
      showErrorToast("No data found for the provided URL.");
      formikRef.current?.setFieldValue("businessDescription", "");
    }
  };

  const handleEndLogoImageResponse = (data: any) => {
    const imgUrlObj = data?.data;
    if (imgUrlObj) {
      try {
        formikRef.current?.setFieldValue("businessLogoUrl", imgUrlObj?.imgUrl);
      } catch (error) {
        console.error("Error parsing response:", error);
      }
    }
  };

  const handleEndResponseProduct = (data: any) => {
    const response = data?.response;
    if (response) {
      setHooksData((prev: any) => ({
        ...prev,
        businessDesc: [hooksData.businessDesc.title, response[0]?.product],
      }));
    }
  };

  const handleEndResponsePage = (data: any) => {
    const response = data.response;
    if (response) {
      const template = hooksData.input.template;

      startAndTrackSecondPage({
        title: "Thank You | " + hooksData.input.businessName,
        projectId: project ? project._id : "default",
        funnelId: funnelId,
        isSecondPage: true,
        path: randomString(10),
        templateContentUrl: template.contentUrl2,
        templateJsonUrl: template.jsonUrl2,
        images: template.images,
        images2: template.images2,
        logoUrl: template.logoUrl,
        logoUrl2: template.logoUrl2,
        isTemplate: true,
        businessLogoUrl: hooksData.input.businessLogoUrl,
        businessEmail: hooksData.input.businessEmail,
        businessPhoneNumber: hooksData.input.businessPhoneNumber,
        extraHead: template.extraHead2,
        extraBody: template.extraBody2,
      });
    } else {
      showErrorToast("Error.");
    }
  };

  const handleEndResponseSecondPage = (data: any) => {
    onFunnelCreated(
      `/projects/${project ? project._id : "default"}/${
        selectedTab === "Website" ? "websites" : "funnels"
      }/${funnelId}?page=lastpage`
    );
    const response = data.response;
    if (response) {
      showSuccessToast({ title: "Funnel created successsfully" });
    } else {
      showErrorToast("Error.");
    }
    onRequestClose();
    setIsGenerating(false);
  };

  const {
    startAndTrack: startAndTrackMagic,
    isLoading: isLoadingMagic,
    generationCount: generationCountMagic,
  } = useServerTokenTrackingAiFunnel({
    startRequest: startMarketingRequest as any,
    queryRequest: queryMarketingRequest as any,
    endRequest: endMarketingRequest as any,
    tokenKey: "commerceMagicHookToken",
    onEndResponse: handleEndResponseMagic,
    geneationType: false,
  });

  const {
    startAndTrack: startAndTrackSeoMagic,
    isLoading: isLoadingSeoMagic,
    generationCount: generationCountSeoMagic,
  } = useServerTokenTrackingAiFunnel({
    startRequest: startMarketingRequest as any,
    queryRequest: queryMarketingRequest as any,
    endRequest: endMarketingRequest as any,
    tokenKey: "commerceMagicHookToken",
    onEndResponse: handleEndResponseSeoMagic,
    geneationType: false,
  });

  const {
    startAndTrack: startAndTrackBenefit,
    isLoading: isLoadingBenefit,
    generationCount: generationCountBenefit,
  } = useServerTokenTrackingAiFunnel({
    startRequest: startBenefitRequest as any,
    queryRequest: queryBenefitRequest as any,
    endRequest: endBenefitRequest as any,
    tokenKey: "commerceBenefitStackToken",
    onEndResponse: handleEndResponseBenefit,
    geneationType: false,
  });

  const {
    startAndTrack: startAndTrackFAQ,
    isLoading: isLoadingFAQ,
    generationCount: generationCountFAQ,
  } = useServerTokenTrackingAiFunnel({
    startRequest: startFaqRequest as any,
    queryRequest: queryFaqRequest as any,
    endRequest: endFaqRequest as any,
    tokenKey: "faqToken",
    onEndResponse: handleEndResponseFAQ,
    geneationType: false,
  });

  const {
    startAndTrack: startAndTrackHeroImage,
    isLoading: isLoadingHeroImage,
    generationCount: generationCountHeroImage,
  } = useServerTokenTrackingAiFunnel({
    startRequest: startHeroRequest as any,
    queryRequest: queryHeroRequest as any,
    endRequest: endHeroRequest as any,
    tokenKey: "heroToken",
    onEndResponse: handleEndResponseHeroImage,
    geneationType: false,
  });

  const {
    startAndTrack: startAndTrackBonus,
    isLoading: isLoadingBonus,
    generationCount: generationCountBonus,
  } = useServerTokenTrackingAiFunnel({
    startRequest: startBonusRequest as any,
    queryRequest: queryBonusRequest as any,
    endRequest: endBonusRequest as any,
    tokenKey: "bonusToken",
    onEndResponse: handleEndResponseBonus,
    geneationType: false,
  });

  const {
    startAndTrack: startAndTrackProduct,
    isLoading: isLoadingProduct,
    generationCount: generationCountProduct,
  } = useServerTokenTrackingAiFunnel({
    startRequest: startProduct as any,
    queryRequest: queryProduct as any,
    endRequest: endProduct as any,
    tokenKey: "productToken",
    onEndResponse: handleEndResponseProduct,
    geneationType: false,
  });

  const {
    startAndTrack: startAndTrackPage,
    isLoading: isLoadingPage,
    generationCount: generationCountPage,
  } = useServerTokenTrackingAiFunnel({
    startRequest: startPageRequest as any,
    queryRequest: queryPageRequest as any,
    endRequest: endPageRequest as any,
    tokenKey: "createPageToken",
    onEndResponse: handleEndResponsePage,
    geneationType: false,
  });

  const {
    startAndTrack: startAndTrackSecondPage,
    isLoading: isLoadingSecondPage,
    generationCount: generationCountSecondPage,
  } = useServerTokenTrackingAiFunnel({
    startRequest: startPageRequest as any,
    queryRequest: queryPageRequest as any,
    endRequest: endPageRequest as any,
    tokenKey: "createPageToken",
    onEndResponse: handleEndResponseSecondPage,
    geneationType: false,
  });

  useEffect(() => {
    if (isEmpty(hooksData)) return;

    async function createFunnel(hooksData: any) {
      const data = await createFunnelWithAI({
        ...hooksData.input,
        prompt: hooksData,
      }).unwrap();

      if (data) {
        setFunnelId(data["_id"]);
        console.error(hooksData.input, "Page Data");

        const template = hooksData.input.template;
        startAndTrackPage({
          title: "Welcome | " + hooksData.input.businessName,
          projectId: project ? project._id : "default",
          funnelId: data["_id"],
          path: randomString(10),
          templateContentUrl: template.contentUrl,
          templateJsonUrl: template.jsonUrl,
          isTemplate: true,
          cta: hooksData.input.cta,
          businessLogoUrl: hooksData.input.businessLogoUrl,
          businessEmail: hooksData.input.businessEmail,
          businessPhoneNumber: hooksData.input.businessPhoneNumber,
          images: template.images,
          logoUrl: template.logoUrl,
          logoUrl2: template.logoUrl2,
          extraHead: template.extraHead,
          extraBody: template.extraBody,
        });
      }
    }

    const isLoading = Object.values(hooksData).some(
      (value: any) => value.isLoading
    );

    if (!isLoading) {
      createFunnel(hooksData);
    } else {
      const timer = setInterval(() => {
        if (remainingTime == 0) return;
        setRemainingTime(prevTime => prevTime - 1);
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [hooksData]);

  const handleTabChange = (index: number) => {
    setSelectedTab(index === 0 ? "Text" : index === 2 ? "Website" : "Image");
  };

  const handleSubmit = async (values: any) => {
    setIsGenerating(true);
    try {
      setHooksData({
        input: values,
        magic: {
          isLoading: true,
        },
        benefitStack: {
          isLoading: true,
        },
        faq: {
          isLoading: true,
        },
        hero: {
          isLoading: true,
        },
        bonus: {
          isLoading: true,
        },
        businessDesc: {
          isLoading: true,
        },
      });

      setRemainingTime(180);

      const currentHookId = `hook-${Date.now()}`;

      const submissionDataMagic = {
        ...values,
        n: 1,
        valence: true,
        correlationId: currentHookId,
        language: "English",
      };
      await startAndTrackMagic(submissionDataMagic);

      const submissionDataBenefit = {
        ...values,
        n: 6,
        correlationId: currentHookId,
        language: "English",
      };
      await startAndTrackBenefit(submissionDataBenefit);

      const submissionDataHero = {
        ...values,
        heroDescription: values.businessDescription,
        language: "English",
        aspectRatio: "Landscape (websites)",
        isolation: values.template.images[0]?.isolationMode || "none",
        imageType: values.template.images[0]?.type || "none",
        imageStyle: values.template.images[0]?.style || "none",
        impacts: [
          { "Color Palette": true },
          { Lighting: true },
          { Composition: true },
          { "Perspective and Angle": true },
          { "Facial Expressions and Body Language": true },
          { "Textures and Patterns": true },
          { Symbolism: true },
          { "Contrast and Saturation": true },
          { "Context and Setting": true },
          { "Narrative Elements": true },
        ],
      };
      await startAndTrackHeroImage(submissionDataHero);

      const submissionMagic = {
        ...values,
        n: 1,
        valence: false,
        correlationId: currentHookId,
        language: "English",
      };
      await startAndTrackSeoMagic(submissionMagic);
    } catch (error) {
      console.error(error);
      //@ts-ignore
      showErrorToast(
        //@ts-ignore
        error && error.data.error ? error.data.error : error
      );
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      customClassName="!overflow-hidden higher-big-modal"
    >
      <div className="grid h-full grid-rows-[auto_1fr]">
        {isGenerating ? (
          <div className="text-center">
            <div>
              <LoadingAnimation className="mb-5 max-w-[9rem]" />
              <p className="mb-3 text-lg font-semibold dark:text-white-light">
                Creating Funnel...
                <br />
                <span className="text-sm font-normal">
                  Please be patient. This can take up to 5 minutes.
                </span>
              </p>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-white">
              New Funnel Using AI
            </h2>
            <Formik
              initialValues={{
                projectId: project ? project._id : "default",
                businessName: "",
                businessDescription: "",
                cta: ctaData[0].name,
                businessLogoUrl: "",
                businessEmail: "",
                businessPhoneNumber: "",
              }}
              validationSchema={validationSchema}
              innerRef={formikRef}
              onSubmit={values => {
                handleSubmit(values);
              }}
            >
              {({ errors, values, setFieldValue, submitCount }) => (
                <Form className="space-y-5 text-white">
                  {step === 1 && (
                    <div className="mt-4 h-[80%] space-y-4">
                      <div>
                        <FieldWithLabel
                          id="businessName"
                          name="businessName"
                          label="Business Name"
                          component="input"
                          className="form-input whitespace-pre-wrap"
                        />
                        {errors.businessName && (
                          <div className="text-danger">
                            {errors.businessName}
                          </div>
                        )}
                      </div>

                      <div>
                        <VisionSelector onTabChange={handleTabChange} />
                        <div className="mt-4">
                          {selectedTab === "Image" ? (
                            <div className="space-y-4">
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
                                component="textarea"
                                id="businessDescription"
                                className="form-input whitespace-pre-wrap"
                                rows={4}
                                tooltipContent="Business Description: Briefly outlines the functionality and utility of a product or service, avoiding promotional language."
                              />
                            </div>
                          ) : selectedTab === "Website" ? (
                            <div className="space-y-4">
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
                                rows={4}
                                tooltipContent="Business Description: Briefly outlines the functionality and utility of a product or service, avoiding promotional language."
                              />
                            </div>
                          ) : (
                            <>
                              {visionIsLoading && <ProcessBanner />}
                              <FieldWithLabel
                                name="businessDescription"
                                label="Business Description"
                                component="textarea"
                                id="businessDescription"
                                className="form-input whitespace-pre-wrap"
                                rows={6}
                                tooltipContent="Business Description: Briefly outlines the functionality and utility of a product or service, avoiding promotional language."
                              />
                            </>
                          )}
                          {errors.businessDescription && (
                            <div className="text-danger">
                              {errors.businessDescription}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {step === 2 && (
                    <div className="mt-4 h-[80%] space-y-4 overflow-auto">
                      <div className="mb-4">
                        <Tippy
                          content={
                            "CTA: Choose the call-to-action for the email. Default is 'Purchase'."
                          }
                          placement="top"
                        >
                          <label
                            htmlFor="cta"
                            className="font-semibold text-white"
                          >
                            Call to Action
                          </label>
                        </Tippy>
                        <Field
                          as="select"
                          name="cta"
                          className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                            const selectedCta = e.target.value;
                            setFieldValue("cta", selectedCta);
                          }}
                        >
                          {ctaData.map((item, index) => (
                            <option key={index} value={item.name}>
                              {item.name}
                            </option>
                          ))}
                        </Field>
                        {submitCount > 0 && errors.cta && (
                          <div className="mt-1 text-danger">{errors.cta}</div>
                        )}
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="cta"
                          className="font-semibold text-white"
                        >
                          Business Logo
                        </label>
                        <VisionImageUpload
                          startImageRequest={startImageRequest}
                          queryImageRequest={queryImageRequest as any}
                          endImageRequest={endImageRequest as any}
                          handleEndResponse={handleEndLogoImageResponse}
                          images={logoImages}
                          setImages={setLogoImages}
                          isLoading={visionIsLoading}
                          setIsLoading={setVisionIsLoading}
                        />
                        {/* {visionIsLoading && <ProcessBanner />} */}
                      </div>
                      <div className="mb-4">
                        <FieldWithLabel
                          id="businessEmail"
                          name="businessEmail"
                          label="Business Contact Email"
                          component="input"
                          className="form-input whitespace-pre-wrap"
                        />
                        {errors.businessEmail && (
                          <div className="mt-1 text-danger">
                            {errors.businessEmail}
                          </div>
                        )}
                      </div>
                      <div className="mb-4">
                        <FieldWithLabel
                          id="businessPhoneNumber"
                          name="businessPhoneNumber"
                          label="Business Phone Number"
                          component="input"
                          className="form-input whitespace-pre-wrap"
                        />
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="mt-4 h-[76%] space-y-4">
                      <div className="grid flex-grow grid-cols-3 gap-2 overflow-y-scroll">
                        {AI_STEP_TEMPLATES.map((template, i) => (
                          <div
                            key={i}
                            className={`relative h-60 bg-cover`}
                            style={{
                              backgroundImage:
                                "url(" + template.thumbnailUrl + ")",
                              backgroundSize: "cover",
                              backgroundPosition: "top center",
                              backgroundRepeat: "no-repeat",
                            }}
                            onMouseEnter={() => setShowTemplateOptions(i)}
                            onMouseLeave={() => setShowTemplateOptions(-1)}
                          >
                            {showTemplateOptions === i && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-500 bg-opacity-50">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await handleSubmit({
                                      ...values,
                                      isTemplate: true,
                                      template: template,
                                    });
                                  }}
                                  disabled={isGenerating}
                                  className="flex items-center justify-center rounded border bg-primary px-4 py-2 text-white opacity-90 hover:opacity-100"
                                >
                                  <PlusSVG />
                                  <div className="ml-2">Select Template</div>
                                </button>
                                <Link
                                  href={template.contentUrl}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                  className="mt-4 flex items-center justify-center rounded border bg-secondary px-4 py-2 text-white opacity-90 hover:opacity-100"
                                >
                                  <EyeSVG />
                                  <div className="ml-2">Preview</div>
                                </Link>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className={`mt-4 flex ${
                      step === 1 ? "justify-end" : "justify-between"
                    }`}
                  >
                    {step !== 1 && (
                      <button
                        type="button"
                        className="rounded border border-primary px-4 py-2 text-primary"
                        onClick={e => {
                          const changeStep = step - 1;
                          setStep(changeStep);
                          e.preventDefault();
                        }}
                      >
                        Back
                      </button>
                    )}
                    <div>
                      <button
                        type="button"
                        onClick={onRequestClose}
                        className="mr-2 rounded border border-primary px-4 py-2 text-primary"
                      >
                        Cancel
                      </button>

                      {step !== 3 && (
                        <button
                          type="button"
                          className="rounded bg-primary px-4 py-2 text-white"
                          onClick={e => {
                            e.preventDefault();
                            const changeStep = step + 1;
                            if (
                              step === 1 &&
                              !errors.businessName &&
                              !errors.businessDescription
                            ) {
                              setStep(changeStep);
                            } else if (
                              step === 2 &&
                              !errors.cta &&
                              !errors.businessEmail
                            ) {
                              setStep(changeStep);
                            }
                          }}
                          disabled={visionIsLoading}
                        >
                          {visionIsLoading ? "Loading..." : "Next"}
                        </button>
                      )}
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </>
        )}
      </div>
    </Modal>
  );
};

export default NewFunnelAIModal;
