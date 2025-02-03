// components/CommerceResults.tsx
import Tippy from "@tippyjs/react";
import React from "react";
import StarRating from "../marketingHooks/StarRating";
import useServerTokenTracking from "@/hooks/useServerTokenTracking";
import { CommerceHook } from "@/pages/apps/commerce";
import {
  useStartProductPlacementRequestMutation,
  useQueryProductPlacementRequestMutation,
  useEndProductPlacementRequestMutation,
} from "@/store/features/marketingHooksApi";
interface SectionProps {
  content: string[];
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

interface CommerceResultsProps {
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
  benefitStack: SectionProps;
  faq: {
    content: { q: string; a: string }[];
    isLoading: boolean;
  };
  onRemove: (id: string) => void;
  rating?: number;
  onRatingChange?: any;
  ratingLoading: boolean;
  setHooksData: React.Dispatch<React.SetStateAction<CommerceHook[]>>;
}

const AmazonResults: React.FC<CommerceResultsProps> = ({
  id,
  image,
  magicHook,
  seoTags,
  productDescription,
  benefitStack,
  faq,
  onRemove,
  rating,
  onRatingChange,
  ratingLoading,
  setHooksData,
}) => {
  const [startProductPlacement, { isLoading: isLoadingStartProductPlacement }] =
    useStartProductPlacementRequestMutation();
  const [queryProductPlacement] = useQueryProductPlacementRequestMutation();
  const [endProductPlacement] = useEndProductPlacementRequestMutation();
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

    dataToCopy += `Magic Hook\n${magicHook.content[0]}\n\n`;
    if (seoTags?.content?.length > 0) {
      dataToCopy += `SEO Tags\n${seoTags.content.join(", ")}\n\n`;
    }
    dataToCopy += `${magicHook.content[0]}\n\n${productDescription.content.join(
      "\n"
    )}\n\n`;
    dataToCopy += `${benefitStack.content
      .map(item => `- ${item}`)
      .join("\n")}\n\n`;
    dataToCopy += `FAQs\n${faq.content
      .map(faqItem => `Q: ${faqItem.q}\nA: ${faqItem.a}`)
      .join("\n\n")}`;

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
      localStorage.getItem("amazonHooksData") || "[]"
    );
    const updatedLocalStorageData = localStorageData.map((hook: any) => {
      if (hook.id === updatedHook.id) {
        return { ...hook, ...updatedHook };
      }
      return hook;
    });

