import { Field, Form, Formik, FormikProps } from "formik";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import * as Yup from "yup";
import { Dialog, Switch } from "@headlessui/react";
import { ComponentFieldWithLabel, FieldWithLabel } from "./FieldWithLabel"; // make sure to import the new component

import {
  useStartAdSocialImageRequestMutation,
  useEndAdSocialImageRequestMutation,
  useQueryAdSocialImageRequestMutation,
} from "@/store/features/adSocialImageApi";

import { ThesisBuildingProgress } from "../ThesisBuildingProgress";

import { showErrorToast, showErrorToastTimer } from "@/utils/toast";
import FormikCapsuleDropDown from "./CapsuleDropDown";
import { ToggleField } from "./ToggleField";

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
import AspectRatioSelectorAdSocial from "./AspectRatioSelectorAdSocial";
import MaximumImpactToggles from "./MaximumImpactToggles";
import ImageTypeSelectorAdSocial from "./ImageTypeSelectorAdSocial";

import { ImageListType } from "react-images-uploading";
import { ProcessBanner } from "../ProcessBanner";
import {
  useStartImageRequestMutation,
  useQueryImageRequestMutation,
  useEndImageRequestMutation,
  useStartUrlRequestMutation,
  useQueryUrlRequestMutation,
  useEndUrlRequestMutation,
  useRateCreationMutation,
} from "@/store/features/marketingHooksApi";
import AnimateHeight from "react-animate-height";
import CreateIdeasButton from "./CreateIdeasButton";
import {
  useStartImageIdeasRequestMutation,
  useQueryImageIdeasRequestMutation,
  useEndImageIdeasRequestMutation,
} from "@/store/features/imageIdeasApi";
import IdeaCard from "./IdeaCard";
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
  adDescription: string;
  colours: string;
  imageType: string;
  imageStyle: string;
  targetAudience: string;
  aspectRatio: string;
  impacts: any;
  instructions: string;
  experimental: boolean;

  businessDescription: string;
  aggressiveness: number;
  hookCreative: number;
  language: string;
  isolation: string;
}

const FormValidation = Yup.object().shape({
  adDescription: Yup.string().required("Please enter the image idea"),
});
const BusinessFormValidation = Yup.object().shape({
  businessDescription: Yup.string().required(
    "Please enter the Business Description"
  ),
});

