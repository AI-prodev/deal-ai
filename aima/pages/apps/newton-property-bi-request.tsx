import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSession } from "next-auth/react";
import * as Yup from "yup";
import { Field, Form, Formik } from "formik";
import Swal from "sweetalert2";
import { newtonBusinessApi } from "@/store/features/newtonApi";
import withAuth from "@/helpers/withAuth";
import "@uiw/react-markdown-preview/markdown.css";
import "@uiw/react-md-editor/markdown-editor.css";
import LoadingAnimation from "@/components/LoadingAnimation";
import { CustomizableLines } from "@/components/bi-requests/buyer-list/CustomizableLines";
import {
  parseArrayOfItemsToMarkdown,
  transformMarkdownToArrayOfObjects,
} from "@/utils/markdown-parsing.util";
import { ResponseItem } from "@/interfaces/IBusinessInformationRequest";
import { BUYER_ROLES } from "@/utils/roles";
import Head from "next/head";

export interface NewtonCommercialResultsInterface {
  propertyName: string;
  propertyDescription: string;
  propertyType: string;
  acres: number;
  exclusive: boolean;
  location: string;
  price: number;
  results: string;
  token: string;
  url: string;
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
}

const PropertyBIRequest = () => {
  const { data: sessionData } = useSession();
  const { query } = useRouter();
  const [activeTab, setActiveTab] = useState<any>(1);
  const [loggedIn, setLoggedIn] = useState(false);
  const [evaluation, setEvaluation] = useState<ResponseItem[]>([]);
  const [property, setProperty] = useState<NewtonCommercialResultsInterface>({
    propertyName: "",
    propertyDescription: "",
    propertyType: "",
    acres: 0,
    exclusive: false,
    location: "",
    price: 0,
    results: "",
    token: "",
    url: "",
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
  });
  const SubmittedForm = Yup.object().shape({
    firstName: Yup.string().required("Please fill in the seller first name"),
    lastName: Yup.string().required("Please fill in the seller last name"),
    // preferredName: Yup.string().required("Please fill in the seller name"),
    email: Yup.string()
      .email("Invalid e-mail!")
      .required("Please fill in the seller e-mail")

      .test(
        "is-not-same-as-property-name",
        "You can't send checklist to your own property!",
        function (value) {
          return property?.email !== sessionData?.user?.email;
        }
      )
      .test(
        "is-not-same-as-user-email",
        "Please enter the seller's email address (not your own)",
        function (value) {
          return value !== sessionData?.user?.email;
        }
      ),
    confirmEmail: Yup.string()
      .oneOf([Yup.ref("email"), null], "Emails must match")
      .required("Required"),
  });

  const sessionToken = localStorage.getItem("sessionToken");
  const api = newtonBusinessApi();
  const { useSendSellerCommercialPropertyChecklistMutation } = api;

  const [queryRequest, { isLoading, isError }] =
    useSendSellerCommercialPropertyChecklistMutation();

  const appName = "Commercial Property Information Request Tool";

  const storedEvaluation = localStorage.getItem("newtonPropertyResults");
  const storedProperty = JSON.parse(storedEvaluation as string);

  useEffect(() => {
    if (sessionToken || process.env.NEXT_PUBLIC_DEBUG == "true") {
      setLoggedIn(true);
    }
    if (query?.loadeval) {
      setEvaluation(transformMarkdownToArrayOfObjects(storedProperty?.results));
      setProperty(storedProperty);
      setActiveTab(2);
    }
  }, []);

  const handleErrorClass = (error: string | undefined): string => {
    if (error) return "has-error";
    else return "has-success";
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    if (event?.target?.files && event?.target?.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = e => {
        if (e?.target?.result) {
          try {
            const { results } = JSON.parse(e.target.result as string);
            setEvaluation(transformMarkdownToArrayOfObjects(results));
            setProperty(
              e.target as unknown as NewtonCommercialResultsInterface
            );
            setActiveTab(2);
          } catch (error) {
            console.error("Error reading the uploaded file:", error);
          }
        }
      };

      reader.readAsText(file);
    }
  };

  return (
    <>
      <Head>
        <title>{appName}</title>
      </Head>
      <ul className="flex space-x-2 rtl:space-x-reverse">
        <li>
          <Link href="#" className="text-primary hover:underline">
            Apps
          </Link>
        </li>
        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
          <span>{appName}</span>
        </li>
      </ul>
      <div className="space-y-8 pt-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="panel">
            <div className="mb-5 flex items-center justify-between">
              <h5 className="text-lg font-semibold dark:text-white-light">
                {appName}
              </h5>
            </div>
            <div className="inline-block w-full">
              <ul className="mb-5 grid grid-cols-1 text-center md:grid-cols-2 lg:grid-cols-3">
                <li>
                  <div
                    className={`${
                      activeTab === 1 ? "!bg-primary text-white" : ""
                    }  my-2 block rounded-full bg-[#f3f2ee] p-2.5 dark:bg-[#1b2e4b] md:my-0`}
                    onClick={() => setActiveTab(1)}
                  >
                    Load Checklist
                  </div>
                </li>
                <li>
                  <div
                    className={`${
                      activeTab === 2 ? "!bg-primary text-white" : ""
                    } my-2 block rounded-full bg-[#f3f2ee] p-2.5 dark:bg-[#1b2e4b] md:my-0`}
                    onClick={() => {
                      if (evaluation.length > 0) setActiveTab(2);
                    }}
                  >
                    Review Evaluation Checklist
                  </div>
                </li>
                <li>
                  <div
                    className={`${
                      activeTab === 3 ? "!bg-primary text-white" : ""
                    }my-2 block rounded-full bg-[#f3f2ee] p-2.5 dark:bg-[#1b2e4b] md:my-0`}
                    onClick={() => {
                      if (evaluation.length > 0) setActiveTab(3);
                    }}
                  >
                    Seller Information
                  </div>
                </li>
              </ul>
              <div>
                <div className="mb-5">
                  {activeTab === 1 && (
                    <div className="my-5 mb-5 flex items-center justify-center">
                      <div
                        className={`flex w-full ${
                          !storedEvaluation ? "max-w-[32rem]" : ""
                        } flex-row rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none`}
                      >
                        {storedEvaluation && (
                          <div className=" space-between flex w-[50%] flex-col py-7 px-6">
                            <h5 className="mb-4 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
                              Restore previous property evaluation checklist
                            </h5>
                            <p className="text-white-dark">
                              We found you were perhaps editing a checklist. Do
                              you want to restore it?
                            </p>
                            <button
                              onClick={() => {
                                setEvaluation(
                                  transformMarkdownToArrayOfObjects(
                                    JSON.parse(storedEvaluation)?.results
                                  )
                                );
                                setProperty(storedProperty);
                                setActiveTab(2);
                              }}
                              className="btn btn-primary !mt-6 h-[42px]"
                            >
                              Load previous checklist
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="ml-3 h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                                />
                              </svg>
                            </button>
                          </div>
                        )}
                        <div
                          className={`${
                            !storedEvaluation ? "w-full" : "w-[50%]"
                          } flex flex-col justify-between py-7 px-6`}
                        >
                          <h5 className="mb-4 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
                            Import checklist
                          </h5>
                          <p className="text-white-dark">
                            Have a prebuilt markdown checklist? Upload it here!
                          </p>
                          <input
                            className="btn btn-primary px-auto mt-5"
                            type="file"
                            accept=".newton"
                            onChange={handleFileUpload}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-5">
                  {activeTab === 2 && (
                    <div className="my-5 mb-5 flex flex-col items-start justify-center">
                      <p className="my-5 text-white">
                        Do you want to edit the checklist? You can edit and
                        preview it. In the otherwise, you can skip to the Seller
                        Information section.
                      </p>
                      <CustomizableLines
                        checklist={evaluation}
                        setChecklist={setEvaluation}
                      />
                    </div>
                  )}
                </div>

                <div className="mb-5">
                  {activeTab === 3 && (
                    <div className="flex w-full flex-col items-stretch">
                      <h5 className="my-5 text-white">
                        You're almost done! All you need to do is tell us the
                        seller's name and e-mail address below. We'll send them
                        an invitation to join the platform and start answering
                        the due diligence checklist we generated for you. You'll
                        be able to track the process live and you can also
                        contact the seller based on their responses.
                      </h5>
                      <h5 className="my-5 text-white">
                        As soon as you click on "Send Checklist", the seller
                        will receive an e-mail notification with your Property
                        Information Request!
                      </h5>
                      <div className="mb-10 mt-5 w-[50%]">
                        <Formik
                          initialValues={{
                            firstName: property?.firstName || "",
                            lastName: property?.lastName || "",
                            preferredName:
                              property?.firstName && property?.lastName
                                ? `${property?.firstName} ${property?.lastName}`
                                : "",
                            email: property?.email || "",
                            confirmEmail: property?.email || "",
                          }}
                          validationSchema={SubmittedForm}
                          onSubmit={async (data, formikHelpers) => {
                            const toast = Swal.mixin({
                              toast: true,
                              position: "top",
                              showConfirmButton: false,
                              timer: 3000,
                            });

                            formikHelpers.setSubmitting(true);
                            data.preferredName = `${data.firstName} ${data.lastName}`;
                            try {
                              await queryRequest({
                                seller: data,
                                property: property ?? storedProperty,
                                responses: evaluation,
                                buyer:
                                  sessionData?.user?.email ||
                                  sessionData?.user?.name ||
                                  "",
                                checklist:
                                  parseArrayOfItemsToMarkdown(evaluation),
                              }).unwrap();
                              toast.fire({
                                icon: "success",
                                title:
                                  "Commercial Property Information Request sent!",
                                padding: "10px 20px",
                              });
                            } catch (err: any) {
                              console.error(err);
                              toast.fire({
                                icon: "error",
                                title:
                                  "There was an error with your request, please try again later!",
                                padding: "10px 20px",
                              });
                            } finally {
                              formikHelpers.setSubmitting(false);
                            }
                          }}
                        >
                          {({ errors, submitCount, isSubmitting }) => (
                            <Form className="space-y-5">
                              <div
                                className={
                                  submitCount
                                    ? handleErrorClass(errors.firstName)
                                    : ""
                                }
                              >
                                <label htmlFor="firstName">
                                  Seller First Name
                                </label>
                                <Field
                                  name="firstName"
                                  type="text"
                                  id="sellerFirstName"
                                  placeholder="Seller first name..."
                                  className="form-input"
                                  disabled={property?.firstName}
                                />

                                {submitCount
                                  ? errors.firstName && (
                                      <div className="mt-1 text-danger">
                                        {errors.firstName}
                                      </div>
                                    )
                                  : ""}
                              </div>
                              <div
                                className={
                                  submitCount
                                    ? handleErrorClass(errors.lastName)
                                    : ""
                                }
                              >
                                <label htmlFor="lastName">
                                  Seller Last Name
                                </label>
                                <Field
                                  name="lastName"
                                  type="text"
                                  id="sellerLastName"
                                  placeholder="Seller last name..."
                                  className="form-input"
                                  disabled={property?.lastName}
                                />

                                {submitCount
                                  ? errors.lastName && (
                                      <div className="mt-1 text-danger">
                                        {errors.lastName}
                                      </div>
                                    )
                                  : ""}
                              </div>
                              {/* <div
                                className={
                                  submitCount
                                    ? handleErrorClass(errors.lastName)
                                    : ""
                                }
                              >
                                <label htmlFor="preferredName">
                                  Seller Preferred Name
                                </label>
                                <Field
                                  name="preferredName"
                                  type="text"
                                  id="preferredName"
                                  placeholder="Seller preferred name..."
                                  className="form-input"
                                />

                                {submitCount
                                  ? errors.preferredName && (
                                      <div className="mt-1 text-danger">
                                        {errors.preferredName}
                                      </div>
                                    )
                                  : ""}
                              </div> */}

                              <div
                                className={
                                  submitCount
                                    ? handleErrorClass(errors.email)
                                    : ""
                                }
                              >
                                <label htmlFor="email">Seller E-mail</label>
                                <Field
                                  name="email"
                                  type="email"
                                  id="email"
                                  placeholder="Seller e-mail..."
                                  className="form-input"
                                  disabled={property?.email}
                                />
                                {submitCount
                                  ? errors.email && (
                                      <div className="mt-1 text-danger">
                                        {errors.email}
                                      </div>
                                    )
                                  : ""}
                              </div>
                              <div
                                className={
                                  submitCount
                                    ? handleErrorClass(errors.confirmEmail)
                                    : ""
                                }
                              >
                                <label htmlFor="confirmEmail">
                                  Confirm Seller E-mail
                                </label>
                                <Field
                                  name="confirmEmail"
                                  type="email"
                                  id="confirmEmail"
                                  placeholder="Confirm seller e-mail..."
                                  className="form-input"
                                  disabled={property?.email}
                                />
                                {submitCount
                                  ? errors.confirmEmail && (
                                      <div className="mt-1 text-danger">
                                        {errors.confirmEmail}
                                      </div>
                                    )
                                  : ""}
                              </div>

                              {!isSubmitting && !isLoading ? (
                                <button
                                  type="submit"
                                  disabled={
                                    isSubmitting || isError || isLoading
                                  }
                                  className="btn btn-primary !mt-6"
                                >
                                  Send Checklist
                                </button>
                              ) : (
                                <div className="w-[25%] text-center">
                                  <LoadingAnimation height={35} width={35} />
                                </div>
                              )}
                            </Form>
                          )}
                        </Formik>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  className={`btn btn-primary ${
                    activeTab === 1 ? "hidden" : ""
                  }`}
                  onClick={() => setActiveTab(activeTab === 3 ? 2 : 1)}
                >
                  Back
                </button>
                {activeTab === 2 && (
                  <button
                    type="button"
                    className={`${
                      activeTab === 1 && !evaluation ? "hidden" : ""
                    } btn btn-primary ltr:ml-auto rtl:mr-auto`}
                    disabled={!evaluation}
                    onClick={() => setActiveTab(activeTab === 1 ? 2 : 3)}
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(PropertyBIRequest, BUYER_ROLES);
