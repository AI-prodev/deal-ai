import { Field, FieldArray, Form, Formik, FormikProps } from "formik";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import * as Yup from "yup";

import { ComponentFieldWithLabel, FieldWithLabel } from "./FieldWithLabel"; // make sure to import the new component

import ToneSelector from "./ToneSelector";
import ImageTypeSelector from "@/components/marketingHooks/ImageTypeSelector";
import Select from "react-select";
import {
  useStartHeroRequestMutation,
  useEndHeroRequestMutation,
  useQueryHeroRequestMutation,
} from "@/store/features/heroApi";

import {
  useStartImageRequestMutation,
  useQueryImageRequestMutation,
  useEndImageRequestMutation,
  useStartUrlRequestMutation,
  useQueryUrlRequestMutation,
  useEndUrlRequestMutation,
  useRateCreationMutation,
} from "@/store/features/marketingHooksApi";

import { ThesisBuildingProgress } from "../ThesisBuildingProgress";

import { showErrorToast, showErrorToastTimer } from "@/utils/toast";
import FormikCapsuleDropDown from "./CapsuleDropDown";

import { HookData } from "@/pages/apps/magic-hooks";

import { createFunnelApi } from "@/store/features/projectApi";
import {
  useLocalStorageForm,
  useSelectiveLocalStorageForm,
} from "@/hooks/useLocalStorageForm";

import { languages } from "@/utils/data/Languages";
import ImageStyleSelector from "./ImageStyleSelector";
import AspectRatioSelector from "./AspectRatioSelector";
import useServerTokenTracking, {
  updateIdeasRatingsInLocalStorage,
  updateRatingsInLocalStorage,
} from "@/hooks/useServerTokenTracking";
import VisionSelector from "./VisionSelector";
import VisionImageUpload from "./VisionImageUpload";
import VisionWebsiteInput from "./VisionWebsiteInput";
import { ImageListType } from "react-images-uploading";
import { ProcessBanner } from "../ProcessBanner";
import MaximumImpactToggles from "./MaximumImpactToggles";
import AnimateHeight from "react-animate-height";
import IdeaCard from "./IdeaCard";
import { Dialog } from "@headlessui/react";
import CreateIdeasButton from "./CreateIdeasButton";
import {
  useStartImageIdeasRequestMutation,
  useQueryImageIdeasRequestMutation,
  useEndImageIdeasRequestMutation,
} from "@/store/features/imageIdeasApi";
import IdeaNavigation from "./IdeaNavigation";
import StarRating from "./StarRating";
import IsolationSelector from "./IsolationSelector";

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
  heroDescription: string;
  tone: string;
  toneAdditionalInfo: string;
  aggressiveness: number;
  hookCreative: number;
  colours: string;
  imageType: string;
  imageStyle: string;
  targetAudience: string;
  language: string;
  aspectRatio: string;
  emotions: any[];
  impacts: any;
  businessDescription: string;
  isolation: string;
}

interface EmotionOption {
  value: string;
  label: string;
}

interface EmotionCategory {
  label: string;
  options: EmotionOption[];
}

const FormValidation = Yup.object().shape({
  heroDescription: Yup.string().required("Please enter the image idea"),
});
const BusinessFormValidation = Yup.object().shape({
  businessDescription: Yup.string().required(
    "Please enter the Business Description"
  ),
});

