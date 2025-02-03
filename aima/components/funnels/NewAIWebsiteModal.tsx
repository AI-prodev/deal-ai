import React, { useState, useEffect, useRef } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { ErrorMessage, Field, Form, Formik, FormikProps } from "formik";
import * as Yup from "yup";
import clsx from "clsx";
import "tippy.js/dist/tippy.css";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { STEP_TEMPLATES } from "@/utils/data/FunnelStepTemplates";
import { SIMPLE_WEBSITE_STEP_TEMPLATES } from "@/utils/data/SimpleWebsiteStepTemplates";
import { getInitialsAndColor } from "@/utils/getInitialsAndColor";
import { createFunnelApi } from "@/store/features/projectApi";
import { createPageApi } from "@/store/features/pageApi";
import { createProfileAPI } from "@/store/features/profileApi";
import {
  useStartMarketingRequestMutation,
  useEndMarketingRequestMutation,
  useQueryMarketingRequestMutation,
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
import { IProject } from "@/interfaces/IProject";
import useServerTokenTrackingAiFunnel from "@/hooks/useServerTokenTrackingAiFunnel";
import ModalPrompt from "@/components/ModalPrompt";
import { LogoSVG, PlusSVG, EyeSVG } from "@/components/icons/SVGData";
import Link from "next/link";
import { FunnelType } from "@/enums/funnel-type.enum";
import ItemSelector from "../ai-website/ItemSelector";
import { useGetBusinessDetailsQuery } from "@/store/features/profileApi";
import { randomString } from "@/helpers/random";
import { isEmpty } from "lodash";
import LoadingAnimation from "../LoadingAnimation";

interface NewAIWebsiteModalProps {
  isLightMode?: boolean;
  project: IProject | null;
  isOpen: boolean;
  onRequestClose: () => void;
  onFunnelCreated: (url: string) => void;
  onPageCreated?: () => void;
  type: FunnelType;
}

const validationSchema = Yup.object().shape({
  projectId: Yup.string().required("Project ID is required"),
  businessName: Yup.string().required("Business Name is required"),
  businessDescription: Yup.string().required(
    "Business Description is required"
  ),
  // businessGoal: Yup.string().required("Business Goal is required"),
  city: Yup.string().required("City is required"),
  // isCustomerForm: Yup.string().required("This field is required"),
  // style: Yup.string().required("Style is required"),
  isVideo: Yup.string().required("This field is required"),
  // imageFrom: Yup.string().required("This field is required"),
  themeColor: Yup.string().required("Color is required"),
});

type FormProps = {
  projectId: string;
  businessName: string;
  businessDescription: string;
  businessGoal: string;
  companyAddress: string;
  // businessPhoneNumber: string;
  // businessEmail: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  email: string;
  phone: string;
  isCustomerForm: string;
  style: string;
  isVideo: string;
  imageFrom: string;
  themeColor: string;
};

interface QAItemType {
  q: string;
  a: string;
  r: string;
  rp: string;
}

const NewAIWebsiteModal: React.FC<NewAIWebsiteModalProps> = ({
  isLightMode = false,
  project,
  isOpen,
  onRequestClose,
  onFunnelCreated,
  type,
}) => {
  const [hooksData, setHooksData] = useState<any>({});
  const [userInput, setUserInput] = useState<any>({});
  const [step, setStep] = useState(0);
  const [showProfile, setShowProfile] = useState(false);

  const [qaList, setQaList] = useState<QAItemType[]>([
    {
      q: "What is your company called?",
      a: "",
      r: "",
      rp: "",
    },
  ]);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showTemplateOptions, setShowTemplateOptions] = useState(-1);
  const [funnelId, setFunnelId] = useState("");
  const [profileValue, setProfileValue] = useState({
    firstName: "",
    email: "",
    phone: "",
    profileImage: "",
  });
  const [companyAddressInfo, setCompanyAddressInfo] = useState({
    businessName: "",
    country: "",
    city: "",
    state: "",
    zip: "",
    address: "",
  });

  const formikRef = useRef<FormikProps<FormProps>>(null);
  const stateRef = useRef();
  const countryRef = useRef();
  const zipRef = useRef();

  const stepTemplates =
    type === FunnelType.SIMPLE_WEBSITES
      ? SIMPLE_WEBSITE_STEP_TEMPLATES
      : STEP_TEMPLATES;

  const qList = [
    {
      name: "businessName",
      value: "What is your company called?",
      recommendText: "Straight to the point. Easy to understand.",
    },
    {
      name: "businessDescription",
      value: "What does your company do?",
      recommendText: "Simple and straightforward. Got it.",
    },
    {
      name: "businessGoal",
      value: "What is the primary focus of this website?",
      recommendText: "Great, you're targeting city car owners.",
    },
    {
      name: "companyAddress",
      value: "What is your company address?",
      recommendText: "Excellent",
    },
    {
      name: "isCustomerForm",
      value: "Would you like a customer form?",
      recommendText: "Got it.",
    },
    {
      name: "style",
      value: "What style website would you like?",
      recommendText: "Nice!",
    },
    {
      name: "isVideo",
      value: "Do you have a video to add?",
      recommendText: "Great!",
    },
    {
      name: "imageFrom",
      value: "Would you like ",
      recommendText: "Nice!",
    },
    {
      name: "themeColor",
      value:
        "Describe a color scheme, you think would work well for your business",
      recommendText: "Excellent!",
    },
    {
      name: "selectTemplate",
      value: "Please select from a template to start",
      recommendText: "Great!",
    },
  ];

  const focusOptions = [
    "Generate Sales",
    "Collect Customer contact details",
    "Raise Brand awareness",
    "Etc",
  ];
  const formOptions = ["Yes", "No"];
  const styleOptions = ["Modern", "Classic", "Professional", "Funky"];
  const imgOptions = [
    "AI generated imgages",
    "Stock images",
    "Upload your own",
  ];

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

  const [startProduct] = useStartProductRequestMutation();
  const [queryProduct] = useQueryProductRequestMutation();
  const [endProduct] = useEndProductRequestMutation();

  const [createFunnelWithAI] = createFunnelApi.useCreateFunnelWithAIMutation();
  const [startPageRequest] = createPageApi.useStartPageRequestMutation();
  const [queryPageRequest] = createPageApi.useQueryPageRequestMutation();
  const [endPageRequest] = createPageApi.useEndPageRequestMutation();

  const [startQuestionRequest] =
    createPageApi.useStartQuestionRequestMutation();
  const [queryQuestionRequest] =
    createPageApi.useQueryQuestionRequestMutation();
  const [endQuestionRequest] = createPageApi.useEndQuestionRequestMutation();

  const handleEndResponseQuestion = (data: any) => {
    const response = data.response;

    if (step === 0) {
      setQaList(prevQaList => [
        {
          ...prevQaList[0],
          a: userInput.input[qList[step + 1].name] || "",
        },
        {
          q: qList[step + 1].value,
          a: userInput.input[qList[step + 1].name],
          r: response.recommendText,
          rp: response.replyText,
        },
      ]);
    } else {
      setQaList(prevQaList => [
        ...prevQaList,
        {
          q: qList[step + 1].value,
          a: userInput.input[qList[step + 1].name],
          r: response.recommendText,
          rp: response.replyText,
        },
      ]);
    }
    setIsGenerating(false);
  };

  const handleEndResponseMagic = async (data: any) => {
    const response = data?.response;
    if (response) {
      if (hooksData?.magic?.pos) {
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
      const imagesLength = template.images.length + template.images2.length;
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
    onFunnelCreated(
      `/projects/${project ? project._id : "default"}/simple-websites/${funnelId}?page=lastpage`
    );
    const response = data.response;
    if (response) {
      showSuccessToast({ title: "Funnel created successsfully" });
    } else {
      showErrorToast("Error.");
    }
    onRequestClose();
    setSubmitting(false);
  };

  const { startAndTrack: startAndTrackMagic } = useServerTokenTrackingAiFunnel({
    startRequest: startMarketingRequest as any,
    queryRequest: queryMarketingRequest as any,
    endRequest: endMarketingRequest as any,
    tokenKey: "commerceMagicHookToken",
    onEndResponse: handleEndResponseMagic,
    geneationType: false,
  });

  const { startAndTrack: startAndTrackSeoMagic } =
    useServerTokenTrackingAiFunnel({
      startRequest: startMarketingRequest as any,
      queryRequest: queryMarketingRequest as any,
      endRequest: endMarketingRequest as any,
      tokenKey: "commerceMagicHookToken",
      onEndResponse: handleEndResponseSeoMagic,
      geneationType: false,
    });

  const { startAndTrack: startAndTrackBenefit } =
    useServerTokenTrackingAiFunnel({
      startRequest: startBenefitRequest as any,
      queryRequest: queryBenefitRequest as any,
      endRequest: endBenefitRequest as any,
      tokenKey: "commerceBenefitStackToken",
      onEndResponse: handleEndResponseBenefit,
      geneationType: false,
    });

  const { startAndTrack: startAndTrackFAQ } = useServerTokenTrackingAiFunnel({
    startRequest: startFaqRequest as any,
    queryRequest: queryFaqRequest as any,
    endRequest: endFaqRequest as any,
    tokenKey: "faqToken",
    onEndResponse: handleEndResponseFAQ,
    geneationType: false,
  });

  const { startAndTrack: startAndTrackHeroImage } =
    useServerTokenTrackingAiFunnel({
      startRequest: startHeroRequest as any,
      queryRequest: queryHeroRequest as any,
      endRequest: endHeroRequest as any,
      tokenKey: "heroToken",
      onEndResponse: handleEndResponseHeroImage,
      geneationType: false,
    });

  const { startAndTrack: startAndTrackBonus } = useServerTokenTrackingAiFunnel({
    startRequest: startBonusRequest as any,
    queryRequest: queryBonusRequest as any,
    endRequest: endBonusRequest as any,
    tokenKey: "bonusToken",
    onEndResponse: handleEndResponseBonus,
    geneationType: false,
  });

  const { startAndTrack: startAndTrackProduct } =
    useServerTokenTrackingAiFunnel({
      startRequest: startProduct as any,
      queryRequest: queryProduct as any,
      endRequest: endProduct as any,
      tokenKey: "productToken",
      onEndResponse: handleEndResponseProduct,
      geneationType: false,
    });

  const { startAndTrack: startAndTrackPage } = useServerTokenTrackingAiFunnel({
    startRequest: startPageRequest as any,
    queryRequest: queryPageRequest as any,
    endRequest: endPageRequest as any,
    tokenKey: "createPageToken",
    onEndResponse: handleEndResponsePage,
    geneationType: false,
  });

  const { startAndTrack: questionRequest, isLoading: isLoadingQuestion } =
    useServerTokenTrackingAiFunnel({
      startRequest: startQuestionRequest as any,
      queryRequest: queryQuestionRequest as any,
      endRequest: endQuestionRequest as any,
      tokenKey: "createQuestionToken",
      onEndResponse: handleEndResponseQuestion,
      geneationType: false,
    });

  const { data: businessDetails } = useGetBusinessDetailsQuery({});
  const { data: profile } = createProfileAPI.useGetProfileQuery() ?? {};

  const removeSpacing = (
    city: string,
    state: string,
    country: string,
    zip: string
  ) => {
    let address = "";
    if (city) address = city;
    if (state) address += address ? ", " + state : state;
    if (country) address += address ? ", " + country : country;
    if (zip) address += address ? ", " + zip : zip;

    return address;
  };

  const handleScroll = () => {
    setTimeout(() => {
      const modal: any = document.querySelector(".promptModal");

      const scrollHeight = modal?.scrollHeight;
      const animationDuration = 600; // Duration of the smooth scrolling animation in milliseconds

      const start = modal?.scrollTop;
      const change = step === 8 ? 500 : scrollHeight - start;
      let startTime: any = null;

      function smoothScroll(timestamp: any) {
        if (!startTime) startTime = timestamp;
        const elapsedTime = timestamp - startTime;
        const newScrollTop = easeInOut(
          elapsedTime,
          start,
          change,
          animationDuration
        );
        if (modal) modal.scrollTop = newScrollTop;

        if (elapsedTime < animationDuration) {
          requestAnimationFrame(smoothScroll);
        }
      }

      function easeInOut(t: number, b: number, c: number, d: number) {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
      }

      requestAnimationFrame(smoothScroll);
    }, 30);
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      setHooksData({
        input: {
          ...values,
          email: profileValue.email,
          phone: profileValue.phone,
          city: companyAddressInfo.city,
          state: companyAddressInfo.state,
          country: companyAddressInfo.country,
          zip: companyAddressInfo.zip,
          companyAddress: companyAddressInfo.address,
        },
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
      showErrorToast(
        //@ts-ignore
        error && error.data.error ? error.data.error : error
      );
      setSubmitting(false);
    }
  };

  const handleUserInput = async (values: any) => {
    setIsGenerating(true);

    let requestData;
    if (step === 1) {
      setUserInput({
        input: {
          ...userInput.input,
          businessDescription: values.businessDescription,
        },
      });
    } else if (step === 2) {
      setUserInput({
        input: {
          ...userInput.input,
          businessGoal: values.businessGoal,
        },
      });
    } else if (step === 3) {
      setUserInput({
        input: {
          ...userInput.input,
          ...values,
          companyAddress: companyAddressInfo.address
            ? companyAddressInfo.address
            : removeSpacing(
                values["city"],
                values["state"],
                values["country"],
                values["zip"]
              ),
        },
      });
      requestData = {
        prompt: companyAddressInfo.address
          ? companyAddressInfo.address
          : removeSpacing(
              values["city"],
              values["state"],
              values["country"],
              values["zip"]
            ),
        question: qList[step].value,
        recommendText: qList[step].recommendText,
      };
    } else if (step === 4) {
      setUserInput({
        input: {
          ...userInput.input,
          isCustomerForm: values.isCustomerForm,
        },
      });
    } else if (step === 5) {
      setUserInput({
        input: {
          ...userInput.input,
          style: values.style,
        },
      });
    } else if (step === 6) {
      setUserInput({
        input: {
          ...userInput.input,
          isVideo: values.isVideo,
        },
      });
    } else if (step === 7) {
      setUserInput({
        input: {
          ...userInput.input,
          imageFrom: values.imageFrom,
        },
      });
    } else if (step === 8) {
      setUserInput({
        input: {
          ...userInput.input,
          themeColor: values.themeColor,
        },
      });
    } else if (step === 9) {
      setUserInput({
        ...userInput.input,
        input: values,
      });
      await handleSubmit(values);
      return;
    } else {
      setUserInput({
        input: {
          ...userInput.input,
          businessName: values.businessName,
        },
      });
    }

    if (step !== 3 && step !== 9) {
      requestData = {
        prompt: values[qList[step].name],
        question: qList[step].value,
        recommendText: qList[step].recommendText,
      };
    }

    // ---------------fake---------------
    if (step === 0) {
      setQaList(prevQaList => [
        {
          ...prevQaList[0],
          a: (userInput.input && userInput.input[qList[step + 1].name]) || "",
        },
        {
          q: qList[step + 1].value,
          a: userInput.input && userInput.input[qList[step + 1].name],
          r: qList[step + 1].recommendText,
          rp: qList[step + 1].recommendText,
        },
      ]);
    } else {
      setQaList(prevQaList => [
        ...prevQaList,
        {
          q: qList[step + 1].value,
          a: userInput.input && userInput.input[qList[step + 1].name],
          r: qList[step + 1].recommendText,
          rp: qList[step + 1].recommendText,
        },
      ]);
    }
    setIsGenerating(false);
    // ----------------------------------

    // await questionRequest({ input: requestData });
    handleScroll();
  };

  const handleEnterKey = async (e: any, values: any) => {
    e.preventDefault();
    handleUserInput(values);
  };

  const handleBack = (e: any) => {
    e.preventDefault();
    formikRef.current?.setFieldValue(qList[step].name, "");

    setUserInput((prevInputs: any) => {
      const newState = Object.fromEntries(
        Object.entries(prevInputs?.input).filter(
          ([key]) => key !== qList[step].name
        )
      );
      return { input: newState };
    });

    setQaList(prevQaList => {
      const newArry = prevQaList.slice(0, -1);
      return newArry;
    });

    if (companyAddressInfo.address && step === 4) {
      setStep(step - 2);
    } else {
      setStep(step - 1);
    }
  };

  const getHistory = (name: string, index: number) => {
    const answer = () => (
      <div
        key={"answer_" + index}
        className={clsx("flex mt-3 p-2 pl-5 rounded-md", {
          "text-black": isLightMode,
          "text-white": !isLightMode,
        })}
      >
        <div>
          {profileValue.profileImage ? (
            <img
              className="h-7 w-7 rounded-md object-cover"
              src={profileValue.profileImage}
              alt="userProfile"
            />
          ) : (
            <div
              className={`flex h-7 w-7 items-center justify-center  rounded-md object-cover text-lg text-white ${bgColor}`}
            >
              {initials}
            </div>
          )}
        </div>
        <div className="pl-5">{userInput.input && userInput.input[name]}</div>
      </div>
    );
    const recommendText = () => {
      if (companyAddressInfo.businessName) {
        return (
          index !== 0 &&
          qaList[index + 1]?.r && (
            <div
              key={"recommendText_" + index}
              className={clsx("mt-3 pl-2", {
                "text-black": isLightMode,
                "text-white": !isLightMode,
              })}
            >
              <p>{qaList[index + 1]?.r}</p>
            </div>
          )
        );
      } else {
        return (
          qaList[index + 1]?.r && (
            <div
              key={"recommendText_" + index}
              className={clsx("mt-3 pl-2", {
                "text-black": isLightMode,
                "text-white": !isLightMode,
              })}
            >
              <p>{qaList[index + 1]?.r}</p>
            </div>
          )
        );
      }
    };
    const question = (key: number) => {
      return (
        qaList[index + 1]?.r && (
          <div
            key={"question_" + index}
            className={clsx("flex mt-1 p-2 rounded-md", {
              "text-black": isLightMode,
              "text-white": !isLightMode,
            })}
          >
            <div className="pl-2">
              <LogoSVG
                className={clsx("inline w-4 ltr:-ml-1 rtl:-mr-1", {
                  "fill-black": isLightMode,
                  "texfillt-white": !isLightMode,
                })}
              />
            </div>
            <div
              className={clsx("pl-5", {
                "text-black": isLightMode,
                "text-white": !isLightMode,
              })}
            >
              {qList[key].value}
            </div>
          </div>
        )
      );
    };

    if (userInput.input && userInput.input[name]) {
      if (companyAddressInfo.businessName) {
        if (companyAddressInfo.address) {
          return (
            index > 0 &&
            index !== 3 && (
              <>
                {answer()}
                {recommendText()}
                {question(index + 1 === 3 ? index + 2 : index + 1)}
              </>
            )
          );
        } else {
          return (
            index > 0 && (
              <>
                {answer()}
                {recommendText()}
                {question(index + 1)}
              </>
            )
          );
        }
      } else {
        if (companyAddressInfo.address) {
          return (
            index !== 3 && (
              <>
                {answer()}
                {recommendText()}
                {question(index + 1 === 3 ? index + 2 : index + 1)}
              </>
            )
          );
        } else {
          return (
            <>
              {answer()}
              {recommendText()}
              {question(index + 1)}
            </>
          );
        }
      }
    } else {
      return null;
    }
  };

  const getSideModalContent = (name: string, index: number) => {
    const answer = () => (
      <div
        key={"side_answer_" + index}
        className={clsx("flex mt-3 p-2 rounded-md", {
          "!bg-white": isLightMode,
          "!bg-[#1b2e4b]": !isLightMode,
        })}
      >
        <div
          className={clsx("font-bold", {
            "text-black": isLightMode,
            "text-white": !isLightMode,
          })}
        >
          {userInput.input && index === 3
            ? "Your company address is " + userInput.input[name]
            : index === 4
              ? userInput.input[name] === "Yes"
                ? "A customer form is added"
                : "A customer form is not added"
              : index === 5
                ? "Your website style is " + userInput.input[name]
                : index === 6
                  ? "A video is added"
                  : index === 7
                    ? "You would like to use " + userInput.input[name]
                    : index === 8
                      ? "You website will use " +
                        userInput.input[name] +
                        " as a color scheme"
                      : userInput.input[name]}
        </div>
      </div>
    );
    const replyText = () => {
      if (companyAddressInfo.businessName && index === 0) {
        return (
          index !== 0 &&
          qaList[index]?.r && (
            <div
              key={"side_replyText_" + index}
              className={clsx("mt-3 pl-2", {
                "!bg-white": isLightMode,
                "!bg-[#1b2e4b]": !isLightMode,
              })}
            >
              <p
                className={clsx("pl-2", {
                  "text-black": isLightMode,
                  "text-white": !isLightMode,
                })}
              >
                {qaList[index]?.r}
              </p>
            </div>
          )
        );
      } else {
        return (
          qaList[index + 1]?.rp && (
            <div
              key={"replyText_" + index}
              className={clsx("mt-3 pl-2", {
                "!bg-white": isLightMode,
                "!bg-[#1b2e4b]": !isLightMode,
              })}
            >
              <p
                className={clsx("pl-2", {
                  "text-black": isLightMode,
                  "text-white": !isLightMode,
                })}
              >
                {qaList[index + 1]?.rp}
              </p>
            </div>
          )
        );
      }
    };

    if (userInput.input && userInput.input[name]) {
      if (companyAddressInfo.businessName) {
        if (companyAddressInfo.address) {
          return (
            index > 0 &&
            index !== 3 && (
              <>
                {answer()}
                {replyText()}
              </>
            )
          );
        } else {
          return (
            index > 0 && (
              <>
                {answer()}
                {replyText()}
              </>
            )
          );
        }
      } else {
        if (companyAddressInfo.address) {
          return (
            index !== 3 && (
              <>
                {answer()}
                {replyText()}
              </>
            )
          );
        } else {
          return (
            <>
              {answer()}
              {replyText()}
            </>
          );
        }
      }
    } else {
      return null;
    }
  };

  useEffect(() => {
    if (companyAddressInfo.address && step === 2) {
      setStep(4);

      setQaList(prevQaList => [
        ...prevQaList,
        {
          q: qList[4].value,
          a: "",
          r: "",
          rp: "",
        },
      ]);
    } else {
      setStep(qaList.length - 1);
      handleScroll();
    }

    step > 0 ? setShowProfile(true) : setShowProfile(false);
  }, [qaList]);

  useEffect(() => {
    setCompanyAddressInfo({
      ...companyAddressInfo,
      businessName: businessDetails?.businessName || "",
      country: businessDetails?.businessAddress?.addressCountry || "",
      city: businessDetails?.businessAddress?.addressCity || "",
      state: businessDetails?.businessAddress?.addressState || "",
      zip: businessDetails?.businessAddress?.addressZipCode || "",
      address: removeSpacing(
        businessDetails?.businessAddress?.addressCity,
        businessDetails?.businessAddress?.addressState,
        businessDetails?.businessAddress?.addressCountry,
        businessDetails?.businessAddress?.addressZipCode
      ),
    });

    if (businessDetails?.businessName) {
      setUserInput({
        input: {
          ...userInput.input,
          businessName: businessDetails.businessName,
        },
      });

      setQaList(prevQaList => [
        {
          ...prevQaList[0],
          a: businessDetails.businessName,
        },
        {
          q: qList[1].value,
          a: "",
          r: "",
          rp: "",
        },
      ]);

      setStep(1);
    }
  }, [businessDetails]);

  useEffect(() => {
    if (profile && profile.fields) {
      setProfileValue({
        ...profileValue,
        firstName: profile.fields.firstName
          ? profile.fields.firstName
          : profile.user.firstName || "",
        email: profile.user.email || "",
        phone: profile.fields.phone || "",
        profileImage: profile.profileImage || "",
      });
    }
  }, [profile]);

  const { initials, bgColor } = getInitialsAndColor(profileValue.firstName);

  useEffect(() => {
    if (isEmpty(hooksData)) return;

    async function createFunnel(hooksData: any) {
      const data = await createFunnelWithAI({
        ...hooksData.input,
        prompt: hooksData,
        type: type,
      }).unwrap();

      if (data) {
        setFunnelId(data["_id"]);

        const template = hooksData.input.template;
        startAndTrackPage({
          title: hooksData.input.businessName,
          projectId: project ? project._id : "default",
          funnelId: data["_id"],
          path: randomString(10),
          templateContentUrl: template.contentUrl,
          templateJsonUrl: template.jsonUrl,
          isTemplate: true,
          isCustomerForm: hooksData.input.isCustomerForm,
          businessEmail: hooksData.input.email,
          businessPhoneNumber: hooksData.input.phone,
          companyAddress: companyAddressInfo.address,
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

  return (
    <div className="flex">
      <ModalPrompt
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        customClassName={clsx("", {
          "!overflow-hidden higher-big-modal !bg-white": isLightMode,
          "!overflow-hidden higher-big-modal !bg-[#1b2e4b]": !isLightMode,
        })}
        customSideModalClassName={clsx("", {
          "!bg-white": isLightMode,
          "!bg-[#1b2e4b]": !isLightMode,
        })}
        profiles={
          showProfile && (
            <>
              {companyAddressInfo.businessName && (
                <div
                  className={clsx("flex mt-3 p-2 rounded-md", {
                    "!bg-white": isLightMode,
                    "!bg-[#1b2e4b]": !isLightMode,
                  })}
                >
                  <div
                    className={clsx("font-bold", {
                      "text-black": isLightMode,
                      "text-white": !isLightMode,
                    })}
                  >
                    {companyAddressInfo.businessName}
                  </div>
                </div>
              )}
              {qList.map(({ name }, index) => {
                return getSideModalContent(name, index);
              })}
            </>
          )
        }
      >
        {isSubmitting ? (
          <div className="text-center">
            <div>
              <LoadingAnimation className="mb-5 max-w-[9rem]" />
              <p
                className={clsx("mb-3 text-lg font-semibold", {
                  "text-black": isLightMode,
                  "text-white": !isLightMode,
                })}
              >
                Creating Website...
                <br />
                <span className="text-sm font-normal">
                  Please be patient. This can take up to 5 minutes.
                </span>
              </p>
            </div>
          </div>
        ) : (
          <>
            <div
              className={clsx("pl-2", {
                "text-black": isLightMode,
                "text-white": !isLightMode,
              })}
            >
              <p>Hi,</p>
              <p>Let’s get started with your site setup.</p>
            </div>
            <div
              className={clsx("flex mt-1 p-2 rounded-md", {
                "text-black": isLightMode,
                "text-white": !isLightMode,
              })}
            >
              <div className="pl-2">
                <LogoSVG
                  className={clsx("inline w-4 ltr:-ml-1 rtl:-mr-1", {
                    "fill-black": isLightMode,
                    "texfillt-white": !isLightMode,
                  })}
                />
              </div>
              <div
                className={clsx("pl-5", {
                  "text-black": isLightMode,
                  "text-white": !isLightMode,
                })}
              >
                {qList[companyAddressInfo.businessName ? 1 : 0].value}
              </div>
            </div>
            {qList.map(({ name }, index) => {
              return getHistory(name, index);
            })}
            {isLoadingQuestion && (
              <div className="bottom-3">
                <BeatLoader color="#4361ee" />
              </div>
            )}
            <div className="bottom-1 w-full ">
              <Formik
                initialValues={{
                  projectId: project ? project._id : "default",
                  businessName: companyAddressInfo.businessName
                    ? companyAddressInfo.businessName
                    : "",
                  businessDescription: "",
                  businessGoal: "",
                  companyAddress: companyAddressInfo.address
                    ? companyAddressInfo.address
                    : "",
                  city: "",
                  state: "",
                  country: "",
                  zip: "",
                  email: "",
                  phone: "",
                  isCustomerForm: "",
                  style: "",
                  isVideo: "",
                  imageFrom: "",
                  themeColor: "",
                }}
                validationSchema={validationSchema}
                innerRef={formikRef}
                onSubmit={values => {
                  handleUserInput(values);
                }}
              >
                {({ errors, isSubmitting, touched, values, setFieldValue }) => (
                  <Form>
                    {!companyAddressInfo.businessName && step === 0 && (
                      <div className="space-y-4">
                        <div
                          className={
                            touched.businessName && errors.businessName
                              ? "has-error"
                              : ""
                          }
                        >
                          <label
                            htmlFor="businessName"
                            className={clsx("", {
                              "text-black": isLightMode,
                              "text-white": !isLightMode,
                            })}
                          ></label>

                          <Field
                            name="businessName"
                            type="text"
                            className={clsx("form-input", {
                              "!bg-white !text-[#333333]": isLightMode,
                            })}
                            onKeyPress={(e: any) => {
                              if (
                                e.key === "Enter" &&
                                values.businessName != ""
                              )
                                handleEnterKey(e, values);
                            }}
                          />
                          {errors.businessName && (
                            <div className="text-danger">
                              {errors.businessName}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {step === 1 && (
                      <div className="space-y-4">
                        <div
                          className={
                            touched.businessDescription &&
                            errors.businessDescription
                              ? "has-error"
                              : ""
                          }
                        >
                          <label
                            htmlFor="businessDescription"
                            className={clsx("", {
                              "text-black": isLightMode,
                              "text-white": !isLightMode,
                            })}
                          ></label>
                          <Field
                            name="businessDescription"
                            type="text"
                            className={clsx("form-input", {
                              "!bg-white !text-[#333333]": isLightMode,
                            })}
                            onKeyPress={(e: any) => {
                              if (
                                e.key === "Enter" &&
                                values.businessDescription != ""
                              )
                                handleEnterKey(e, values);
                            }}
                          />
                          {errors.businessDescription && (
                            <div className="text-danger">
                              {errors.businessDescription}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {step === 2 && !isGenerating && (
                      <ItemSelector
                        setFieldValue={setFieldValue}
                        value={values.businessGoal}
                        item="businessGoal"
                        options={focusOptions}
                        isLightMode={isLightMode}
                      />
                    )}
                    {step === 3 && !isGenerating && (
                      <div className="flex">
                        <div className="p-1 space-y-4">
                          <div
                            className={
                              touched.city && errors.city ? "has-error" : ""
                            }
                          >
                            <label
                              htmlFor="city"
                              className={clsx("", {
                                "text-black": isLightMode,
                                "text-white": !isLightMode,
                              })}
                            >
                              City
                            </label>
                            <Field
                              name="city"
                              type="text"
                              className={clsx("form-input", {
                                "!bg-white !text-[#333333]": isLightMode,
                              })}
                              onKeyPress={(e: any) => {
                                if (
                                  e.key == "Enter" &&
                                  e.target.name == "city" &&
                                  e.target.value != ""
                                ) {
                                  const stateField: any = stateRef.current;
                                  if (stateField) stateField.focus();
                                }
                              }}
                            />
                            {errors.city && (
                              <div className="text-danger">{errors.city}</div>
                            )}
                          </div>
                        </div>
                        <div className="p-1 space-y-4">
                          <div
                            className={
                              touched.state && errors.state ? "has-error" : ""
                            }
                          >
                            <label
                              htmlFor="state"
                              className={clsx("", {
                                "text-black": isLightMode,
                                "text-white": !isLightMode,
                              })}
                            >
                              State
                            </label>
                            <Field
                              name="state"
                              type="text"
                              className={clsx("form-input", {
                                "!bg-white !text-[#333333]": isLightMode,
                              })}
                              innerRef={stateRef}
                              onKeyPress={(e: any) => {
                                if (
                                  e.key == "Enter" &&
                                  e.target.name == "state" &&
                                  e.target.value != ""
                                ) {
                                  const countryField: any = countryRef.current;
                                  if (countryField) countryField.focus();
                                }
                              }}
                            />
                            <ErrorMessage
                              name="state"
                              component="div"
                              className="mt-1 text-danger"
                            />
                          </div>
                        </div>
                        <div className="p-1 space-y-4">
                          <div
                            className={
                              touched.country && errors.country
                                ? "has-error"
                                : ""
                            }
                          >
                            <label
                              htmlFor="country"
                              className={clsx("", {
                                "text-black": isLightMode,
                                "text-white": !isLightMode,
                              })}
                            >
                              Country
                            </label>
                            <Field
                              name="country"
                              type="text"
                              className={clsx("form-input", {
                                "!bg-white !text-[#333333]": isLightMode,
                              })}
                              innerRef={countryRef}
                              onKeyPress={(e: any) => {
                                if (
                                  e.key == "Enter" &&
                                  e.target.name == "country" &&
                                  e.target.value != ""
                                ) {
                                  const zipField: any = zipRef.current;
                                  if (zipField) zipField.focus();
                                }
                              }}
                            />
                            <ErrorMessage
                              name="country"
                              component="div"
                              className="mt-1 text-danger"
                            />
                          </div>
                        </div>

                        <div className="p-1 space-y-4">
                          <div
                            className={
                              touched.zip && errors.zip ? "has-error" : ""
                            }
                          >
                            <label
                              htmlFor="zip"
                              className={clsx("", {
                                "text-black": isLightMode,
                                "text-white": !isLightMode,
                              })}
                            >
                              {" "}
                              ZIP
                            </label>
                            <Field
                              name="zip"
                              type="text"
                              className={clsx("form-input", {
                                "!bg-white !text-[#333333]": isLightMode,
                              })}
                              innerRef={zipRef}
                              onKeyPress={(e: any) => {
                                if (e.key === "Enter" && !errors.zip)
                                  handleEnterKey(e, values);
                              }}
                            />
                            <ErrorMessage
                              name="zip"
                              component="div"
                              className="mt-1 text-danger"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {step === 4 && !isGenerating && (
                      <ItemSelector
                        setFieldValue={setFieldValue}
                        value={values.isCustomerForm}
                        options={formOptions}
                        item="isCustomerForm"
                        isLightMode={isLightMode}
                      />
                    )}
                    {step === 5 && !isGenerating && (
                      <ItemSelector
                        setFieldValue={setFieldValue}
                        value={values.style}
                        options={styleOptions}
                        item="style"
                        isLightMode={isLightMode}
                      />
                    )}
                    {step === 6 && (
                      <div className="space-y-4">
                        <div
                          className={
                            touched.isVideo && errors.isVideo ? "has-error" : ""
                          }
                        >
                          <label
                            htmlFor="isVideo"
                            className={clsx("", {
                              "text-black": isLightMode,
                              "text-white": !isLightMode,
                            })}
                          ></label>
                          <Field
                            name="isVideo"
                            type="text"
                            className={clsx("form-input", {
                              "!bg-white !text-[#333333]": isLightMode,
                            })}
                            onKeyPress={(e: any) => {
                              if (e.key === "Enter") handleEnterKey(e, values);
                            }}
                          />
                          {errors.isVideo && (
                            <div className="text-danger">{errors.isVideo}</div>
                          )}
                        </div>
                      </div>
                    )}
                    {step === 7 && !isGenerating && (
                      <ItemSelector
                        setFieldValue={setFieldValue}
                        value={values.imageFrom}
                        options={imgOptions}
                        item="imageFrom"
                        isLightMode={isLightMode}
                      />
                    )}
                    {step === 8 && (
                      <div className="space-y-4">
                        <div
                          className={
                            touched.themeColor && errors.themeColor
                              ? "has-error"
                              : ""
                          }
                        >
                          <label
                            htmlFor="themeColor"
                            className={clsx("", {
                              "text-black": isLightMode,
                              "text-white": !isLightMode,
                            })}
                          ></label>
                          <Field
                            name="themeColor"
                            type="text"
                            id="themeColor"
                            className={clsx("form-input", {
                              "!bg-white !text-[#333333]": isLightMode,
                            })}
                            onKeyPress={(e: any) => {
                              if (e.key === "Enter") handleEnterKey(e, values);
                            }}
                          />
                          {errors.themeColor && (
                            <div className="text-danger">
                              {errors.themeColor}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {step === 9 && (
                      <div className="grid grid-cols-3 flex-grow gap-2 overflow-y-scroll">
                        {stepTemplates.map((template, i) => (
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
                              <div className="absolute inset-0 flex flex-col justify-center items-center bg-blue-500 bg-opacity-50">
                                <button
                                  type="button"
                                  onClick={async () =>
                                    handleUserInput({
                                      ...values,
                                      template: template,
                                      isTemplate: true,
                                    })
                                  }
                                  disabled={isSubmitting}
                                  className={clsx(
                                    "flex justify-center items-center border rounded bg-primary px-4 py-2 opacity-90 hover:opacity-100",
                                    {
                                      "text-black": isLightMode,
                                      "text-white": !isLightMode,
                                    }
                                  )}
                                >
                                  <PlusSVG />
                                  <div className="ml-2">Select Template</div>
                                </button>
                                <Link
                                  href={template.contentUrl}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                  className={clsx(
                                    "flex justify-center items-center border rounded mt-4 bg-secondary px-4 py-2 opacity-90 hover:opacity-100",
                                    {
                                      "text-black": isLightMode,
                                      "text-white": !isLightMode,
                                    }
                                  )}
                                >
                                  <EyeSVG />
                                  <div className="ml-2">Preview</div>
                                </Link>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      className={`flex mt-4 ${
                        step === 0 ? "justify-end" : "justify-between"
                      }`}
                    >
                      {step !== 0 && (
                        <button
                          type="button"
                          className="rounded border border-primary px-4 py-2 text-primary"
                          onClick={handleBack}
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
                        {step !== 9 && (
                          <button
                            type="button"
                            className="rounded bg-primary px-4 py-2 text-white"
                            disabled={isGenerating}
                            onClick={e => {
                              e.preventDefault();
                              if (
                                (!errors.businessName && step === 0) ||
                                (!errors.businessDescription && step === 1) ||
                                (!errors.businessGoal && step === 2) ||
                                (!errors.city && step === 3) ||
                                (!errors.isCustomerForm && step === 4) ||
                                (!errors.style && step === 5) ||
                                (!errors.isVideo && step === 6) ||
                                (!errors.imageFrom && step === 7) ||
                                (!errors.themeColor && step === 8)
                              )
                                handleUserInput(values);
                            }}
                          >
                            {isGenerating ? "Loading..." : "Next"}
                          </button>
                        )}
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </>
        )}
      </ModalPrompt>
    </div>
  );
};

export default NewAIWebsiteModal;
