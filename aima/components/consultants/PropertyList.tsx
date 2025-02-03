import React, { useEffect, useState } from "react";

import LoadingAnimation from "../LoadingAnimation";
import { ReadOnlyChecklistItem } from "../bi-requests/ReadOnlyChecklistItem";
import { useRouter } from "next/router";

import { ResponseItem } from "@/interfaces/IBusinessInformationRequest";
import { transformMarkdownToArrayOfObjects } from "@/utils/markdown-parsing.util";
import { newtonPropertyApi } from "@/store/features/newtonPropertyApi";
import PropertyTable from "../bi-requests/PropertyTable";
interface PropertyListProps {
  appName: string;
  onDetailChange: (detail: string) => void;
}

export const PropertyList: React.FC<PropertyListProps> = ({
  appName,
  onDetailChange,
}) => {
  const router = useRouter();
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [getPropertyId, setGetPropertyId] = useState<string>(
    (router.query.id as string) || ""
  );
  const [active1, setActive1] = useState<number>(1);
  const [editingItem, setEditingItem] = useState<number>();
  const [editingText, setEditingText] = useState<string>();
  const api = newtonPropertyApi();
  const {
    useGetPropertyInformationRequestsForConsultingQuery,
    useGetPropertyInformationRequestsByIdQuery,
    usePatchPropertyRequestInformationMutation,
  } = api;
  const {
    data: propertyList,
    isError,
    isFetching,
    error,
  } = useGetPropertyInformationRequestsForConsultingQuery("");
  const {
    data: propertyData,
    isError: isPropertyDataError,
    isFetching: isPropertyDataFetching,
    error: propertyError,
  } = useGetPropertyInformationRequestsByIdQuery(getPropertyId ?? "", {
    skip: !getPropertyId,
  });

  const [queryRequest, { isLoading }] =
    usePatchPropertyRequestInformationMutation();

  const togglePara1 = (value: number) => {
    setActive1(oldValue => {
      return oldValue === value ? 0 : value;
    });
  };

  useEffect(() => {
    if (getPropertyId !== "") {
      router.replace(`/apps/consultant/dashboard?id=${getPropertyId}`);
    }
    if (getPropertyId === "") {
      router.replace(`/apps/consultant/dashboard`);
    }
    if (onDetailChange) {
      onDetailChange(getPropertyId);
    }
  }, [getPropertyId]);

  useEffect(() => {
    if (!router.query.id) {
      setGetPropertyId("");
    }
  }, [router.query]);

  useEffect(() => {
    if (!isPropertyDataFetching && !isPropertyDataError) {
      setResponses(
        propertyData?.response?.responses &&
          propertyData?.response?.responses?.length > 0
          ? propertyData?.response?.responses || []
          : transformMarkdownToArrayOfObjects(
              propertyData?.response?.checklist || ""
            )
      );
    }
  }, [propertyData]);
  return (
    <div>
      <h5 className="my-4 text-lg font-semibold dark:text-white-light">
        {!getPropertyId
          ? appName
          : propertyData?.response.property?.propertyName}
      </h5>
      {!getPropertyId &&
        (isError ? (
          <div className="panel">
            <div className="flex flex-col items-center justify-center space-y-8 py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-24 w-24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <h1 className="text-4xl font-semibold dark:text-white-light">
                {(error as any)?.data?.message}
              </h1>
            </div>
          </div>
        ) : isFetching ? (
          <LoadingAnimation />
        ) : (
          propertyList?.response &&
          propertyList.response.map((requestsList, index) => (
            <div className="py-4" key={`${index}-${requestsList.propertyName}`}>
              <PropertyTable
                isDetail
                key={requestsList.propertyName}
                property={requestsList}
                callback={setGetPropertyId}
              />
            </div>
          ))
        ))}
      {getPropertyId && (
        <div className="panel w-[85rem]">
          <div className="flex flex-row space-y-8 py-4">
            <div className="flex max-h-[70vh] w-[120rem] flex-row overflow-y-auto rounded border border-white-light bg-white p-6 shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
              <div className="flex w-full flex-col">
                {propertyData?.response?.checklist &&
                  responses.map((item, index: number) =>
                    item.isTitle ? (
                      <div
                        key={`${index}-${item.text}`}
                        className="flex flex-row items-center justify-between"
                      >
                        <h1 className="py-6 text-xl font-semibold dark:text-white-light">
                          {item.text}
                        </h1>
                      </div>
                    ) : (
                      <ReadOnlyChecklistItem
                        isDetail
                        key={`${index}-${item.text}`}
                        item={item}
                        index={index}
                        active1={active1}
                        togglePara1={togglePara1}
                        responses={responses}
                        setResponses={setResponses}
                        editingItem={editingItem}
                        setEditingItem={setEditingItem}
                        editingText={editingText}
                        setEditingText={setEditingText}
                      />
                    )
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
