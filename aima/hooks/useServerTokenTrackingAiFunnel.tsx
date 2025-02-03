/* eslint-disable no-console */
// useServerTokenTracking.ts

import { showErrorToastTimer } from "@/utils/toast";

import { useState, useEffect, useRef } from "react";

// Define your request functions' return types
interface StartResponse {
  token: string;
}

interface StatusResponse {
  status: "completed" | "error" | "processing";
  error?: string;
}

interface EndResponse {}

// Define the types for the functions passed to the hook
type StartRequestFunction = (data: {
  input: any;
}) => Promise<{ data: StartResponse }>;
type QueryRequestFunction = (data: {
  token: string;
}) => Promise<{ data: StatusResponse }>;
type EndRequestFunction = (data: {
  token: string;
}) => Promise<{ data: StatusResponse }>;

interface UseServerTokenTrackingProps {
  startRequest: StartRequestFunction;
  queryRequest: QueryRequestFunction;
  endRequest: EndRequestFunction;
  tokenKey: string;
  onEndResponse: (response: any, submissionData?: any) => void;
  geneationType?: boolean;
}

export const updateRatingsInLocalStorage = (
  hookRatingsId: {
    [key: string]: number;
  },
  tokenKey: string
) => {
  const storedGenerations = localStorage.getItem(`${tokenKey}Generations`);
  if (storedGenerations) {
    const generationsData = JSON.parse(storedGenerations);
    const updatedGenerations = generationsData.map((generation: any) => {
      const updatedHooks = generation.hooks.map((hook: any) => {
        return {
          ...hook,
          rating: hookRatingsId[hook.id] || hook.rating,
        };
      });
      return {
        ...generation,
        hooks: updatedHooks,
      };
    });

    localStorage.setItem(
      `${tokenKey}Generations`,
      JSON.stringify(updatedGenerations)
    );
  }
};

export const updateIdeasRatingsInLocalStorage = (
  hookRatingsId: {
    [key: string]: number;
  },
  tokenKey: string
) => {
  const storedGenerations = localStorage.getItem(`${tokenKey}Generations`);
  if (storedGenerations) {
    const generationsData = JSON.parse(storedGenerations);

    const updatedGenerations = generationsData.map((hook: any) => {
      return {
        ...hook,
        rating: hookRatingsId[hook.id] || hook.rating,
      };
    });

    localStorage.setItem(
      `${tokenKey}Generations`,
      JSON.stringify(updatedGenerations)
    );
  }
};

//For Delete Hook and Geneartion

export const deleteGenerationById = (id: number, tokenKey: string): void => {
  const storedGenerationsString = localStorage.getItem(
    `${tokenKey}Generations`
  );
  if (storedGenerationsString) {
    let generations = JSON.parse(storedGenerationsString);
    generations = generations.filter((generation: any) => generation.id !== id);
    reorderGenerations(generations); // Reorder the generations
    localStorage.setItem(`${tokenKey}Generations`, JSON.stringify(generations));
  }
};
export const deleteHookById = (
  generationId: number,
  hookId: string,
  tokenKey: string
): void => {
  const storedGenerationsString = localStorage.getItem(
    `${tokenKey}Generations`
  );
  if (storedGenerationsString) {
    let generations = JSON.parse(storedGenerationsString);
    const generationIndex = generations.findIndex(
      (gen: any) => gen.id === generationId
    );

    if (generationIndex !== -1) {
      let selectedGeneration = generations[generationIndex];
      selectedGeneration.hooks = selectedGeneration.hooks.filter(
        (hook: any) => hook.id !== hookId
      );

      if (selectedGeneration.hooks.length === 0) {
        generations.splice(generationIndex, 1);
        reorderGenerations(generations);
      } else {
        generations[generationIndex] = selectedGeneration;
      }

      localStorage.setItem(
        `${tokenKey}Generations`,
        JSON.stringify(generations)
      );
    }
  }
};

