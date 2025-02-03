import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { createFunnelApi } from "@/store/features/projectApi";

import CommerceResults from "@/components/commerce/CommerceResults";
import CommerceForm from "@/components/marketingHooks/CommerceForm";
import {
  useCompositeCreationFinalizeBusinessDescMutation,
  useRateCreationMutation,
} from "@/store/features/marketingHooksApi";
import BusinessDescFrom from "@/components/businessDesc/BusinessDescFrom";
import BusinessDescResults from "@/components/businessDesc/BusinessDescResults";
import {
  useLoadDefaultAppsProjectQuery,
  useUpdateSpecificAppsProjectContentItmesMutation,
  useDeleteSpecificCreationMutation,
  useDeleteSpecificGenerationMutation,
  useGetSpecifcAppsPojectAppNameQuery,
} from "@/store/features/appsProjectApi";

import { DefaultProjectData } from "@/interfaces/IAppProject";
import LoadingSkeleton from "@/components/Seller/LoadingSkeleton";
import ProjectsDropdown from "@/components/ai-apps/ProjectsDropdown";
import Head from "next/head";

export type HookData = {
  id: number;
  hooks: any[];
  ratings?: { [hookId: string]: number };
  language?: string;
};

export type BusinessDescHookType = {
  id: string;
  contentItemsId: string;
  image?: {
    content: string;
    isLoading: boolean;
    input?: string;
    originUrl?: string;
  };
  magicHook: { content: string[]; isLoading: boolean };
  seoTags: { content: string[]; isLoading: boolean };
  productDescription: { content: string[]; isLoading: boolean };

  rating?: number;
};

type Props = {};

const BusinessDescHookTypes = (props: Props) => {
  const appName = "seo-optimize-intros";

  const {
    data: defaultProjectData,
    refetch: refetchDefaultProject,
    isLoading: isDefaultProjectLoading,
  } = useLoadDefaultAppsProjectQuery("") as {
    data: any;
    refetch: () => void;
    isLoading: boolean;
  };

  const router = useRouter();
  const funnelId = router.query.funnelId as string;

  const { data: funnel } = createFunnelApi.useGetFunnelQuery(
    { funnelId },
    { skip: !funnelId }
  );

  const [updateCompositeCreation] =
    useCompositeCreationFinalizeBusinessDescMutation();
  const [updateSpecificAppsProjectContentItems] =
    useUpdateSpecificAppsProjectContentItmesMutation();

  const [rateCreation, { isLoading: isRatingLoading }] =
    useRateCreationMutation();

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

  const [isAppDataLoading, setIsAppDataLoading] = useState(false);
  const [hookUpdateLoading, setHookUpdateLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [hooksData, setHooksData] = useState<BusinessDescHookType[]>(() => {
    const localData = localStorage.getItem("businessDescHookData");
    return localData ? JSON.parse(localData) : [];
  });

  // useEffect(() => {
  //   localStorage.setItem("businessDescHookData", JSON.stringify(hooksData));
  // }, [hooksData]);

  useEffect(() => {
    hooksData.forEach(async hook => {
      const allLoaded =
        !hook.magicHook.isLoading &&
        !hook.seoTags.isLoading &&
        !hook.productDescription.isLoading;

      const isValidId = hook.id.includes("hook");

      if (isValidId) {
        setHookUpdateLoading(prev => ({ ...prev, [hook.id]: true }));
      }
      if (allLoaded && isValidId) {
        try {
          const response = await updateCompositeCreation({
            input: { creationId: hook.id },
          }).unwrap();

          const updatedHooksData = hooksData.map(h => {
            if (h.id === hook.id) {
              return { ...h, id: response.id };
            }
            return h;
          });

          setHooksData(updatedHooksData);

          const formattedData = {
            projectId: projectId,
            applications: [
              {
                appName,
                contentItems: [updatedHooksData[0]],
              },
            ],
          };

          await updateSpecificAppsProjectContentItems(formattedData).unwrap();

          setHookUpdateLoading(prev => ({
            ...prev,
            [hook.id]: false,
          }));
          localStorage.removeItem("businessDescHookData");
        } catch (err) {
          console.error(
            "Error finalizing ecommerce creation for hook:",
            hook.id,
            err
          );
        }
      }
    });
  }, [hooksData, updateCompositeCreation]);

  const handleRatingChange = async (hookId: string, rating: number) => {
    try {
      const response = await rateCreation({
        creationId: hookId,
        rating: rating,
      }).unwrap();

      // const updatedHooksData = hooksData.map((hook) => {
      //   if (hook.id === hookId) {
      //     return { ...hook, rating: rating };
      //   }
      //   return hook;
      // });

      // setHooksData(updatedHooksData);
      // localStorage.setItem(
      //   "businessDescHookData",
      //   JSON.stringify(updatedHooksData),
      // );
      refetchAppData();
    } catch (err) {
      console.error("Error finalizing ecommerce creation:", err);
    }
  };

  const [hookRatingsId, setHookRatingsId] = useState<{
    [key: string]: number;
  }>({});

  const {
    data: appData,
    refetch: refetchAppData,
    isLoading: isFetchingAppData,
  } = useGetSpecifcAppsPojectAppNameQuery(
    {
      projectId: projectId,

      appName: appName,
    },
    { skip: !projectId }
  );

  const [deleteSpecificGeneration, { isLoading: isGeneratingDeleting }] =
    useDeleteSpecificGenerationMutation();
  const [deleteSpecificCreation, { isLoading: isCreationDeleting }] =
    useDeleteSpecificCreationMutation();

  const handleRemoveHook = async (hookId: any) => {
    try {
      await deleteSpecificGeneration({
        projectId,
        appName,
        generationNumber: hookId,
      }).unwrap();
      refetchAppData();
    } catch (error) {
      console.error("Failed to delete generation:", error);
    }
  };
  // const handleRemoveHook = (hookId: string) => {
  //   setHooksData(hooksData.filter((hook) => hook.id !== hookId));
  // };

  return (
    <>
      <Head>
        <title>SEO Optimized Intros</title>
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
                  <span>Business Description</span>
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
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold">Business Description</h2>
              <div className="mx-4">
                <ProjectsDropdown setProjectId={setProjectId} />
              </div>
            </div>
            <BusinessDescFrom
              setHooksData={setHooksData}
              hooksData={hooksData}
              hookRatingsId={hookRatingsId}
              appName={appName}
              setAppDataLoading={setIsAppDataLoading}
              projectId={projectId}
            />
          </div>
        </div>
        {(isAppDataLoading || isDefaultProjectLoading) && (
          <LoadingSkeleton skeletonCount={8} />
        )}
        <div className="flex justify-center">
          <div className="w-full justify-center pt-2 md:w-4/6">
            {hooksData.map(hook => (
              <div
                key={hook.id}
                className={`${isGeneratingDeleting ? "animate-pulse" : ""}`}
              >
                <BusinessDescResults
                  key={hook.id}
                  id={hook.id}
                  image={hook.image}
                  magicHook={hook.magicHook}
                  seoTags={hook.seoTags}
                  productDescription={hook.productDescription}
                  onRemove={handleRemoveHook}
                  rating={hook.rating}
                  onRatingChange={handleRatingChange}
                  ratingLoading={isRatingLoading}
                  setHooksData={setHooksData}
                  contentItemsId={hook.contentItemsId}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(BusinessDescHookTypes, USER_ROLES, "ai-platform");
