// components/BusinessDescResults.tsx
import Tippy from "@tippyjs/react";
import React from "react";
import StarRating from "../marketingHooks/StarRating";
import useServerTokenTracking from "@/hooks/useServerTokenTracking";
import { BusinessDescHookType } from "@/pages/apps/business-description";
import {
  useStartProductPlacementRequestMutation,
  useQueryProductPlacementRequestMutation,
  useEndProductPlacementRequestMutation,
} from "@/store/features/marketingHooksApi";
interface SectionProps {
  content: any;
  isLoading: boolean;
}

// A generic loading placeholder for content sections
const LoadingPlaceholder: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 rounded bg-gray-700"></div>
    <div className="h-4 rounded bg-gray-600"></div>
    <div className="h-4 w-5/6 rounded bg-gray-700"></div>
  </div>
);

interface BusinessDescResultsProps {
  id: string;
  image?: {
    content: string;
    isLoading: boolean;
    input?: string;
    originUrl?: string;
  };
  magicHook: SectionProps;
  seoTags: SectionProps;
  productDescription: SectionProps;

  onRemove: (id: string) => void;
  rating?: number;
  onRatingChange?: any;
  ratingLoading: boolean;
  setHooksData: React.Dispatch<React.SetStateAction<BusinessDescHookType[]>>;
  contentItemsId?: string;
}

