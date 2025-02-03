import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import withAuth from "@/helpers/withAuth";
import { newtonBusinessApi } from "@/store/features/newtonApi";
import LoadingAnimation from "@/components/LoadingAnimation";
import BusinessTable from "@/components/bi-requests/BusinessTable";
import { ResponseItem } from "@/interfaces/IBusinessInformationRequest";
import { transformMarkdownToArrayOfObjects } from "@/utils/markdown-parsing.util";
import { ReadOnlyChecklistItem } from "@/components/bi-requests/ReadOnlyChecklistItem";
import Link from "next/link";
import { Tab } from "@headlessui/react";
import { BusinessList } from "@/components/consultants/BusinessList";
import { PropertyList } from "@/components/consultants/PropertyList";
import { CONSULTING_ROLES } from "@/utils/roles";

const DashBoard = () => {
  const appName = "Consultants Dashboard";
  const router = useRouter();

  const [getBusinessId, setGetBusinessId] = useState<string>(
    (router.query.id as string) || ""
  );

  const handleDetailChange = (detail: string) => {
    setGetBusinessId(detail);
  };
  useEffect(() => {
    if (getBusinessId !== "") {
      router.push(`/apps/consultant/dashboard?id=${getBusinessId}`, undefined, {
        shallow: true,
      });
    }
    if (getBusinessId === "") {
      router.push(`/apps/consultant/dashboard`, undefined, {
        shallow: true,
      });
    }
  }, [getBusinessId]);
  return (
    <div className=" custom-select space-y-8 overflow-auto pt-5 ">
      <ul className="flex space-x-2 rtl:space-x-reverse">
        <li>
          <Link href="#" className="text-primary hover:underline">
            Apps
          </Link>
        </li>
        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
          <span
            className={
              getBusinessId ? "cursor-pointer text-primary hover:underline" : ""
            }
            onClick={() => setGetBusinessId("")}
          >
            {appName}
          </span>
        </li>
        {getBusinessId && (
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <span>{getBusinessId}</span>
          </li>
        )}
      </ul>

      <Tab.Group>
        <Tab.List
          className={`flex space-x-1 rounded-xl bg-[#121c2c] p-1 ${
            getBusinessId ? "hidden" : ""
          }`}
        >
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-center ${
                selected ? "bg-blue-200 text-blue-700" : "text-blue-200"
              }`
            }
          >
            Business
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-center ${
                selected ? "bg-blue-200 text-blue-700" : "text-blue-200"
              }`
            }
          >
            Commercial Properties
          </Tab>
        </Tab.List>

        <Tab.Panels className="mt-2">
          <Tab.Panel className="rounded-lg bg-transparent p-4 shadow-md">
            <BusinessList
              appName={`Business ${appName}`}
              onDetailChange={handleDetailChange}
            />
          </Tab.Panel>
          <Tab.Panel className="rounded-lg  bg-transparent p-4 shadow-md">
            {/* 
      <PropertyList
        appName={`Commercial Property ${appName}`}
        onDetailChange={handleDetailChange}
      />
      */}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* <h5 className="text-lg font-semibold dark:text-white-light">
        {!businessData ? appName : businessData.response.business?.businessName}
      </h5>
      {!getBusinessId &&
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
          businessList?.response &&
          businessList.response.map((requestsList) => (
            <>
              <BusinessTable
                isDetail
                key={requestsList.businessName}
                business={requestsList}
                callback={setGetBusinessId}
              />
            </>
          ))
        ))}
      {getBusinessId && (
        <div className="panel w-[85rem]">
          <div className="flex flex-row space-y-8 py-4">
            <div className="flex max-h-[70vh] w-[120rem] flex-row overflow-y-auto rounded border border-white-light bg-white p-6 shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
              <div className="flex w-full flex-col">
                {businessData?.response?.checklist &&
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
                    ),
                  )}
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default withAuth(DashBoard, CONSULTING_ROLES);
