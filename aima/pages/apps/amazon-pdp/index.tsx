import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { createFunnelApi } from "@/store/features/projectApi";

import {
  useCompositeCreationFinalizeEcommerceMutation,
  useRateCreationMutation,
} from "@/store/features/marketingHooksApi";
import AmazonResults from "@/components/amazon/AmazonResult";
import AmazonForm from "@/components/amazon/AmazonForm";
import Head from "next/head";

export type HookData = {
  id: number;
  hooks: any[];
  ratings?: { [hookId: string]: number };
  language?: string;
};

export type CommerceHook = {
  id: string;
  image?: {
    content: string;
    isLoading: boolean;
    input?: string;
    originUrl?: string;
  };
  magicHook: { content: string[]; isLoading: boolean };
  seoTags: { content: string[]; isLoading: boolean };
  productDescription: { content: string[]; isLoading: boolean };
  benefitStack: { content: string[]; isLoading: boolean };
  faq: { content: { q: string; a: string }[]; isLoading: boolean };
  rating?: number;
};

type Props = {};

const CommerceHooks = (props: Props) => {
  const router = useRouter();
  const funnelId = router.query.funnelId as string;

  const { data: funnel } = createFunnelApi.useGetFunnelQuery(
    { funnelId },
    { skip: !funnelId }
  );

  const [updateCompositeCreation] =
    useCompositeCreationFinalizeEcommerceMutation();
  const [rateCreation, { isLoading: isRatingLoading }] =
    useRateCreationMutation();

  const [hookUpdateLoading, setHookUpdateLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [hooksData, setHooksData] = useState<any[]>(() => {
    const localData = localStorage.getItem("amazonHooksData");
    return localData ? JSON.parse(localData) : [];
  });

  useEffect(() => {
    localStorage.setItem("amazonHooksData", JSON.stringify(hooksData));
  }, [hooksData]);

  useEffect(() => {
    hooksData.forEach(async hook => {
      const allLoaded =
        !hook.magicHook.isLoading &&
        !hook.seoTags.isLoading &&
        !hook.productDescription.isLoading &&
        !hook.benefitStack.isLoading &&
        !hook.faq.isLoading;

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
          setHookUpdateLoading(prev => ({
            ...prev,
            [hook.id]: false,
          }));
          localStorage.setItem(
            "amazonHooksData",
            JSON.stringify(updatedHooksData)
          );
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

      const updatedHooksData = hooksData.map(hook => {
        if (hook.id === hookId) {
          return { ...hook, rating: rating };
        }
        return hook;
      });

      setHooksData(updatedHooksData);
      localStorage.setItem("amazonHooksData", JSON.stringify(updatedHooksData));
    } catch (err) {
      console.error("Error finalizing ecommerce creation:", err);
    }
  };

  const [hookRatingsId, setHookRatingsId] = useState<{
    [key: string]: number;
  }>({});

  const handleRemoveHook = (hookId: string) => {
    setHooksData(hooksData.filter(hook => hook.id !== hookId));
  };

  return (
    <>
      <Head>
        <title>Amazon PDP</title>
      </Head>
      <div className="p-3">
        {funnel && (
          <ul className="mb-5 flex space-x-2 rtl:space-x-reverse">
            <li>
              <Link href="/projects" className="text-primary hover:underline">
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
              <span>Amazon PDP</span>
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

        <div>
          <h2 className="text-2xl font-bold">Amazon PDP</h2>
        </div>
        <div className="my-3 w-full max-w-lg justify-center pt-2 md:w-1/2">
          <AmazonForm
            setHooksData={setHooksData}
            hooksData={hooksData}
            hookRatingsId={hookRatingsId}
          />
        </div>
        <div className=" w-full justify-center pt-2 md:w-4/6 ">
          {hooksData.map(hook => (
            <AmazonResults
              key={hook.id}
              id={hook.id}
              image={hook.image}
              magicHook={hook.magicHook}
              seoTags={hook.seoTags}
              productDescription={hook.productDescription}
              benefitStack={hook.benefitStack}
              faq={hook.faq}
              onRemove={handleRemoveHook}
              rating={hook.rating}
              onRatingChange={handleRatingChange}
              ratingLoading={hookUpdateLoading[hook.id] || isRatingLoading}
              setHooksData={setHooksData}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default withAuth(CommerceHooks, USER_ROLES, "ai-platform");