const AdSocialImageForms = ({
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
      { "Vivid Colors and Contrasts": true },
      { "Focus on Composition": true },
      { "Incorporate Movement or Action": true },
      { "Clarity and Simplicity": true },
      { "Use of Scale and Perspective": true },
      { "Emotional Appeal": true },
      { "Innovative or Unexpected Elements": true },
      { "Use Negative Space": true },
      { "Texture and Patterns": true },
      { "Psychological Triggers": true },
      { "Sensory Appeal": true },
    ];
  };

  const localStorageKeyShared = "sharedFormValues";
  const sharedFieldsToPersist: (keyof FormValues)[] = [
    "businessDescription",
    "aggressiveness",
    "hookCreative",
    "targetAudience",
    "language",
  ];
  const localStorageKeyForm = "adSocialFormValues";
  const formFieldsToPersist: (keyof FormValues)[] = [
    "colours",
    "imageType",
    "imageStyle",
    "aspectRatio",
    "impacts",
    "instructions",
    "experimental",
    "adDescription",
    "isolation",
  ];
  const initialFormValues: FormValues = {
    adDescription: "",
    targetAudience: funnel?.settings?.targetAudience || "everyone",
    colours: "",
    imageType: "",
    imageStyle: "",
    aspectRatio: "Portrait (Stories / Reel)",
    impacts: createInitialSwitches(11),
    instructions: "",
    experimental: false,
    businessDescription: "",
    aggressiveness: funnel?.settings?.aggressiveness || 8,
    hookCreative: funnel?.settings?.hookCreative || 10,
    language: "English",
    isolation: "Black",
  };

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
  const [adDescriptionText, setAdDescription] = useState(
    formValues.adDescription
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
    useStartAdSocialImageRequestMutation();
  const [queryHeroRequest] = useQueryAdSocialImageRequestMutation();
  const [endHeroRequest] = useEndAdSocialImageRequestMutation();
  const [startImageRequest] = useStartImageRequestMutation();
  const [queryImageRequest] = useQueryImageRequestMutation();
  const [endImageRequest] = useEndImageRequestMutation();
  const [startUrlRequest] = useStartUrlRequestMutation();
  const [queryUrlRequest] = useQueryUrlRequestMutation();
  const [endUrlRequest] = useEndUrlRequestMutation();

  const [instructionsCheck, setInstructionsCheck] = React.useState(false);

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

      appName: "ad-social-image-ideas",
    },
    { skip: !projectId }
  );

  useEffect(() => {
    if (projectId) {
      refetchAppData();
      refetchAppDataImageIdeas();
    }
  }, [projectId]);

  const tokenKey = "adSocialRequestToken";
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
        setAdDescription(parsedText);

        formikRef.current?.setFieldValue("adDescription", parsedText);
        const values = { ...formValues, adDescription: parsedText };
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
      setAdDescription(text);
      setImages([]);
      formikRef.current?.setFieldValue("adDescription", text);
      const values = { ...formValues, adDescription: text };
      setFormValues(values);
    } else {
      showErrorToast("No data found for the provided URL.");
      setAdDescription("");
      formikRef.current?.setFieldValue("adDescription", "");
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
    if (formValues.instructions) {
      setInstructionsCheck(true);
    } else {
      setInstructionsCheck(false);
    }
    if (formValues?.businessDescription) {
      setBusinessDescriptionInput(formValues.businessDescription);
    }
    if (formValues?.adDescription) {
      setAdDescription(formValues.adDescription);
    }
  }, [formValues]);

  const submitForm = async (values: FormValues) => {
    values.adDescription = adDescriptionText;
    setFormValues(values);
    manuallyUpdateFormValues(values);
    setRemainingTime(180);

    //const formattedRatingHooks = formatHookRatingData();
    const submissionData = {
      ...values,
      adDescriptionText: adDescriptionText,
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
  const tokenKeyImageIdae = "imageIdeasRequestTokenAd";
  const [rateCreation] = useRateCreationMutation();

  const handleGenerateIdeasClick = () => {
    // let businessDescription = //@ts-ignore
    //     JSON.parse(localStorage.getItem("sharedFormValues"))
    //         .businessDescription ||
    //     localStorage.getItem("imageBusinessDescription");
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
      formikRef.current.setFieldValue("adDescription", adDescriptionText);
    }
  }, [adDescriptionText, formikRef]);

  const insertNextIdea = () => {
    if (currentIdeaIndex < ideas.length) {
      const nextIdea = ideas[currentIdeaIndex];
      formikRef.current?.setFieldValue("adDescription", nextIdea);
      setAdDescription(nextIdea);
      setCurrentIdeaIndex(0);
      setIdeaSource("system");
      setAdDescriptionId(nextIdea.id);
    }
  };
  const handleEndIdeaResponse = (data: any) => {
    if (data && data.response) {
      refetchAppDataImageIdeas();
      setIdeaSource("system");

      // setIdeas(data.response);

      // setCurrentIdeaIndex(0);
      // insertIdeaIntoForm(data.response[0]);
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
      appName: "ad-social-image-ideas",
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
  //         // setCurrentIdeaIndex((prevIndex) => {
  //         //   return prevIndex + 1;
  //         // });
  //         setCurrentIdeaIndex(0);
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
    formikRef.current?.setFieldValue("adDescription", idea);
    setAdDescription(idea.result);
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
    setAppDataLoading(isAppDataLoading);

    const newGenerations = appData?.generations.map((gen: any) => {
      const sortedCreations = gen?.creations
        ? [...gen.creations].sort((a: any, b: any) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          })
        : [];

      const hooks = sortedCreations.map((hook: any) => {
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
        hooks: hooks,
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
        setAdDescription(newGenerations[0].result);
        setAdDescriptionId(newGenerations[0].id);
        setCurrentIdeaIndex(0);
        formikRef.current?.setFieldValue(
          "adDescription",
          newGenerations[0].result
        );
      } else {
        setIdeaSource("user");
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
                //  enableReinitialize={true}
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
                        className="form-input whitespace-pre-wrap text-white"
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
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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

      <div className="my-4">
        {/* {ideas.slice(0, displayCount).map((idea, index) => (
          <IdeaCard
            key={index}
            title={`Idea ${index + 1}`}
            description={idea}
            onClick={() => {
              insertIdeaIntoForm(idea);
            }}
          />
        ))}
        {displayCount < ideas.length && (
          <button
            className="mt-4 w-full rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-700"
            onClick={handleGetMoreIdeas}
          >
            Get More Ideas
          </button>
        )} */}
        {/* {ideas.length > 0 && currentIdeaIndex <= ideas.length && (
          <IdeaCard
            title={`Idea ${currentIdeaIndex + 1}`}
            description={ideas[currentIdeaIndex]}
            onClick={() => insertIdeaIntoForm(ideas[currentIdeaIndex])}
          />
        )} */}
      </div>
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
                        adDescriptionText,
                        rating,
                        adDescriptionId
                      )
                    }
                    isLoading={loadingStates[adDescriptionId] || false}
                  />
                </div>
              )}
              <FieldWithLabel
                name="adDescription"
                label="Image idea"
                component="textarea"
                id="adDescription"
                value={adDescriptionText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  const newValue = e.target.value;
                  setAdDescription(newValue);
                  formikRef.current?.setFieldValue("adDescription", newValue);
                  setIdeaSource("user");
                }}
                className="form-input  whitespace-pre-wrap"
                rows={4}
                style={{ height: "90px" }}
                tooltipContent="Example: Let’s say you’re launching an ad for a hypothetical stock market trading app (similar to Robinhood or E*Trade). The hook for this hypothetical app might be something like: “When the bull market returns, you wanna be ready!”.  To find a scroll-stopping image to go with this hook, simply type in: 'A bull with a hint of technology. Keep the background simple and black.' Do NOT give it instructions to be attention-getting etc in this field. This app is already fine tuned to have maximum eye-catching power, you don’t want to interfere with it. Then run the app 10 times by pressing the “Create Scroll-Stopping Ad” at the bottom over and over again. Pick the most eye-catching result. Overlay your hook on top of that image and your ad is ready to go."
              />
            </div>

            {submitCount
              ? errors.adDescription && (
                  <div className="mt-1 text-danger">{errors.adDescription}</div>
                )
              : ""}

            <>
              <IsolationSelector
                setFieldValue={setFieldValue}
                values={values}
                tooltipContent="Isolation helps to create a plain background for your image. As well as making your image stand out and be more eye-catching, this also tends to add plain space at the top and bottom of your image (or both!), which is useful for adding text. Isolation works better with simple subjects - e.g. 'an elephant' instead of 'an elephant roaming the serengeti, surrounded by foliage and other animals'. Choose a color to bias the isolated area towards that color."
                tooltipContentIconLink={`    
                https://help.deal.ai/en/articles/8870949-how-to-isolate-images"
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
                        <MaximumImpactToggles name="impacts" />
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

                      <AspectRatioSelectorAdSocial
                        tooltipContent={
                          "Aspect Ratio: Sets the image's aspect ratio (length vs width)"
                        }
                        setFieldValue={setFieldValue}
                        values={values}
                        defaultTone={formValues.aspectRatio}
                      />

                      <ImageTypeSelectorAdSocial
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
                  ? "Create Another Scroll-Stopping Ad "
                  : "Create a Scroll-Stopping Ad"}
              </button>
            )}
          </Form>
        )}
      </Formik>
    </>
  );
};

export default AdSocialImageForms;
