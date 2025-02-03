import React, { useState, useEffect, Fragment, useRef } from "react";
import { ThesisData } from "@/interfaces/ThesisData";
import { Dialog, Transition } from "@headlessui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import LoadingSkeleton from "./apollo/LoadingSkeleton";
import customFetch from "@/utils/customFetch";

const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:3000";
const debug = process.env.NEXT_PUBLIC_DEBUG == "true" || false;

interface RecommendationProps {
  id: string;
  thesis: ThesisData | null;
  business: string;
  onRationaleUpdate: (id: string, rationale: string) => void;
}
interface Recommendation {
  summary: string;
  rationale: string;
}

const ApolloRecommends: React.FC<
  RecommendationProps
> = recommendationSource => {
  const hasFiredQuery = useRef(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null
  );
  const { data: session } = useSession();

  const router = useRouter();
  const updateProgress = async (tok: string) => {
    const maxRetries = 5;
    let retryCount = 0;
    let success = false;

    const jwtToken = session?.token;
    if (!jwtToken) {
      router.replace("/auth/cover-login");
      throw new Error("User not authenticated");
    }
    while (!success && ++retryCount <= maxRetries) {
      try {
        const response = await customFetch(`${baseUrl}/queryRequest/${tok}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        const data = await response.json();

        if (data.progress !== undefined) {
          setTimeout(
            () => updateProgress(tok),
            Math.floor(Math.random() * (3000 - 2000 + 1) + 2000)
          );

          return;
        }

        if (data?.status === "error") {
          console.error("error");
          return;
        }

        if (data?.status === "completed") {
          const response = await customFetch(`${baseUrl}/endRequest/${tok}`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          });
          const data = await response.json();

          if (!data.response) {
            console.error("error");
            return;
          }

          const responseJSON = data.response.result;
          const recommendation = JSON.parse(responseJSON);

          setRecommendation(recommendation);
          success = true;
        }
      } catch (err) {
        console.error(err);
        await new Promise(res => setTimeout(res, 3000));
      }
    }
  };

  const fireQuery = async (recommendationSource: RecommendationProps) => {
    const maxRetries = 5;
    let retryCount = 0;
    let success = false;

    const jwtToken = session?.token;
    if (!jwtToken) {
      router.replace("/auth/cover-login");
      throw new Error("User not authenticated");
    }
    while (!success && ++retryCount <= maxRetries) {
      try {
        const response = await customFetch(`${baseUrl}/startApolloRecommends`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            thesis: `${recommendationSource.thesis?.thesis} ${recommendationSource.thesis?.me} ${recommendationSource.thesis?.trends}`,
            business: recommendationSource.business,
            me: recommendationSource.thesis?.me,
            trends: recommendationSource.thesis?.trends,
          }),
        });

        const data = await response.json();

        setTimeout(async () => updateProgress(data.token), 1000);

        success = true;
      } catch (err) {
        console.error(err);
        await new Promise(res => setTimeout(res, 3000));
      }
    }
  };

  useEffect(() => {
    if (recommendationSource.thesis == null) return;
    if (recommendationSource.business == null) return;

    if (!hasFiredQuery.current) {
      fireQuery(recommendationSource);
      hasFiredQuery.current = true;
    }
  }, [recommendationSource.business]);

  useEffect(() => {
    if (recommendation) {
      recommendationSource.onRationaleUpdate(
        recommendationSource.id,
        recommendation.rationale
      );
    }
  }, [recommendation]);

  return (
    <div>
      {recommendation == null && <LoadingSkeleton />}
      {recommendation != null && (
        <div className="mb-5 flex items-center justify-center px-6">
          <div className="grow rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
            <div className="py-7 px-6">
              <div className="justify-left mb-2 flex items-center">
                <div className="mb-2 inline-block shrink rounded-full bg-[#3b3f5c] p-3 text-[#f1f2f3]">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.5 19.5H9.5M14.5 19.5C14.5 18.7865 14.5 18.4297 14.5381 18.193C14.6609 17.4296 14.6824 17.3815 15.1692 16.7807C15.3201 16.5945 15.8805 16.0927 17.0012 15.0892C18.5349 13.7159 19.5 11.7206 19.5 9.5C19.5 8.62341 19.3496 7.78195 19.0732 7M14.5 19.5C14.5 20.4346 14.5 20.9019 14.299 21.25C14.1674 21.478 13.978 21.6674 13.75 21.799C13.4019 22 12.9346 22 12 22C11.0654 22 10.5981 22 10.25 21.799C10.022 21.6674 9.83261 21.478 9.70096 21.25C9.5 20.9019 9.5 20.4346 9.5 19.5M9.5 19.5C9.5 18.7865 9.5 18.4297 9.46192 18.193C9.3391 17.4296 9.31762 17.3815 8.83082 16.7807C8.67987 16.5945 8.11945 16.0927 6.99876 15.0892C5.4651 13.7159 4.5 11.7206 4.5 9.5C4.5 5.35786 7.85786 2 12 2C13.3637 2 14.6423 2.36394 15.7442 3"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12.7857 8.5L10.6428 11.5H13.6428L11.5 14.5"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h5 className="mb-2 ml-5 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
                  Insight
                </h5>
              </div>
              <p className="text-large text-white">
                {!recommendation.summary
                  .toLowerCase()
                  .startsWith("acquire") && (
                  <div>
                    <h6 className="mb-4 text-lg font-semibold text-[#3b3f5c] dark:text-white-light">
                      Business Description
                    </h6>
                    <p className="text-md text-white-light">
                      {recommendation.summary}
                    </p>
                  </div>
                )}
                {recommendation.rationale && (
                  <>
                    <h6 className="mb-4 mt-4 text-lg font-semibold text-[#3b3f5c] dark:text-white-light">
                      Relevance Rationale
                    </h6>
                    <p className="text-md text-white-light">
                      {recommendation.rationale}
                    </p>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApolloRecommends;