    localStorage.setItem(
      "amazonHooksData",
      JSON.stringify(updatedLocalStorageData)
    );
  };

  const handleEndResponseProductPlacement = (data: any) => {
    const response = data?.response;
    if (response) {
      const updatedHookData: Partial<CommerceHook> = {
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

  const {
    startAndTrack: startAndTrackProductPlacement,
    isLoading: isLoadingProductPlacement,
    generationCount: generationCountProductPlacement,
  } = useServerTokenTracking({
    startRequest: startProductPlacement as any,
    queryRequest: queryProductPlacement as any,
    endRequest: endProductPlacement as any,
    tokenKey: "productPlacementToken",
    onEndResponse: handleEndResponseProductPlacement,
    geneationType: false,
  });

  const regeneratePlacement = async (input: string, originUrl: string) => {
    const submissionDataProductPlacement = {
      n: 1,
      url: originUrl,
      prompt: input,
    };

    const updatedHookData: Partial<CommerceHook> = {
      id: id,
      image: {
        content: originUrl,
        originUrl: originUrl,
        isLoading: true,
      },
    };

    updateHookData(updatedHookData);
    await startAndTrackProductPlacement(submissionDataProductPlacement);
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
            setRating={newRating => onRatingChange(id, newRating)}
            isLoading={ratingLoading || isLoadingStartProductPlacement}
          />
        )}
      </div>
      {image?.content ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative max-w-fit overflow-hidden rounded-lg  p-0 md:flex-row">
            <img
              src={image.content}
              alt="Product"
              className={`w-full object-contain transition ${
                image.isLoading && "animate-pulse"
              } duration-300 hover:scale-110`}
            />
            <div className="absolute top-3 right-3 flex items-end justify-end">
              {image?.input && !ratingLoading && (
                <button
                  type="button"
                  onClick={() => {
                    regeneratePlacement(
                      image?.input as string,
                      image.originUrl as string
                    );
                  }}
                  className="mx-2 rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
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
                        d="M2.93077 11.2003C3.00244 6.23968 7.07619 2.25 12.0789 2.25C15.3873 2.25 18.287 3.99427 19.8934 6.60721C20.1103 6.96007 20.0001 7.42199 19.6473 7.63892C19.2944 7.85585 18.8325 7.74565 18.6156 7.39279C17.2727 5.20845 14.8484 3.75 12.0789 3.75C7.8945 3.75 4.50372 7.0777 4.431 11.1982L4.83138 10.8009C5.12542 10.5092 5.60029 10.511 5.89203 10.8051C6.18377 11.0991 6.18191 11.574 5.88787 11.8657L4.20805 13.5324C3.91565 13.8225 3.44398 13.8225 3.15157 13.5324L1.47176 11.8657C1.17772 11.574 1.17585 11.0991 1.46759 10.8051C1.75933 10.5111 2.2342 10.5092 2.52824 10.8009L2.93077 11.2003ZM19.7864 10.4666C20.0786 10.1778 20.5487 10.1778 20.8409 10.4666L22.5271 12.1333C22.8217 12.4244 22.8245 12.8993 22.5333 13.1939C22.2421 13.4885 21.7673 13.4913 21.4727 13.2001L21.0628 12.7949C20.9934 17.7604 16.9017 21.75 11.8825 21.75C8.56379 21.75 5.65381 20.007 4.0412 17.3939C3.82366 17.0414 3.93307 16.5793 4.28557 16.3618C4.63806 16.1442 5.10016 16.2536 5.31769 16.6061C6.6656 18.7903 9.09999 20.25 11.8825 20.25C16.0887 20.25 19.4922 16.9171 19.5625 12.7969L19.1546 13.2001C18.86 13.4913 18.3852 13.4885 18.094 13.1939C17.8028 12.8993 17.8056 12.4244 18.1002 12.1333L19.7864 10.4666Z"
                        fill="#FFFFFF"
                      />
                    </svg>
                  </svg>
                </button>
              )}

              <button
                className="rounded bg-green-500 px-4 py-2 text-xs font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-md focus:outline-none"
                onClick={() => handleDownload(image.content)}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 3V16M12 16L16 11.625M12 16L8 11.625"
                    stroke="#FFFFFF"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M15 21H9C6.17157 21 4.75736 21 3.87868 20.1213C3 19.2426 3 17.8284 3 15M21 15C21 17.8284 21 19.2426 20.1213 20.1213C19.8215 20.4211 19.4594 20.6186 19 20.7487"
                    stroke="#FFFFFF"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-4 p-4">
            <h2 className="text-lg font-semibold text-gray-200">Magic Hook</h2>
            {magicHook.isLoading ? (
              <LoadingPlaceholder />
            ) : (
              <p className="text-gray-300">{magicHook.content[0]}</p>
            )}
            {seoTags.isLoading ? (
              <LoadingPlaceholder />
            ) : (
              seoTags.content.length > 0 && (
                <div className="mt-2">
                  <h3 className="text-lg font-semibold text-gray-200">
                    SEO Tags
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {seoTags.content.map((tag, index) => (
                      <span
                        key={index}
                        className="badge inline-block rounded-full bg-blue-600 px-3 py-1 text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          <h2 className="text-xl font-bold text-white">Magic Hook</h2>
          {magicHook.isLoading ? (
            <LoadingPlaceholder />
          ) : (
            <p className="text-gray-300">{magicHook.content[0]}</p>
          )}
          {seoTags.isLoading ? (
            <LoadingPlaceholder />
          ) : (
            seoTags.content.length > 0 && (
              <div className="mt-2">
                <h3 className="text-lg font-semibold text-gray-200">
                  SEO Tags
                </h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {seoTags.content.map((tag, index) => (
                    <span
                      key={index}
                      className="badge inline-block rounded-full bg-blue-600 px-3 py-1 text-sm transition hover:bg-blue-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )
          )}
          {/* <h3 className="text-lg font-semibold text-gray-200">
            Product Description
          </h3>
          {productDescription.isLoading ? (
            <LoadingPlaceholder />
          ) : (
            <p className="text-gray-300">{productDescription.content}</p>
          )} */}
        </div>
      )}

      <div className=" mt-6 p-4">
        {productDescription.isLoading ? (
          <LoadingPlaceholder />
        ) : (
          <>
            <p className="mb-5 font-black text-gray-300">
              {magicHook.content[0]}
            </p>
            <p className="text-gray-300">{productDescription.content}</p>
          </>
        )}
      </div>
      <div className="mt-6 p-4">
        {benefitStack.isLoading ? (
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
        {faq.isLoading ? (
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
      </div>
      <div className="flex items-end justify-end">
        <Tippy content="Copy" placement="top">
          <button
            className="mb-5 rounded bg-blue-500 px-4 py-2 text-xs font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-md focus:outline-none active:bg-blue-600 md:ml-4 md:mb-0"
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
            className="mb-5 rounded bg-red-500 px-4 py-2 text-xs font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-md focus:outline-none active:bg-blue-600 md:ml-4 md:mb-0"
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

export default AmazonResults;