const reorderGenerations = (generations: any[]): void => {
  generations
    .sort((a, b) => a.id - b.id)
    .forEach((generation, index) => {
      generation.id = index + 1;
    });
};
const useServerTokenTrackingAiFunnel = ({
  startRequest,
  queryRequest,
  endRequest,
  tokenKey,
  onEndResponse,
  geneationType = true,
}: UseServerTokenTrackingProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [submissionData, setSubmissionData] = useState<any>();
  const [data, setData] = useState<any>();
  const [newToken, setNewToken] = useState<string | null>(null);
  const end = useRef(false);
  const checkStatusScheduledRef = useRef(false);

  const getHighestGenerationId = (generationType: string): number => {
    const existingGenerations: any[] = JSON.parse(
      localStorage.getItem(generationType) || "[]"
    );

    const highestId =
      existingGenerations && Array.isArray(existingGenerations)
        ? existingGenerations.reduce((maxId, gen) => Math.max(gen.id, maxId), 0)
        : 0;

    return highestId;
  };

  // Initialize generationCount based on stored data
  const initialGenerationCount: number = getHighestGenerationId(
    `${tokenKey}Generations`
  );
  const [generationCount, setGenerationCount] = useState<number>(
    initialGenerationCount
  );

  // const startAndTrack = async (submissionData: any) => {
  //   console.log("startAndTrack", completed);
  //   setCompleted(false);
  //   console.log("startAndTrack2", completed);
  //   try {
  //     setCompleted(false);
  //     console.log("startAndTrack3", completed);
  //     const { data: startResult } = await startRequest({
  //       input: submissionData,
  //     });

  //     if (startResult.token) {
  //       localStorage.setItem(tokenKey, startResult.token);

  //       trackProgress(startResult.token);
  //     }
  //   } catch (error) {
  //     console.error("Failed to start request", error);
  //   }
  // };

  const startAndTrack = async (subData: any) => {
    try {
      setSubmissionData(subData);
      const { data: startResult } = await startRequest({
        input: subData,
      });

      if (startResult.token) {
        localStorage.setItem(tokenKey, startResult.token);
        console.log("this is token", startResult.token);
        setCompleted(false);
        setNewToken(startResult.token);
      }
    } catch (error) {
      console.error("Failed to start request", error);
    }
  };

  useEffect(() => {
    console.log(
      "newToken",
      newToken,
      "completed",
      completed,
      "end",
      end.current
    );
    if (newToken !== null && !completed) {
      console.log("newToken1", newToken);
      end.current = false;
      checkStatusScheduledRef.current = false;
      setIsLoading(true);
      const cleanup = trackProgress(newToken);
      return cleanup;
    }
  }, [newToken, completed]);

  const saveGenerationToLocal = (
    generationType: string,
    newGeneration: any
  ) => {
    const existingGenerations = JSON.parse(
      localStorage.getItem(generationType) || "[]"
    );
    const isExisting = existingGenerations.some(
      (gen: any) => gen.id === newGeneration.id
    );

    if (!isExisting) {
      const updatedHooks = newGeneration.hooks.map((hook: any) => {
        const { input, ...hookWithoutInput } = hook;

        return {
          input: {
            aspectRatio: input?.aspectRatio,
          },
          ...hookWithoutInput,
        };
      });

      const generationToSave = {
        ...newGeneration,
        hooks: updatedHooks,
      };

      existingGenerations.unshift(generationToSave);

      localStorage.setItem(generationType, JSON.stringify(existingGenerations));

      setGenerationCount(generationToSave.id);
    }
  };

  useEffect(() => {
    if (data?.response) {
      setCompleted(true);
      localStorage.removeItem(tokenKey);
      setNewToken("");
      end.current = true;
      checkStatusScheduledRef.current = false;
      setData(null);
      trackProgress("");
    }
  }, [data]);
  const lastCheckedTokenRef = useRef<string | null>(null);

  const trackProgress = (token: string) => {
    if (!token) return;
    setIsLoading(true);

    let delay = 3000;
    const maxDelay = 30000;
    let isCheckStatusCompleted = false;
    const checkStatus = async () => {
      if (isCheckStatusCompleted) {
        checkStatusScheduledRef.current = false;
        return;
      }
      if (completed) {
        checkStatusScheduledRef.current = false;
        return;
      }

      try {
        const { data: statusResult } = await queryRequest(
          { token: token },
          //@ts-ignore
          { skip: token === lastCheckedTokenRef.current }
        );
        console.log(`${tokenKey} - statusResult`, statusResult);

        if (statusResult?.status === "completed") {
          setCompleted(true);
          localStorage.removeItem(tokenKey);
          setNewToken("");
          const { data: endResult } = await endRequest(
            { token },
            //@ts-ignore
            { skip: token === lastCheckedTokenRef.current }
          );
          setIsLoading(false);
          lastCheckedTokenRef.current = token;
          //@ts-ignore
          if (endResult?.response) {
            const updatedCount = getHighestGenerationId(
              `${tokenKey}Generations`
            );

            setGenerationCount(updatedCount);
            setIsLoading(false);

            console.log("endResult", endResult, "completed", completed);
            end.current = true;
            isCheckStatusCompleted = true;
            setData(endResult);
            onEndResponse(endResult, submissionData);
            checkStatusScheduledRef.current = false;
            if (geneationType) {
              const newGeneration = {
                id: updatedCount + 1,
                //@ts-ignore
                hooks: endResult.response,
              };
              saveGenerationToLocal(`${tokenKey}Generations`, newGeneration);
            } else {
              const newGeneration = {
                id: updatedCount + 1,
                endResult,
              };

              localStorage.setItem(
                `${tokenKey}Generations`,
                //@ts-ignore
                JSON.stringify(newGeneration.endResult.response)
              );
            }
          }
        } else if (statusResult?.status === "error") {
          setIsLoading(false);
          setCompleted(true);
          isCheckStatusCompleted = true;
          localStorage.removeItem(tokenKey);

          if (statusResult?.error) {
            showErrorToastTimer({ title: statusResult.error });
          } else {
            showErrorToastTimer({ title: "Error generating" });
          }
        } else if (statusResult?.status === "processing") {
          // Only set a new timeout if we're not completed.
          if (
            !completed &&
            checkStatusScheduledRef.current &&
            statusResult.status !== undefined
          ) {
            delay = Math.min(delay * 1.5, maxDelay);
            setIsLoading(true);
            setTimeout(checkStatus, delay);
          }
        } else {
          setIsLoading(false);
          setCompleted(true);
          isCheckStatusCompleted = true;
          localStorage.removeItem(tokenKey);
        }
      } catch (error) {
        isCheckStatusCompleted = true;
        localStorage.removeItem(tokenKey);
        console.error("Error tracking progress:", error);
        setIsLoading(false);
        setCompleted(true);
      }
    };
    if (
      token &&
      !checkStatusScheduledRef.current &&
      !end.current &&
      lastCheckedTokenRef.current !== token
    ) {
      checkStatusScheduledRef.current = true;
      checkStatus();
    }
  };
  const lastTrackedTokenRef = useRef<string | null>(null);
  useEffect(() => {
    const token = localStorage.getItem(tokenKey);
    if (
      token &&
      token !== lastTrackedTokenRef.current &&
      !checkStatusScheduledRef.current
    ) {
      console.log("token", token, "completed", completed);
      checkStatusScheduledRef.current = false;
      end.current = false;
      setIsLoading(true);
      localStorage.removeItem(tokenKey);
      const cleanup = trackProgress(token);
      lastTrackedTokenRef.current = token;

      return cleanup;
    }
  }, [tokenKey, completed]);

  useEffect(() => {
    if (completed) {
      setIsLoading(false);
    }
  }, [completed]);

  return { startAndTrack, isLoading, generationCount };
};

export default useServerTokenTrackingAiFunnel;
