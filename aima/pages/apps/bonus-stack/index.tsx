import BonusStackForm from "@/components/marketingHooks/BonusStackForms";
import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";
import { BonusStackResults } from "@/components/marketingHooks/BonusStackResults";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { createFunnelApi } from "@/store/features/projectApi";
import {
  useGetBenefitStackWithHighestGenerationQuery,
  useLoadDefaultAppsProjectQuery,
} from "@/store/features/appsProjectApi";
import { DefaultProjectData } from "@/interfaces/IAppProject";
import LoadingSkeleton from "@/components/Seller/LoadingSkeleton";
import ProjectsDropdown from "@/components/ai-apps/ProjectsDropdown";
import Head from "next/head";

export type HookData = { id: number; hooks: any[]; language?: string };

type Props = {};

const BonusStack = (props: Props) => {
  const appName = "bonus-stack";
  const [isAppDataLoading, setIsAppDataLoading] = useState(false);

  const router = useRouter();
  const funnelId = router.query.funnelId as string;

  const { data: funnel } = createFunnelApi.useGetFunnelQuery(
    { funnelId },
    { skip: !funnelId }
  );

  const {
    data: defaultProjectData,
    refetch: refetchDefaultProject,
    isLoading: isDefaultProjectLoading,
  } = useLoadDefaultAppsProjectQuery("") as {
    data: DefaultProjectData;
    refetch: () => void;
    isLoading: boolean;
  };

  const [projectId, setProjectId] = useState<string>(
    localStorage.getItem("selectedProjectId") || defaultProjectData?._id
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setProjectId(
        localStorage.getItem("selectedProjectId") || defaultProjectData?._id
      );
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [defaultProjectData]);

  const [hooksData, setHooksData] = useState<HookData[]>([]);
  const [submissionData, setSubmissionData] = useState<HookData[]>([]);
  const [hookRatings, setHookRatings] = useState<{ [key: string]: number }>({});
  const [hookRatingsId, setHookRatingsId] = useState<{
    [key: string]: number;
  }>({});
  const formatHookRatingData = () => {
    return Object.entries(hookRatings)
      .map(
        ([hookText, rating]) =>
          `${hookText}\nRating: ${rating} star${rating > 1 ? "s" : ""}`
      )
      .join("\n\n");
  };
  const [storedGeneration, setStoredGeneration] = useState<object | null>();
  const {
    data: benefitStackData,
    isLoading,
    error,
  } = useGetBenefitStackWithHighestGenerationQuery(
    { projectId },
    { skip: !projectId }
  );

  useEffect(() => {
    if (
      benefitStackData &&
      benefitStackData?.highestGeneration?.creations.length > 0
    ) {
      const newGenerations = {
        id: benefitStackData?.highestGeneration?.generationNumber,
        hooks: benefitStackData?.highestGeneration?.creations.map(
          (hook: any) => {
            const output = {
              a: hook.output?.a,
              n: hook.output?.n,
              rating: hook.rating,
              id: hook._id,
            };
            return output;
          }
        ),
      };
      setStoredGeneration(newGenerations);
    } else {
      setStoredGeneration(null);
    }
  }, [benefitStackData, isAppDataLoading]);

  // const storedGeneration = localStorage.getItem('mostRecentGenerationData');

  return (
    <>
      <Head>
        <title>Free Bonuses</title>
      </Head>
      <div className="p-3">
        <div className="flex justify-center">
          <div className="w-full max-w-[780px]">
            {funnel && (
              <ul className="mb-5 flex space-x-2 rtl:space-x-reverse">
                <li>
                  <Link
                    href="/projects"
                    className="text-primary hover:underline"
                  >
                    Projects
                  </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                  <Link
                    href={`/projects/${funnel.project._id}`}
                    className="text-primary hover:underline"
                  >
                    {funnel.project.title}
                  </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                  <Link
                    href={`/projects/${funnel?.project._id}/funnels/${funnel._id}`}
                    className="text-primary hover:underline"
                  >
                    {funnel.title}
                  </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                  <span>Free Bonuses</span>
                </li>
              </ul>
            )}

            <ul className="mb-5 flex space-x-2 rtl:space-x-reverse">
              <li>
                <Link
                  href="/apps/ai-apps"
                  className="text-md text-primary hover:underline"
                >
                  &larr; Back
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center flex-col">
          {storedGeneration ? (
            <>
              <div className="my-3 w-full max-w-[780px] justify-center pt-2">
                <div className="mb-8 flex items-center">
                  <h2 className="text-2xl font-bold">Free Bonuses</h2>
                  <div className="mx-4">
                    <ProjectsDropdown setProjectId={setProjectId} />
                  </div>
                </div>
                <BonusStackForm
                  setHooksData={setHooksData}
                  hooksData={hooksData}
                  formatHookRatingData={formatHookRatingData}
                  setSubmissionData={setSubmissionData}
                  hookRatingsId={hookRatingsId}
                  appName={appName}
                  setAppDataLoading={setIsAppDataLoading}
                  projectId={projectId}
                  storedGeneration={storedGeneration}
                />
              </div>
              <div className="w-full justify-center pt-2">
                {(isAppDataLoading || isDefaultProjectLoading) && (
                  <LoadingSkeleton skeletonCount={8} />
                )}
                <BonusStackResults
                  hooksData={hooksData}
                  hookRatings={hookRatings}
                  setHookRatings={setHookRatings}
                  hookRatingsId={hookRatingsId}
                  setHookRatingsId={setHookRatingsId}
                  submissionData={submissionData}
                  setHooksData={setHooksData}
                  appName={appName}
                  projectId={projectId}
                />
              </div>
            </>
          ) : (
            <div className="my-3 w-full max-w-lg justify-center pt-2 md:w-1/2">
              <div className="mb-8">
                <h2 className="text-2xl font-bold">Free Bonuses</h2>
              </div>
              <h3 className="text-md mt-2 font-bold text-white">
                Create a benefit stack before creating your free bonuses.
              </h3>
              <button
                onClick={() => router.push("/apps/benefit-stack")}
                className="btn btn-primary !my-6"
              >
                Create Benefit Stack First
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(BonusStack, USER_ROLES, "ai-platform");