const HeroImageForms = ({
  hooksData,
  setHooksData,
  formatHookRatingData,
  hookRatingsId,
  appName,
  setAppDataLoading,
  projectId,
}: {
  hooksData: HookData[];
  setHooksData: React.Dispatch<React.SetStateAction<HookData[]>>;
  formatHookRatingData: () => string;
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

  const createInitialSwitches = (count: number) => {
    return [
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
    ];
  };

  const initialFormValues: FormValues = {
    heroDescription: "",
    tone: funnel?.settings?.tone || "",
    toneAdditionalInfo: funnel?.settings?.toneAdditionalInfo || "",
    aggressiveness: funnel?.settings?.aggressiveness || 8,
    hookCreative: funnel?.settings?.hookCreative || 10,
    targetAudience: funnel?.settings?.targetAudience || "everyone",
    colours: "",
    imageType: "",
    imageStyle: "",
    language: "English",
    aspectRatio: "Landscape (websites)",
    emotions: ["Intrigue"],
    impacts: createInitialSwitches(11),
    businessDescription: "",
    isolation: "Black",
  };

  const localStorageKeyShared = "sharedFormValues";
  const sharedFieldsToPersist: (keyof FormValues)[] = [
    "aggressiveness",
    "hookCreative",
    "targetAudience",
    "language",
    "businessDescription",
  ];
  const localStorageKeyForm = "heroFormValues";
  const formFieldsToPersist: (keyof FormValues)[] = [
    "heroDescription",
    "colours",
    "imageType",
    "imageStyle",
    "tone",
    "toneAdditionalInfo",
    "aspectRatio",
    "impacts",
    "emotions",
    "isolation",
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

  const [remainingTime, setRemainingTime] = useState(0);
  const [selectedTab, setSelectedTab] = useState<string>("Text");
  const [heroDescriptionText, setHeroDescriptionText] = useState(
    formValues.heroDescription
  );
  const [images, setImages] = useState<ImageListType>([]);
  const [visionIsLoading, setVisionIsLoading] = useState(false);
  const [adDescriptionId, setAdDescriptionId] = useState("");
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [hookRatingsIdeasId, setHookRatingsIdeaId] = useState<{
    [key: string]: number;
  }>({});
  const [ideaSource, setIdeaSource] = useState("user");

  let formikRef: { current: FormikProps<FormValues> | null } = {
    current: null,
  };
  let formikRefDesc: { current: FormikProps<any> | null } = {
    current: null,
  };
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  const [startHeroRequest, { isLoading: isStarting }] =
    useStartHeroRequestMutation();
  const [queryHeroRequest] = useQueryHeroRequestMutation();
  const [endHeroRequest] = useEndHeroRequestMutation();

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

  const {
    data: appDataImageIdeas,
    refetch: refetchAppDataImageIdeas,
    isLoading: isAppDataIdeasLoadingImage,
  } = useGetSpecifcAppsPojectAppNameQuery(
    {
      projectId: projectId,

      appName: "hero-image-ideas",
    },
    { skip: !projectId }
  );

  useEffect(() => {
    if (projectId) {
      refetchAppData();
      refetchAppDataImageIdeas();
    }
  }, [projectId]);

  const tokenKey = "heroRequestToken";
  const [rateCreation] = useRateCreationMutation();

  // useEffect(() => {
  //     updateRatingsInLocalStorage(hookRatingsId, tokenKey);
  // }, [hookRatingsId]);

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
        setHeroDescriptionText(parsedText);

        formikRef.current?.setFieldValue("heroDescription", parsedText);
        const values = { ...formValues, heroDescription: parsedText };
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
      setHeroDescriptionText(text);
      setImages([]);
      formikRef.current?.setFieldValue("heroDescription", text);
      const values = { ...formValues, heroDescription: text };
      setFormValues(values);
    } else {
      showErrorToast("No data found for the provided URL.");
      setHeroDescriptionText("");
      formikRef.current?.setFieldValue("heroDescription", "");
    }
  };

  const { startAndTrack, isLoading, generationCount } = useServerTokenTracking({
    //@ts-ignore
    startRequest: startHeroRequest,
    //@ts-ignore
    queryRequest: queryHeroRequest,
    //@ts-ignore
    endRequest: endHeroRequest,
    tokenKey: tokenKey,
    onEndResponse: handleEndResponse,
    hookRatings: hookRatingsId,
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
    if (formValues.businessDescription) {
      setBusinessDescriptionInput(formValues.businessDescription);
    }
    if (formValues.heroDescription) {
      setHeroDescriptionText(formValues.heroDescription);
    }
  }, [formValues]);

  const submitForm = async (values: FormValues) => {
    values.heroDescription === heroDescriptionText;
    setFormValues(values);
    manuallyUpdateFormValues(values);
    setRemainingTime(180);

    const empotions = values.emotions.join(", ");
    //const formattedRatingHooks = formatHookRatingData();
    const submissionData = {
      ...values,
      heroDescription: heroDescriptionText,
      emotions: empotions,
    };

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
  const emotionCategories: { [category: string]: string[] } = {
    "Frequently Used": [
      "Intrigue",
      "Desire",
      "Tranquility",
      "Beauty",
      "Puzzlement",
      "Frustration",
    ],
    "Positive Feelings": [
      "Inspiration",
      "Happiness",
      "Love",
      "Amusement",
      "Satisfaction",
      "Pride",
      "Excitement",
      "Elation",
      "Enthusiasm",
      "Cheerfulness",
      "Hope",
      "Contentment",
      "Optimism",
      "Gratitude",
      "Serenity",
      "Admiration",
      "Eagerness",
      "Delight",
      "Bliss",
      "Wisdom",
      "Empathy",
      "Compassion",
      "Luxury",
      "Affection",
      "Curiosity",
      "Confidence",
      "Triumph",
      "Euphoria",
      "Fulfillment",
      "Relief",
      "Peacefulness",
      "Wonder",
      "Interest",
      "Altruism",
      "Empowerment",
      "Awe",
      "Fascination",
      "Respect",
      "Warmth",
      "Vitality",
      "Liveliness",
      "Zest",
      "Health",
      "Deliciousness",
      "Passion",
      "Playfulness",
      "Humor",
      "Wealth",
      "Enchantment",
      "Exhilaration",
      "Charm",
      "Glee",
      "Spontaneity",
      "Youth",
    ],
    "Neutral/Mixed Emotions": [
      "Nostalgia",
      "Melancholy",
      "Anticipation",
      "Tension",
      "Surprise",
      "Ambivalence",
      "Thoughtfulness",
      "Humility",
      "Yearning",
      "Wistfulness",
      "Calmness",
      "Reflection",
      "Patience",
      "Neutrality",
      "Expectancy",
      "Bittersweet",
      "Solitude",
    ],
    "Negative Emotions": [
      "Frustration",
      "Annoyance",
      "Disappointment",
      "Regret",
      "Sadness",
      "Despair",
      "Displeasure",
      "Anguish",
      "Anxiety",
      "Fear",
      "Dread",
      "Nervousness",
      "Trepidation",
      "Worry",
      "Doubt",
      "Guilt",
      "Shame",
      "Embarrassment",
      "Discontent",
      "Boredom",
      "Loneliness",
      "Resentment",
      "Envy",
      "Jealousy",
      "Anger",
      "Rage",
      "Hostility",
      "Contempt",
      "Disgust",
      "Revulsion",
    ],
  };
  const emotionOptions: EmotionCategory[] = Object.entries(
    emotionCategories
  ).map(([category, emotions]) => ({
    label: category,
    options: emotions.map(emotion => ({ value: emotion, label: emotion })),
  }));
  const formatGroupLabel = (data: EmotionCategory) => (
    <div style={{ fontWeight: "bold", fontSize: "1.1em", color: "white" }}>
      {data.label}
    </div>
  );
  const toOption = (emotionValue: string): EmotionOption | null => {
    for (const category in emotionCategories) {
      const foundEmotion = emotionCategories[category].find(
        emotion => emotion === emotionValue
      );
      if (foundEmotion) {
        return { value: foundEmotion, label: foundEmotion };
      }
    }
    return null;
  };

  const defaultEmotion = emotionOptions
    .flatMap(category => category.options)
    .find(option => option.value === "Intrigue");
  const getOptionsForSelect = (index: number, selectedEmotions: string[]) => {
    return emotionOptions.flatMap(category => ({
      ...category,
      options: category.options.filter(
        option => !selectedEmotions.includes(option.value)
      ),
    }));
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

  const [ideas, setIdeas] = useState<any[]>([]);
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState(0);
  const [businessDescriptionInput, setBusinessDescriptionInput] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [startImageIdeasRequest] = useStartImageIdeasRequestMutation();
  const [queryImageIdeasRequest] = useQueryImageIdeasRequestMutation();
  const [endImageIdeasRequest] = useEndImageIdeasRequestMutation();
  const tokenKeyImageIdae = "imageIdeasRequestTokenHero";

  const handleGenerateIdeasClick = () => {
    let businessDescription = formValues?.businessDescription;

    if (!businessDescription) {
      setShowModal(true);
      return;
    }

    if (currentIdeaIndex >= ideas.length - 1) {
      fetchIdeas(businessDescription);
      setCurrentIdeaIndex(-1);
    } else {
      setCurrentIdeaIndex(prevIndex => prevIndex + 1);
      insertNextIdea();
    }
  };

  useEffect(() => {
    if (formikRef.current) {
      formikRef.current.setFieldValue("heroDescription", heroDescriptionText);
    }
  }, [heroDescriptionText, formikRef]);

  const handleEndIdeaResponse = (data: any) => {
    if (data && data.response) {
      refetchAppDataImageIdeas();
      // setIdeas(data.response);
      // setCurrentIdeaIndex(0);
      // insertIdeaIntoForm(data.response[0]);
      setIdeaSource("system");
    }
  };

  const insertNextIdea = () => {
    if (currentIdeaIndex < ideas.length) {
      const nextIdea = ideas[currentIdeaIndex];
      formikRef.current?.setFieldValue("heroDescription", nextIdea);
      setHeroDescriptionText(nextIdea);
      setCurrentIdeaIndex(currentIdeaIndex + 1);
      setIdeaSource("system");
      setAdDescriptionId(nextIdea.id);
    }
  };

  const { startAndTrack: startAndTrackImageIdeas, isLoading: isGenerating } =
    useServerTokenTracking({
      //@ts-ignore
      startRequest: startImageIdeasRequest,
      //@ts-ignore
      queryRequest: queryImageIdeasRequest,
      //@ts-ignore
      endRequest: endImageIdeasRequest,
      tokenKey: tokenKeyImageIdae,
      onEndResponse: handleEndIdeaResponse,

      geneationType: true,
      // hookRatings: hookRatingsId,
      projectId: projectId,
      appName: "hero-image-ideas",
      appData: appDataImageIdeas,
    });

  const fetchIdeas = (description: string) => {
    startAndTrackImageIdeas({ businessDescription: description });
  };

  // useEffect(() => {
  //     const savedGenerations = JSON.parse(
  //         localStorage.getItem(`${tokenKeyImageIdae}Generations`) || "[]"
  //     );

  //     if (savedGenerations.length > 0) {
  //         setIdeas(savedGenerations);
  //         setCurrentIdeaIndex(0);
  //         // setCurrentIdeaIndex((prevIndex) => {
  //         //   return prevIndex + 1;
  //         // });
  //         insertIdeaIntoForm(savedGenerations[0]);
  //     }
  // }, []);

  const handleModalSubmit = (values: any) => {
    // localStorage.setItem(
    //     "imageBusinessDescription",
    //     values.businessDescription
    // );
    setFormValues({
      ...formValues,
      businessDescription: values.businessDescription,
    });
    setShowModal(false);
    handleGenerateIdeasClick();
  };
  const insertIdeaIntoForm = (idea: {
    result: string;
    id: string;
    rating: number;
  }) => {
    formikRef.current?.setFieldValue("heroDescription", idea);
    setHeroDescriptionText(idea.result);
    setAdDescriptionId(idea.id);
    setHookRatingsIdeaId({
      ...hookRatingsIdeasId,
      [idea.id]: idea?.rating,
    });
    setIdeaSource("system");
  };

  const [displayCount, setDisplayCount] = useState(5);

  const handleGetMoreIdeas = () => {
    setDisplayCount(prevCount => prevCount + 5);
  };
  const handleIdeaNavigationChange = (change: number) => {
    const newIndex = Math.max(
      0,
      Math.min(ideas.length - 1, currentIdeaIndex + change)
    );
    setCurrentIdeaIndex(newIndex);
    insertIdeaIntoForm(ideas[newIndex]);
  };

  const handleRatingChange = async (
    hookText: string,
    newRating: number,
    hookId: string
  ) => {
    setLoadingStates({ ...loadingStates, [hookId]: true });

    //   setHookRatings({ ...hookRatings, [hookText]: newRating });
    setHookRatingsIdeaId({ ...hookRatingsIdeasId, [hookId]: newRating });

    updateIdeasRatingsInLocalStorage(
      { [hookId]: newRating },
      tokenKeyImageIdae
    );
    setIdeas(
      ideas.map((idea, index) => {
        if (index === currentIdeaIndex) {
          return { ...idea, rating: newRating };
        }
        return idea;
      })
    );
    try {
      const response = await rateCreation({
        creationId: hookId,
        rating: newRating,
      }).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStates({ ...loadingStates, [hookId]: false });
    }
  };

  const { isMigrationNeeded, isMigrationSuccess } = useDataMigration(
    tokenKey,
    appName
  );

  const {
    isMigrationNeeded: isIdeaMigrationNeeded,
    isMigrationSuccess: isIdeaMigrationSuccess,
  } = useDataMigration(tokenKeyImageIdae, "ad-social-image-ideas");

  useEffect(() => {
    if (isIdeaMigrationNeeded) {
      console.error("Idea Data migration is needed.", isIdeaMigrationNeeded);
    }
    if (isIdeaMigrationSuccess) {
      refetchAppDataImageIdeas();
    }
  }, [isIdeaMigrationNeeded]);

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
    const newGenerations = appData?.generations.map((gen: any) => {
      const sortedCreations = [...gen?.creations]
        .sort((a: any, b: any) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        })
        .map((hook: any) => {
          const output = {
            url: hook.output?.url,
            id: hook._id,
            rating: hook.rating,
            input: {
              aspectRatio: hook.input?.aspectRatio,
            },
            editedUrl: hook?.output?.editedUrl?.url,
          };
          return output;
        });

      return {
        id: gen.generationNumber,
        hooks: sortedCreations,
      };
    });

    setHooksData(newGenerations || []);
  }, [appData, isAppDataLoading]);

  useEffect(() => {
    if (appDataImageIdeas) {
      const newGenerations = appDataImageIdeas?.generations.flatMap(
        (gen: any) =>
          gen.creations.map((creation: any) => ({
            result: creation.output,
            id: creation._id,
            rating: creation?.rating,
          }))
      );

      setIdeas(newGenerations ? newGenerations : []);
      if (newGenerations.length > 0) {
        setHeroDescriptionText(newGenerations[0].result);
        setAdDescriptionId(newGenerations[0].id);
        setCurrentIdeaIndex(0);
        formikRef.current?.setFieldValue(
          "heroDescription",
          newGenerations[0].result
        );
      }
    }
  }, [appDataImageIdeas]);

  if (isAppDataLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {!isGenerating && (
        <>
          {currentIdeaIndex >= ideas.length - 1 && (
            <CreateIdeasButton
              onClick={handleGenerateIdeasClick}
              isGenerating={isGenerating}
              isGenerated={currentIdeaIndex < ideas.length - 1}
            >
              {currentIdeaIndex < ideas.length - 1
                ? "Next"
                : "Create Image Ideas"}
            </CreateIdeasButton>
          )}
          {currentIdeaIndex <= ideas.length - 1 && (
            <IdeaNavigation
              totalIdeas={ideas.length}
              currentIdeaIndex={currentIdeaIndex}
              onIdeaChange={handleIdeaNavigationChange}
            />
          )}
        </>
      )}

      {showModal && (
        <Dialog open={showModal} onClose={() => setShowModal(false)}>
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto w-full overflow-auto rounded-lg bg-black p-4 text-white shadow-lg sm:max-w-md sm:p-6 md:max-w-lg lg:max-w-lg xl:max-w-2xl">
              <Formik
                initialValues={{ businessDescription: "" }}
                validationSchema={BusinessFormValidation}
                onSubmit={handleModalSubmit}
                innerRef={formikInstance => {
                  formikRefDesc.current = formikInstance;
                }}
              >
                {({ errors, submitCount, touched, values, setFieldValue }) => (
                  <Form>
                    <div className="mt-2">
                      <FieldWithLabel
                        name="businessDescription"
                        label="Business Description"
                        component="textarea"
                        id="businessDescription"
                        value={
                          formikRefDesc.current?.values.businessDescription ||
                          businessDescriptionInput
                        }
                        onChange={(
                          e: React.ChangeEvent<HTMLTextAreaElement>
                        ) => {
                          const newValue = e.target.value;
                          setBusinessDescriptionInput(newValue);
                          formikRefDesc.current?.setFieldValue(
                            "businessDescription",
                            newValue
                          );
                        }}
                        className="form-input  whitespace-pre-wrap text-white"
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
                    </div>
                    <div className="mt-4">
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                      >
                        Save Description
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}

      {/* <div className="my-4">
        {ideas.length > 0 && currentIdeaIndex <= ideas.length && (
          <IdeaCard
            title={`Idea ${currentIdeaIndex + 1}`}
            description={ideas[currentIdeaIndex]}
            onClick={() => insertIdeaIntoForm(ideas[currentIdeaIndex])}
          />
        )}
      </div> */}
      {isGenerating && (
        <ProcessBanner description="Please wait, this may take up to three minutes." />
      )}
      <Formik
        initialValues={formValues}
        enableReinitialize={true}
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
            <div className="mt-4">
              {visionIsLoading && <ProcessBanner />}

              {ideaSource === "system" && !isLoading && (
                <div className="mb-[-20px] flex justify-end">
                  <StarRating
                    rating={hookRatingsIdeasId[adDescriptionId] || 0}
                    setRating={rating =>
                      handleRatingChange(
                        heroDescriptionText,
                        rating,
                        adDescriptionId
                      )
                    }
                    isLoading={loadingStates[adDescriptionId] || false}
                  />
                </div>
              )}
              <FieldWithLabel
                name="heroDescription"
                label="Image idea"
                component="textarea"
                id="heroDescription"
                value={heroDescriptionText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  const newValue = e.target.value;
                  setHeroDescriptionText(newValue);
                  formikRef.current?.setFieldValue("heroDescription", newValue);
                  setIdeaSource("user");
                }}
                className="form-input  whitespace-pre-wrap"
                rows={4}
                style={{ height: "90px" }}
                tooltipContent="Describe what you would like to see in the image (for example, for a carwash this could be 'a gleaming car tyre', or for a restaurant it could be 'a delicious plate of food')."
              />
            </div>

            {submitCount
              ? errors.heroDescription && (
                  <div className="mt-1 text-danger">
                    {errors.heroDescription}
                  </div>
                )
              : ""}

            <Tippy
              content={
                "We recommend picking a single emotion (default is 'intrigue'). You can select up to three, but results might be unusual when combining multiple emotions. Experiment and see what works for your brand!"
              }
              placement="top"
            >
              <label htmlFor={"dimensionsOfNeed"} className="w-fit space-y-0">
                Emotions
              </label>
            </Tippy>

            <FieldArray
              name="emotions"
              render={({ insert, remove, form }) => (
                <div className="pb-4">
                  {values.emotions.length === 0 ? (
                    <div className="flex w-full items-center py-2">
                      <div className="custom-select2 w-10/12">
                        <Select
                          options={emotionOptions}
                          name={`emotions[0]`}
                          value={defaultEmotion}
                          onChange={(option: EmotionOption | null) =>
                            option &&
                            form.setFieldValue(`emotions[0]`, option.value)
                          }
                          defaultValue={defaultEmotion}
                          isSearchable={true}
                          formatGroupLabel={formatGroupLabel}
                          styles={{
                            menuPortal: base => ({
                              ...base,
                              zIndex: 9999,
                              color: "#808080",
                            }),
                            menu: provided => ({
                              ...provided,
                              backgroundColor: "#1b2e4b",
                              color: "#808080",
                            }),
                            option: (provided, state) => ({
                              ...provided,
                              backgroundColor: state.isFocused
                                ? "#FFFF"
                                : provided.backgroundColor,
                              color: state.isFocused
                                ? "#000000"
                                : provided.color,
                              // Add other hover styles here
                            }),
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => insert(values.emotions.length + 1, "")}
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
                    values.emotions.map((emotion, index) => (
                      <div
                        key={`emotion-${index}`}
                        className="flex w-full items-center py-2"
                      >
                        <div className="custom-select :h w-10/12">
                          <Select
                            options={getOptionsForSelect(
                              index,
                              values.emotions
                            )}
                            name={`emotions[${index}]`}
                            value={toOption(emotion)}
                            onChange={(option: EmotionOption | null) =>
                              option &&
                              form.setFieldValue(
                                `emotions[${index}]`,
                                option.value
                              )
                            }
                            defaultValue={index === 0 ? defaultEmotion : null}
                            styles={{
                              input: provided => ({
                                ...provided,
                                color: "white",
                              }),
                              menuPortal: base => ({
                                ...base,
                                zIndex: 9999,
                              }),
                              menu: provided => ({
                                ...provided,
                                backgroundColor: "#1b2e4b",
                                color: "#FFF",
                              }),
                              option: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isFocused
                                  ? "#FFFF"
                                  : provided.backgroundColor,
                                color: state.isFocused
                                  ? "#000000"
                                  : provided.color,
                              }),
                            }}
                            isSearchable={true}
                            formatGroupLabel={formatGroupLabel}
                          />
                        </div>
                        {index === values.emotions.length - 1 &&
                          values.emotions.length < 3 && (
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
                        {values.emotions.length > 1 && (
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

            <>
              <IsolationSelector
                setFieldValue={setFieldValue}
                values={values}
                tooltipContent="Isolation helps to create a plain background for your image. As well as making your image stand out and be more eye-catching, this also tends to add plain space at the top and bottom of your image (or both!), which is useful for adding text. Isolation works better with simple subjects - e.g. 'an elephant' instead of 'an elephant roaming the serengeti, surrounded by foliage and other animals'. Choose a color to bias the isolated area towards that color."
                tooltipContentIconLink={`    
                https://help.deal.ai/en/articles/8870949-how-to-isolate-images
                   `}
              />
            </>

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
                        <MaximumImpactToggles
                          name="impacts"
                          title=" Maximum Emotional Power"
                          description="Select the elements you want to maximize in your hero image. We recommend leaving it on, but you can customize each aspect below. To quickly return to default, use the master toggle above."
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

                      <AspectRatioSelector
                        tooltipContent={
                          "Aspect Ratio: Sets the image's aspect ratio (length vs width)"
                        }
                        setFieldValue={setFieldValue}
                        values={values}
                        defaultTone={formValues.aspectRatio}
                      />

                      <ImageTypeSelector
                        tooltipContent={
                          "Type: Sets the image's type. Default is 'Photograph'. Adjust according to the image's intended impact."
                        }
                        setFieldValue={setFieldValue}
                        values={values}
                        defaultTone={formValues.imageType}
                      />

                      <ImageStyleSelector
                        tooltipContent={
                          "Style: Sets the image's style. Default is 'Realistic'. Adjust according to the image's intended impact."
                        }
                        setFieldValue={setFieldValue}
                        values={values}
                        defaultTone={formValues.imageStyle}
                      />

                      <ComponentFieldWithLabel
                        name="colours"
                        label="Do you have any preferred colors that you want to use in your image? (Optional)"
                        tooltipContent={`Do you have any preferred colors that you want to use in your image?`}
                        component={FormikCapsuleDropDown}
                        id="colours"
                        suggestions={[
                          "Red",
                          "Orange",
                          "Yellow",
                          "Green",
                          "Blue",
                          "Indigo",
                          "Violet",
                          "Black and White (Monochrome)",
                          "Greyscale",
                          "Sepia",
                          "Pastel",
                        ]}
                        defaultValue={formValues.colours}
                      />
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
                  ? "Create Another Hero Image "
                  : "Create a Hero Image"}
              </button>
            )}
          </Form>
        )}
      </Formik>
    </>
  );
};

export default HeroImageForms;
