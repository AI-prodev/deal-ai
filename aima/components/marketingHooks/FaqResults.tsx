import { HookData } from "@/pages/apps/magic-hooks";
import Tippy from "@tippyjs/react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

import StarRating from "./StarRating";
import { useBenefitStackRateCreationMutation } from "@/store/features/benefitStacksApi";
import { getUniqueGenerations } from "@/utils/uniqueGeneration";
import {
  deleteGenerationById,
  deleteHookById,
} from "@/hooks/useServerTokenTracking";
import {
  useDeleteSpecificCreationMutation,
  useDeleteSpecificGenerationMutation,
  useGetSpecifcAppsPojectAppNameQuery,
} from "@/store/features/appsProjectApi";

export const FaqResults = ({
  hooksData,
  hookRatings,
  setHookRatings,
  submissionData,
  hookRatingsId,
  setHookRatingsId,
  setHooksData,
  appName,
  projectId,
}: {
  hooksData: HookData[];
  hookRatings: { [key: string]: number };
  submissionData: any;
  setHookRatings: React.Dispatch<
    React.SetStateAction<{ [key: string]: number }>
  >;
  hookRatingsId: { [key: string]: number };
  setHookRatingsId: React.Dispatch<
    React.SetStateAction<{ [key: string]: number }>
  >;
  setHooksData: React.Dispatch<React.SetStateAction<HookData[]>>;
  appName: string;
  projectId: string;
}) => {
  const router = useRouter();
  const [displayCount, setDisplayCount] = useState(20);
  const [copiedData, setCopiedData] = useState("");

  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

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

  const [rateCreation] = useBenefitStackRateCreationMutation();
  const handleCopy = (hook: any) => {
    const hookData = `${hook.q} - ${hook.a}`;
    setCopiedData(hookData);
    navigator.clipboard.writeText(hookData);
  };

  const handleRatingChange = async (
    hookText: string,
    newRating: number,
    hookId: string
  ) => {
    setLoadingStates({ ...loadingStates, [hookId]: true });

    setHookRatings({ ...hookRatings, [hookText]: newRating });
    setHookRatingsId({ ...hookRatingsId, [hookId]: newRating });

    try {
      const response = await rateCreation({
        creationId: hookId,
        rating: newRating,
      }).unwrap();
      refetchAppData().unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStates({ ...loadingStates, [hookId]: false });
    }
  };
  const handleCopyAll = (generationId: number) => {
    const generationHooks = hooksData.find(
      gen => gen.id === generationId
    )?.hooks;
    if (generationHooks) {
      const hooksText = generationHooks
        .map(hook => `${hook.q} - ${hook.a}`)
        .join("\n");
      navigator.clipboard.writeText(hooksText);
    }
  };
  const tokenKey = "faqRequestToken";
  // useEffect(() => {
  //   const savedGenerations: HookData[] = JSON.parse(
  //     localStorage.getItem(`${tokenKey}Generations`) || "[]",
  //   );

  //   const newHookRatings: { [key: string]: number } = {};
  //   savedGenerations.forEach((generation) => {
  //     generation.hooks.forEach((hook) => {
  //       if (hook.rating !== undefined) {
  //         const hookKey = "Question: " + hook.q + ", Answer: " + hook.a;
  //         newHookRatings[hookKey] = hook.rating;
  //       }
  //     });
  //   });

  //   setHookRatings(newHookRatings);
  // }, []);

  // const handleDeleteGenerationById = (id: number) => {
  //   deleteGenerationById(id, tokenKey);
  //   const savedGenerations = JSON.parse(
  //     localStorage.getItem(`${tokenKey}Generations`) || "[]",
  //   ) as HookData[];

  //   const reversedGenerations = [...savedGenerations].sort(
  //     (a, b) => b.id - a.id,
  //   );

  //   setHooksData(reversedGenerations);
  // };
  // const handleHookDeleteationById = (generationId: number, hookId: string) => {
  //   deleteHookById(generationId, hookId, tokenKey);
  //   const savedGenerations = JSON.parse(
  //     localStorage.getItem(`${tokenKey}Generations`) || "[]",
  //   ) as HookData[];

  //   const reversedGenerations = [...savedGenerations].sort(
  //     (a, b) => b.id - a.id,
  //   );

  //   setHooksData(reversedGenerations);
  // };

  const [deleteSpecificGeneration, { isLoading: isGeneratingDeleting }] =
    useDeleteSpecificGenerationMutation();
  const [deleteSpecificCreation, { isLoading: isCreationDeleting }] =
    useDeleteSpecificCreationMutation();

  const handleDeleteGenerationById = async (generationNumber: number) => {
    try {
      await deleteSpecificGeneration({
        projectId,
        appName,
        generationNumber,
      }).unwrap();
      refetchAppData();
    } catch (error) {
      console.error("Failed to delete generation:", error);
    }
  };

  const handleHookDeletionById = async (
    generationNumber: number,
    creationId: string
  ) => {
    try {
      await deleteSpecificCreation({
        projectId,
        appName,
        generationNumber,
        creationId,
      }).unwrap();
      refetchAppData();
    } catch (error) {
      console.error("Failed to delete creation:", error);
    }
  };
  return (
    <div className="container mx-auto bg-opacity-80 px-1 py-8 md:px-4">
      {hooksData.length > 0 && (
        <div className="space-y-6">
          {getUniqueGenerations(hooksData).map((generation, genIndex) => (
            <section
              key={genIndex}
              className="rounded-lg bg-white bg-opacity-10 p-2 shadow-md md:p-6"
            >
              <div className="flex items-center justify-between p-2 md:mb-4 md:justify-start md:space-x-4 md:p-0">
                <h2 className="text-2xl font-semibold text-white text-opacity-90">
                  Your FAQs #{generation.id}
                </h2>
                <Tippy content="Delete" placement="top">
                  <button
                    className="mb-4 rounded bg-red-500 px-4 py-2 text-xs font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-md focus:outline-none active:bg-blue-600 md:mb-0 md:ml-4"
                    onClick={() => handleDeleteGenerationById(generation.id)}
                    disabled={isGeneratingDeleting}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.03365 8.89004C2.55311 5.68645 2.31285 4.08466 3.21049 3.04233C4.10813 2 5.72784 2 8.96727 2H15.033C18.2724 2 19.8922 2 20.7898 3.04233C21.6874 4.08466 21.4472 5.68646 20.9666 8.89004L19.7666 16.89C19.401 19.3276 19.2182 20.5464 18.3743 21.2732C17.5303 22 16.2979 22 13.833 22H10.1673C7.7024 22 6.46997 22 5.62604 21.2732C4.78211 20.5464 4.59929 19.3276 4.23365 16.89L3.03365 8.89004Z"
                        stroke="#FFFFFF"
                        stroke-width="1.5"
                      />
                      <path
                        d="M8 6L3.5 11L11 19M14 6L4 16M20 6L7 19M13 19L20.5 11L16 6M10 6L20 16M4 6L17 19"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21 6H3"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M19 19H5"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </Tippy>
              </div>
              {generation.hooks.map((hook, hookIndex) => (
                <>
                  <article
                    key={hookIndex}
                    className={`rounded-lg bg-white bg-opacity-5 p-4 shadow-md md:p-6 ${
                      hookIndex > 0 ? "mt-4" : ""
                    }`}
                  >
                    <div className="flex flex-col-reverse justify-between md:flex-row md:items-start">
                      <div>
                        <p className=" text-lg font-bold text-white text-opacity-90">
                          <span dir={hook.lang === "Arabic" ? "rtl" : "ltr"}>
                            {hook.q}
                          </span>
                        </p>
                        <p
                          className="mt-2 overflow-hidden text-base text-white text-opacity-80"
                          dir={hook.lang === "Arabic" ? "rtl" : "ltr"}
                        >
                          <React.Fragment>{hook.a}</React.Fragment>
                        </p>
                      </div>
                      <div className="flex items-end justify-end">
                        <StarRating
                          rating={hook.rating || 0}
                          setRating={rating =>
                            handleRatingChange(
                              "The need: " +
                                hook.q +
                                ", How my business satisfies the need: " +
                                hook.a,
                              rating,
                              hook.id
                            )
                          }
                          isLoading={loadingStates[hook.id] || false}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end">
                      <Tippy content="Copy" placement="top">
                        <button
                          onClick={() => handleCopy(hook)}
                          className="ml-2 rounded-full bg-blue-600 p-3 text-white transition duration-300 ease-in-out hover:bg-blue-700"
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M20.9983 10C20.9862 7.82497 20.8897 6.64706 20.1213 5.87868C19.2426 5 17.8284 5 15 5H12C9.17157 5 7.75736 5 6.87868 5.87868C6 6.75736 6 8.17157 6 11V16C6 18.8284 6 20.2426 6.87868 21.1213C7.75736 22 9.17157 22 12 22H15C17.8284 22 19.2426 22 20.1213 21.1213C21 20.2426 21 18.8284 21 16V15"
                              stroke="#FFFFFF"
                              stroke-width="1.5"
                              stroke-linecap="round"
                            />

                            <path
                              d="M3 10V16C3 17.6569 4.34315 19 6 19M18 5C18 3.34315 16.6569 2 15 2H11C7.22876 2 5.34315 2 4.17157 3.17157C3.51839 3.82475 3.22937 4.69989 3.10149 6"
                              stroke="#FFFFFF"
                              stroke-width="1.5"
                              stroke-linecap="round"
                            />
                          </svg>
                        </button>
                      </Tippy>
                      <Tippy content="Delete" placement="top">
                        <button
                          onClick={() =>
                            handleHookDeletionById(generation.id, hook.id)
                          }
                          className="ml-2 rounded-full bg-red-600 p-3 text-white transition duration-300 ease-in-out hover:bg-red-700"
                          disabled={isCreationDeleting}
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.03365 8.89004C2.55311 5.68645 2.31285 4.08466 3.21049 3.04233C4.10813 2 5.72784 2 8.96727 2H15.033C18.2724 2 19.8922 2 20.7898 3.04233C21.6874 4.08466 21.4472 5.68646 20.9666 8.89004L19.7666 16.89C19.401 19.3276 19.2182 20.5464 18.3743 21.2732C17.5303 22 16.2979 22 13.833 22H10.1673C7.7024 22 6.46997 22 5.62604 21.2732C4.78211 20.5464 4.59929 19.3276 4.23365 16.89L3.03365 8.89004Z"
                              stroke="#FFFFFF"
                              stroke-width="1.5"
                            />
                            <path
                              d="M8 6L3.5 11L11 19M14 6L4 16M20 6L7 19M13 19L20.5 11L16 6M10 6L20 16M4 6L17 19"
                              stroke="#FFFFFF"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M21 6H3"
                              stroke="#FFFFFF"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <path
                              d="M19 19H5"
                              stroke="#FFFFFF"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </Tippy>
                    </div>
                  </article>

                  {hookIndex === 6 && (
                    <div className="my-8 flex justify-center">
                      <div className="w-full border-t border-dashed border-gray-300 dark:border-gray-600"></div>
                    </div>
                  )}
                </>
              ))}

              <button
                className="my-4 flex rounded bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-bold  text-white shadow-lg outline-none transition-all duration-150 ease-linear hover:scale-110 focus:outline-none"
                onClick={() => handleCopyAll(generation.id)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-4 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h11a2 2 0 012 2v1"></path>
                </svg>
                Copy All
              </button>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
