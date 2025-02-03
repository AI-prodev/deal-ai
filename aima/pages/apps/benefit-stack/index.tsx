import BenefitStackForm from "@/components/marketingHooks/BenefitStackForms";
import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";
import { BenefitStackResults } from "@/components/marketingHooks/BenefitStackResults";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { createFunnelApi, createProjectApi } from "@/store/features/projectApi";
import { useLoadDefaultAppsProjectQuery } from "@/store/features/appsProjectApi";
import { DefaultProjectData } from "@/interfaces/IAppProject";
import LoadingSkeleton from "@/components/Seller/LoadingSkeleton";
import ProjectsDropdown from "@/components/ai-apps/ProjectsDropdown";
import Head from "next/head";

export type HookData = { id: number; hooks: any[]; language?: string };

type Props = {};

const BenefitStack = (props: Props) => {
  const appName = "benefit-stack";
  const router = useRouter();
  const funnelId = router.query.funnelId as string;
  const [isAppDataLoading, setIsAppDataLoading] = useState(false);
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

  return (
    <>
      <Head>
        <title>Benefit Stacks</title>
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
                  <span>Benefit Stack</span>
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

        <div className="flex justify-center">
          <div className="my-3 w-full max-w-[780px] justify-center pt-2">
            <div className="mb-8 flex items-center">
              <h2 className="text-2xl font-bold">Benefit Stack</h2>
              <div className="mx-4">
                <ProjectsDropdown setProjectId={setProjectId} />
              </div>
            </div>
            <BenefitStackForm
              setHooksData={setHooksData}
              hooksData={hooksData}
              formatHookRatingData={formatHookRatingData}
              setSubmissionData={setSubmissionData}
              hookRatingsId={hookRatingsId}
              setAppDataLoading={setIsAppDataLoading}
              projectId={projectId}
            />
          </div>
        </div>
        <div className="w-full justify-center pt-2">
          {(isAppDataLoading || isDefaultProjectLoading) && (
            <LoadingSkeleton skeletonCount={8} />
          )}
          <BenefitStackResults
            hooksData={hooksData}
            hookRatings={hookRatings}
            setHookRatings={setHookRatings}
            submissionData={submissionData}
            hookRatingsId={hookRatingsId}
            setHookRatingsId={setHookRatingsId}
            setHooksData={setHooksData}
            appName={appName}
            projectId={projectId}
          />
        </div>
      </div>
    </>
  );
};

export default withAuth(BenefitStack, USER_ROLES, "ai-platform");
