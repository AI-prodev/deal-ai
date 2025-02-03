import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import { skipToken } from "@reduxjs/toolkit/dist/query";

import { useAuth } from "@/helpers/useAuth";
import withAuth from "@/helpers/withAuth";

import LoadingAnimation from "@/components/LoadingAnimation";
import { transformMarkdownToArrayOfObjects } from "@/utils/markdown-parsing.util";
import { EditChecklistItem } from "@/components/bi-requests/EditChecklistItem";
import { ResponseItem } from "@/interfaces/IBusinessInformationRequest";
import { newtonPropertyApi } from "@/store/features/newtonPropertyApi";
import PropertyTable from "@/components/bi-requests/PropertyTable";
import { SELLER_ROLES } from "@/utils/roles";
import Head from "next/head";

const PropertyInformationRequestsDashboard = () => {
  useAuth();

  const router = useRouter();
  const { data: sessionData } = useSession();
  const [editingPropertyId, setEditingPropertyId] = useState<string>(
    (router.query.id as string) || ""
  );
  const [active1, setActive1] = useState<number>(1);
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const api = newtonPropertyApi();
  const {
    useGetPropertyInformationRequestsBySellerIdQuery,
    useGetPropertyInformationRequestsByIdQuery,
    usePatchPropertyRequestInformationMutation,
  } = api;

  const {
    data: sellerPropertyList,
    isError,
    isFetching,
    error,
  } = useGetPropertyInformationRequestsBySellerIdQuery(sessionData?.id || "");

  const {
    data: editingProperty,
    isError: isEditingPropertyWithError,
    isLoading: isEditingPropertyLoading,
    error: editingPropertyError,
  } = useGetPropertyInformationRequestsByIdQuery(
    editingPropertyId || skipToken
  );

  const [queryRequest, { isLoading }] =
    usePatchPropertyRequestInformationMutation();

  const appName = "Property Information Requests Dashboard";

  useEffect(() => {
    if (editingPropertyId !== "") {
      router.replace(
        `/apps/seller/bi-property-requests/dashboard?id=${editingPropertyId}`
      );
    }
  }, [editingPropertyId]);

  useEffect(() => {
    if (!isEditingPropertyLoading && !isEditingPropertyWithError) {
      setResponses(() => {
        if (
          editingProperty?.response?.responses &&
          editingProperty?.response?.responses?.length > 0
        ) {
          return editingProperty?.response?.responses;
        } else {
          return transformMarkdownToArrayOfObjects(
            editingProperty?.response?.checklist ?? ""
          );
        }
      });
    }
  }, [editingProperty]);

  const jwtToken = sessionData?.token;
  if (!jwtToken) {
    router.replace("/auth/cover-login");
  }

  const togglePara1 = (value: number) => {
    setActive1(oldValue => {
      return oldValue === value ? 0 : value;
    });
  };

  const handleSave = async (resps?: ResponseItem[]) => {
    const toast = Swal.mixin({
      toast: true,
      position: "top",
      showConfirmButton: false,
      timer: 3000,
    });
    try {
      await queryRequest({
        id: editingPropertyId,
        responses: resps || responses,
      }).unwrap();
      toast.fire({
        icon: "success",
        title: "Checklist saved!",
        padding: "10px 20px",
      });
    } catch (err: any) {
      console.error(err);
      toast.fire({
        icon: "error",
        title: "There was an error with your request, please try again later!",
        padding: "10px 20px",
      });
    }
  };

  const handleFinish = async () => {
    const toast = Swal.mixin({
      toast: true,
      position: "top",
      showConfirmButton: false,
      timer: 3000,
    });
    try {
      await queryRequest({
        id: editingPropertyId,
        responses,
        status: "completed",
      }).unwrap();
      toast.fire({
        icon: "success",
        title: "Checklist saved!",
        padding: "10px 20px",
      });
    } catch (err: any) {
      console.error(err);
      toast.fire({
        icon: "error",
        title: "There was an error with your request, please try again later!",
        padding: "10px 20px",
      });
    }
  };

  return (
    <>
      <Head>
        <title>{appName}</title>
      </Head>
      <div>
        <ul className="flex space-x-2 rtl:space-x-reverse">
          <li>
            <Link href="#" className="text-primary hover:underline">
              Apps
            </Link>
          </li>
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <span
              className={
                editingProperty
                  ? "cursor-pointer text-primary hover:underline"
                  : ""
              }
              onClick={() => setEditingPropertyId("")}
            >
              {appName}
            </span>
          </li>
          {editingPropertyId && (
            <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
              <span>{editingPropertyId}</span>
            </li>
          )}
        </ul>
        <div className="space-y-2 pt-5">
          <h5 className="text-lg font-semibold dark:text-white-light">
            {!editingProperty
              ? appName
              : editingProperty.response.property?.propertyName +
                " - " +
                `${editingProperty.response.buyer?.firstName} ${editingProperty.response.buyer?.lastName}` +
                " - Edit"}
          </h5>
          {!editingPropertyId ? (
            isError ? (
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
              sellerPropertyList?.response.map(requestsList => (
                <PropertyTable
                  key={requestsList.propertyName}
                  property={requestsList}
                  callback={setEditingPropertyId}
                />
              ))
            )
          ) : (
            <div className="panel w-[85rem]">
              <div className="flex flex-row space-y-8 py-4">
                <div className="flex max-h-[70vh] w-[120rem] flex-row overflow-y-auto rounded border border-white-light bg-white p-6 shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
                  <div className="flex w-full flex-col">
                    {editingProperty?.response?.checklist &&
                      responses.map((item, index: number) => {
                        if (item.isSentToSeller)
                          return item.isTitle ? (
                            <h1
                              key={`${item.text} - ${index}`}
                              className="py-6 text-xl font-semibold dark:text-white-light"
                            >
                              {item.text}
                            </h1>
                          ) : (
                            <EditChecklistItem
                              key={`${index}-${item.text}`}
                              item={item}
                              index={index}
                              active1={active1}
                              togglePara1={togglePara1}
                              responses={responses}
                              setResponses={setResponses}
                              handleSave={handleSave}
                            />
                          );
                      })}
                  </div>
                </div>
                <div className="!m-0 flex w-[50%] flex-col space-y-8 px-8">
                  <div>
                    <h4 className="text-lg text-white-light">
                      Do you want to save your progress?
                    </h4>
                    <span>
                      You can save and continue later, at your convenience.
                    </span>
                    <button
                      className="btn btn-primary !mt-6 h-[42px] w-[100px]"
                      onClick={() => handleSave()}
                      disabled={isLoading}
                    >
                      {isLoading && (
                        <svg
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="inline-block h-5 w-5 animate-[spin_2s_linear_infinite] align-middle ltr:mr-2 rtl:ml-2"
                        >
                          <line x1="12" y1="2" x2="12" y2="6"></line>
                          <line x1="12" y1="18" x2="12" y2="22"></line>
                          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                          <line
                            x1="16.24"
                            y1="16.24"
                            x2="19.07"
                            y2="19.07"
                          ></line>
                          <line x1="2" y1="12" x2="6" y2="12"></line>
                          <line x1="18" y1="12" x2="22" y2="12"></line>
                          <line
                            x1="4.93"
                            y1="19.07"
                            x2="7.76"
                            y2="16.24"
                          ></line>
                          <line
                            x1="16.24"
                            y1="7.76"
                            x2="19.07"
                            y2="4.93"
                          ></line>
                        </svg>
                      )}
                      Save
                    </button>
                  </div>
                  <div>
                    <h4 className="text-lg text-white-light">
                      Is checklist finished?
                    </h4>
                    <span>
                      So let us know, we will notify the buyer for you!
                    </span>
                    <button
                      className="btn btn-primary !mt-6 h-[42px] w-[100px]"
                      onClick={handleFinish}
                      disabled={isLoading}
                    >
                      {isLoading && (
                        <svg
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="inline-block h-5 w-5 animate-[spin_2s_linear_infinite] align-middle ltr:mr-2 rtl:ml-2"
                        >
                          <line x1="12" y1="2" x2="12" y2="6"></line>
                          <line x1="12" y1="18" x2="12" y2="22"></line>
                          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                          <line
                            x1="16.24"
                            y1="16.24"
                            x2="19.07"
                            y2="19.07"
                          ></line>
                          <line x1="2" y1="12" x2="6" y2="12"></line>
                          <line x1="18" y1="12" x2="22" y2="12"></line>
                          <line
                            x1="4.93"
                            y1="19.07"
                            x2="7.76"
                            y2="16.24"
                          ></line>
                          <line
                            x1="16.24"
                            y1="7.76"
                            x2="19.07"
                            y2="4.93"
                          ></line>
                        </svg>
                      )}
                      Finish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(PropertyInformationRequestsDashboard, SELLER_ROLES);