const BusinessDescResults: React.FC<BusinessDescResultsProps> = ({
  id,
  image,
  magicHook,
  seoTags,
  productDescription,

  onRemove,
  rating,
  onRatingChange,
  ratingLoading,
  setHooksData,
  contentItemsId,
}) => {
  const handleDownload = async (img: any) => {
    const response = await fetch(img);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deal-ai-commerce.png`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const formatDataForCopy = () => {
    let dataToCopy = "";

    const magic = magicHook.content[0]?.id
      ? magicHook.content[0].h
      : magicHook.content[0];

    const productDesc = productDescription.content[0]?.id
      ? productDescription.content.map((item: any) => item.product).join("\n")
      : productDescription.content.join("\n");

    dataToCopy += `${magic}\n\n${productDesc}\n\n`;
    // dataToCopy += `${benefitStack.content
    //   .map((item) => `- ${item}`)
    //   .join("\n")}\n\n`;
    // dataToCopy += `FAQs\n${faq.content
    //   .map((faqItem) => `Q: ${faqItem.q}\nA: ${faqItem.a}`)
    //   .join("\n\n")}`;

    return dataToCopy;
  };

  const handleCopy = () => {
    const dataToCopy = formatDataForCopy();
    navigator.clipboard.writeText(dataToCopy).then(
      () => {},
      err => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  const handleCopySeo = () => {
    const dataToCopy =
      seoTags?.content?.length > 0
        ? seoTags.content[0]?.id
          ? seoTags.content.map((item: any) => item.tag).join(", ")
          : seoTags.content.join(", ")
        : "";

    navigator.clipboard.writeText(dataToCopy).then(
      () => {},
      err => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  const updateHookData = (updatedHook: any) => {
    setHooksData(prevData => {
      const updatedData = prevData.map(hook => {
        if (hook.id === updatedHook.id) {
          return { ...hook, ...updatedHook };
        }
        return hook;
      });

      return updatedData;
    });

    const localStorageData = JSON.parse(
      localStorage.getItem("businessDescHookData") || "[]"
    );
    const updatedLocalStorageData = localStorageData.map((hook: any) => {
      if (hook.id === updatedHook.id) {
        return { ...hook, ...updatedHook };
      }
      return hook;
    });

    localStorage.setItem(
      "businessDescHookData",
      JSON.stringify(updatedLocalStorageData)
    );
  };

  const handleEndResponseProductPlacement = (data: any) => {
    const response = data?.response;
    if (response) {
      const updatedHookData: Partial<BusinessDescHookType> = {
        id: id,
        image: {
          content: response && response[0]?.url,
          input: response && response[0]?.input?.prompt,
          originUrl: image?.originUrl,
          isLoading: false,
        },
      };
      updateHookData(updatedHookData);
    }
  };

  const regeneratePlacement = async (input: string, originUrl: string) => {
    const submissionDataProductPlacement = {
      n: 1,
      url: originUrl,
      prompt: input,
    };

    const updatedHookData: Partial<BusinessDescHookType> = {
      id: id,
      image: {
        content: originUrl,
        originUrl: originUrl,
        isLoading: true,
      },
    };

    updateHookData(updatedHookData);
    // await startAndTrackProductPlacement(submissionDataProductPlacement);
  };

  return (
    <div
      className="container mx-auto my-8 rounded-lg bg-gray-800 p-4 shadow-xl"
      key={id}
    >
      <div className="flex items-end justify-end p-2">
        {!id.includes("hook") && (
          <StarRating
            rating={rating as number}
            setRating={newRating => onRatingChange(contentItemsId, newRating)}
            isLoading={ratingLoading}
          />
        )}
      </div>

      <div className="space-y-4 p-4">
        {/* <h2 className="text-xl font-bold text-white">Magic Hook</h2>
          {magicHook?.isLoading  ? (
            <LoadingPlaceholder />
          ) : (
            <p className="text-gray-300">{magicHook.content[0]}</p>
          )} */}
        {seoTags?.isLoading ? (
          <LoadingPlaceholder />
        ) : (
          seoTags.content.length > 0 && (
            <div className="mt-2">
              <h3 className="mb-4  text-lg font-semibold text-gray-200">
                SEO Tags
                <Tippy content="Copy SEO tags" placement="top">
                  <button
                    className="mb-5 ml-2 rounded bg-blue-500 px-4 py-2 text-xs font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-md focus:outline-none active:bg-blue-600 md:mb-0 md:ml-4"
                    onClick={handleCopySeo}
                  >
                    <svg
                      width="18"
                      height="18"
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
              </h3>
              <div className="mt-1 flex flex-wrap gap-2">
                {seoTags.content.map((tag: any, index: any) => (
                  <span
                    key={index}
                    className="badge inline-block rounded-full bg-blue-600 px-3 py-1 text-sm transition hover:bg-blue-500"
                  >
                    {tag.id ? tag.tag : tag}
                  </span>
                ))}
              </div>
            </div>
          )
        )}
        {/* <h3 className="text-lg font-semibold text-gray-200">
            Product Description
          </h3>
          {productDescription?.isLoading  ? (
            <LoadingPlaceholder />
          ) : (
            <p className="text-gray-300">{productDescription.content}</p>
          )} */}
      </div>

      <div className=" mt-2 p-4">
        {magicHook?.isLoading ? (
          <LoadingPlaceholder />
        ) : (
          <p className="font-black text-gray-300 lg:text-base">
            {magicHook.content[0]?.id
              ? magicHook.content[0].h
              : magicHook.content[0]}
          </p>
        )}
      </div>

      <div className="p-4">
        {productDescription?.isLoading ? (
          <LoadingPlaceholder />
        ) : (
          <>
            {/* <p className="mb-5 font-black text-gray-300">
              {magicHook.content[0]}
            </p> */}
            <p className="text-gray-300 lg:text-base">
              {productDescription.content[0]?.id
                ? productDescription.content[0].product
                : productDescription.content}
            </p>
          </>
        )}
      </div>
      {/* <div className="mt-6 p-4">
        {benefitStack?.isLoading  ? (
          <LoadingPlaceholder />
        ) : (
          <ul className="list-disc space-y-2 pl-5 text-gray-300">
            {benefitStack.content.map((benefit: string, index: number) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-4 p-4">
        <h3 className="text-lg font-semibold text-gray-200">FAQs</h3>
        {faq?.isLoading  ? (
          <LoadingPlaceholder />
        ) : (
          <div
            className={`grid ${
              faq.content.length > 2 ? "md:grid-cols-2" : "md:grid-cols-1"
            } gap-2`}
          >
            {faq.content.map((faqItem, index) => (
              <div key={index} className="rounded-md bg-gray-800 p-2">
                <h3 className="text-sm font-semibold text-white">
                  {faqItem.q}
                </h3>
                <p className="mt-2 text-gray-300">{faqItem.a}</p>
              </div>
            ))}
          </div>
        )}
      </div> */}
      <div className="flex items-end justify-end">
        <Tippy content="Copy (except SEO tags)" placement="top">
          <button
            className="mb-5 rounded bg-blue-500 px-4 py-2 text-xs font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-md focus:outline-none active:bg-blue-600 md:mb-0 md:ml-4"
            onClick={handleCopy}
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
            className="mb-5 rounded bg-red-500 px-4 py-2 text-xs font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-md focus:outline-none active:bg-blue-600 md:mb-0 md:ml-4"
            onClick={() => onRemove(id)}
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
    </div>
  );
};

export default BusinessDescResults;
