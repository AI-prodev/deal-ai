import { HookData } from "@/pages/apps/magic-hooks";
import Tippy from "@tippyjs/react";
import React, { useEffect, useState } from "react";
import StarRating from "./StarRating";
import { useRateCreationMutation } from "@/store/features/marketingHooksApi";
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

export const EmailSequenceResults = ({
  hooksData,
  hookRatings,
  setHookRatings,
  hookRatingsId,
  setHookRatingsId,
  setHooksData,
  appName,
  projectId,
}: {
  hooksData: HookData[];
  hookRatings: { [key: string]: number };
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

  const [rateCreation] = useRateCreationMutation();

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
        .map(hook => hook.output.subject)
        .join("\n");
      navigator.clipboard.writeText(hooksText);
    }
  };
  const tokenKey = "emailSequencehooksRequestToken";
  useEffect(() => {
    const savedGenerations: HookData[] = JSON.parse(
      localStorage.getItem(`${tokenKey}Generations`) || "[]"
    );

    const newHookRatings: { [key: string]: number } = {};
    savedGenerations.forEach(generation => {
      generation.hooks.forEach(hook => {
        if (hook.rating !== undefined) {
          const hookKey = `subject:${hook.output.subject}/n/n body:${hook.output.body}}`;
          newHookRatings[hookKey] = hook.rating;
        }
      });
    });

    setHookRatings(newHookRatings);
  }, []);

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
    <>
      <div className="container mx-auto   bg-opacity-80 px-1 py-8 md:px-4">
        {hooksData.length > 0 && (
          <>
            <div className="space-y-6">
              {getUniqueGenerations(hooksData).map((generation, genIndex) => (
                <section
                  key={genIndex}
                  className="rounded-lg   bg-white bg-opacity-10 p-2 shadow-md md:p-6"
                >
                  <div
                    className={`flex items-center justify-between p-2 md:mb-4 md:justify-start md:space-x-4 md:p-0 ${
                      isGeneratingDeleting && "animate-pulse"
                    }`}
                  >
                    <h2 className="text-2xl font-semibold text-white text-opacity-90">
                      Result #{generation.id}
                    </h2>
                    <Tippy content="Delete" placement="top">
                      <button
                        className="mb-4 rounded bg-red-500 px-4 py-2 text-xs font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-md focus:outline-none active:bg-blue-600 md:mb-0 md:ml-4"
                        onClick={() =>
                          handleDeleteGenerationById(generation.id)
                        }
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
                  {generation.hooks.map((hook, hookIndex) => (
                    <article
                      key={hookIndex}
                      className={`rounded-lg bg-white bg-opacity-5 p-4 shadow-md md:p-6 ${
                        hookIndex > 0 ? "mt-4" : ""
                      }`}
                    >
                      <div
                        className={`flex flex-col-reverse justify-between md:flex-row md:items-start ${
                          isCreationDeleting ? " animate-pulse" : ""
                        }`}
                      >
                        <div>
                          {hook?.output?.timing && (
                            <p className="text-sm font-medium text-blue-300">
                              To Be Sent: {hook.output.timing}
                            </p>
                          )}
                          <p className=" text-lg font-bold text-white text-opacity-90">
                            Subject:{" "}
                            <span dir={hook.lang === "Arabic" ? "rtl" : "ltr"}>
                              {hook.output.subject}
                            </span>
                          </p>
                          <p
                            className="mt-2 overflow-hidden text-base text-white text-opacity-80"
                            dir={hook.lang === "Arabic" ? "rtl" : "ltr"}
                          >
                            {hook.output.body
                              .split(/<p>|<\/p>|<br \/>|<br\/>|\n|<br>/g)
                              .filter((line: string) => line.trim() !== "")
                              .map(
                                (
                                  line: string,
                                  index: number,
                                  array: string[]
                                ) => (
                                  <React.Fragment key={index}>
                                    {line}
                                    {index < array.length - 1 && (
                                      <>
                                        <br />
                                        <br />
                                      </>
                                    )}
                                  </React.Fragment>
                                )
                              )}
                          </p>
                          {hook.output.url && (
                            <div
                              className={`my-8 flex flex-col rounded-lg bg-black bg-gradient-to-r p-4 shadow-md transition-shadow duration-300 ease-in-out hover:shadow-lg `}
                            >
                              <div className="flex items-center text-white">
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M15.6111 1.5837C17.2678 1.34703 18.75 2.63255 18.75 4.30606V5.68256C19.9395 6.31131 20.75 7.56102 20.75 9.00004V19C20.75 21.0711 19.0711 22.75 17 22.75H7C4.92893 22.75 3.25 21.0711 3.25 19V5.00004C3.25 4.99074 3.25017 4.98148 3.2505 4.97227C3.25017 4.95788 3.25 4.94344 3.25 4.92897C3.25 4.02272 3.91638 3.25437 4.81353 3.12621L15.6111 1.5837ZM4.75 6.75004V19C4.75 20.2427 5.75736 21.25 7 21.25H17C18.2426 21.25 19.25 20.2427 19.25 19V9.00004C19.25 7.7574 18.2426 6.75004 17 6.75004H4.75ZM5.07107 5.25004H17.25V4.30606C17.25 3.54537 16.5763 2.96104 15.8232 3.06862L5.02566 4.61113C4.86749 4.63373 4.75 4.76919 4.75 4.92897C4.75 5.10629 4.89375 5.25004 5.07107 5.25004ZM7.25 12C7.25 11.5858 7.58579 11.25 8 11.25H16C16.4142 11.25 16.75 11.5858 16.75 12C16.75 12.4143 16.4142 12.75 16 12.75H8C7.58579 12.75 7.25 12.4143 7.25 12ZM7.25 15.5C7.25 15.0858 7.58579 14.75 8 14.75H13.5C13.9142 14.75 14.25 15.0858 14.25 15.5C14.25 15.9143 13.9142 16.25 13.5 16.25H8C7.58579 16.25 7.25 15.9143 7.25 15.5Z"
                                    fill="#FFF"
                                  />
                                </svg>

                                <span className="ml-2 text-lg font-semibold">
                                  News source for your review:
                                </span>
                              </div>
                              <a
                                href={hook.output.url}
                                target="_blank"
                                className="mt-4 text-sm text-white underline hover:text-gray-300"
                                rel="noreferrer"
                              >
                                {hook.output.url}
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="flex items-end justify-end">
                          <StarRating
                            rating={hook.output.rating || 0}
                            setRating={rating =>
                              handleRatingChange(
                                `subject:${hook.output.subject}/n/n body:${hook.output.body}}`,
                                rating,
                                hook.output.id
                              )
                            }
                            isLoading={loadingStates[hook.output.id] || false}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        <Tippy content="Copy" placement="top">
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(
                                `${
                                  hook.output.subject
                                }\n\n${hook.output.body.replace(
                                  /<p>|<\/p>|<br\/>|<br \/>|<br>/g,
                                  "\n\n"
                                )}${
                                  hook.output.url
                                    ? `\n\n${hook.output.url}`
                                    : ""
                                }}`
                              )
                            }
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
                        {!hook.output.url && (
                          <Tippy content="Delete" placement="top">
                            <button
                              onClick={() =>
                                handleHookDeletionById(
                                  generation.id,
                                  hook.output.id
                                )
                              }
                              disabled={isGeneratingDeleting}
                              className="ml-2 rounded-full bg-red-600 p-3 text-white transition duration-300 ease-in-out hover:bg-red-700"
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
                        )}
                      </div>
                    </article>
                  ))}
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};
