import Link from "next/link";
import { useEffect, useState, Fragment } from "react";
import saveAs from "file-saver";
import * as Yup from "yup";
import { Field, Form, Formik, FormikProps } from "formik";
import Swal from "sweetalert2";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/router";
import withAuth from "@/helpers/withAuth";

import { useSession } from "next-auth/react";
import { ThesisBuildingProgress } from "@/components/ThesisBuildingProgress";
import { propertyTypeList } from "@/utils/data/others";
import ErrorModal from "@/components/newton/ErrorModal";
import { retryToast, showMessage1, showMessage2 } from "@/utils/toast";
import customFetch from "@/utils/customFetch";
import { BUYER_ROLES } from "@/utils/roles";
import Head from "next/head";

const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:3000";

interface FormValues {
  propertyName: string;
  propertyDescription: string;
  propertyType: string;
  acres: number;
  token?: any;
}

const FormValidation = Yup.object().shape({
  propertyName: Yup.string().required("Please enter the property name"),
  propertyDescription: Yup.string().required(
    "Please enter the property description"
  ),
  propertyType: Yup.string().required("Property type is required"),
  acres: Yup.number().optional(),
});

const Wizards = () => {
  const appName = "Commercial Property Evaluation Tool";

  const [loading, setLoading] = useState<Boolean>(false);
  const [ready, setReady] = useState<Boolean>(false);
  const [remainingTime, setRemainingTime] = useState(180);
  const [progress, setProgress] = useState(1);
  const [modal1, setModal1] = useState(false);
  const [results, setResults] = useState("");
  const [businessDetails, setBusinessDetails] = useState<FormValues>();

  const progressCss = `bg-primary h-4 rounded-full w-${progress}/12 animated-progress`;
  //Get Token for Authorization
  const { data: session } = useSession();
  const router = useRouter();
  const jwtToken = session?.token;

  const withRetries = async (fn: () => Promise<void>, maxRetries = 5) => {
    let retryCount = 0;
    let success = false;

    while (!success && ++retryCount <= maxRetries) {
      try {
        await fn();
        success = true;
      } catch (err) {
        console.error(err);
        retryToast("warning", retryCount);
        await new Promise(res => setTimeout(res, 3000));
      }
    }
  };

  const handleResponse = async (response: Response) => {
    const data = await response.json();

    setToken(data.token);

    setTimeout(async () => updateProgress(data.token, true), 100);
    setTimeout(() => showMessage1(), 1000);
    setTimeout(
      () => showMessage2("Building checklist (this may take up to 3 minutes)"),
      5000
    );
  };

  useEffect(() => {
    if (loading && !ready) {
      const timer = setInterval(() => {
        setRemainingTime(prevTime => prevTime - 1);
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [loading, ready]);

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  const [token, setToken] = useState("");

  const submitForm = async (values: FormValues) => {
    setReady(false);
    setLoading(true);
    setBusinessDetails({ ...values, token: "" });
    setProgress(1);

    await withRetries(async () => {
      const response = await customFetch(`${baseUrl}/newtonland`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(values),
      });
      await handleResponse(response);
    });
  };

  const updateProgress = async (tok: string, newFire: boolean) => {
    if (newFire) {
      setProgress(progress => progress - progress + 1);
    } else {
      if (progress < 12) setProgress(progress => progress + 1);
    }

    const maxRetries = 5;
    let retryCount = 0;
    let success = false;
    while (!success && ++retryCount <= maxRetries) {
      try {
        const response = await customFetch(`${baseUrl}/queryRequest/${tok}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        const data = await response.json();

        if (data.progress !== undefined) {
          setTimeout(
            () => updateProgress(tok, false),
            Math.floor(Math.random() * (15000 - 10000 + 1) + 10000)
          );

          return;
        }

        if (data?.status === "error") {
          console.error("error");

          setModal1(true);

          return;
        }

        if (data?.status === "completed") {
          const response = await customFetch(`${baseUrl}/endRequest/${tok}`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          });
          const data = await response.json();

          if (!data.response) {
            console.error("error");

            setModal1(true);

            return;
          }

          const theResponse = data.response;

          if (!theResponse.result) {
            console.error("error");

            setModal1(true);

            return;
          }

          const result = theResponse.result;

          if (!result) {
            console.error("error");

            setModal1(true);

            return;
          }

          setResults(result);
          setLoading(false);
          setReady(true);

          try {
            window.scrollTo(0, 0);
          } catch (e) {}
        }

        success = true;
      } catch (err) {
        console.error(err);
        retryToast("warning", retryCount);
        await new Promise(res => setTimeout(res, 3000));
      }
    }
  };

  let formikRef: { current: FormikProps<FormValues> | null } = {
    current: null,
  };

  useEffect(() => {
    if (formikRef.current && router.query.property) {
      const {
        name: propertyName = "",
        about: propertyDescription = "",
        type: propertyType = "",
        acres: acres = "",
      } = JSON.parse(router.query.property as string);

      formikRef.current.setValues((prevState: FormValues) => ({
        ...prevState,
        propertyName: propertyName || prevState.propertyName,
        propertyDescription:
          propertyDescription || prevState.propertyDescription,
        propertyType: propertyType || prevState.propertyType,
        acres: acres || prevState.acres,
      }));
    }
  }, [router.query]);

  return (
    <>
      <Head>
        <title>{appName}</title>
      </Head>
      <div>
        <ErrorModal
          open={modal1}
          onClose={() => setModal1(false)}
          onRetry={async () => {
            setLoading(false);
            setReady(false);
            return false;
          }}
        />
        <ul className="flex space-x-2 rtl:space-x-reverse">
          <li>
            <Link href="#" className="text-primary hover:underline">
              Apps
            </Link>
          </li>
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <span>{appName}</span>
          </li>
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <span>{token}</span>
          </li>
        </ul>
        <div className="space-y-8 pt-5">
          {/* <h4 className="badge mb-0 inline-block bg-primary text-base hover:top-0">
          Alpha Build - deal.ai Team Use Only
        </h4> */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="panel">
              <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">
                  {appName}
                </h5>
              </div>
              {!loading && !ready && (
                <Formik
                  initialValues={{
                    propertyName: "",
                    propertyType: "",
                    propertyDescription: "",
                    acres: 0,
                  }}
                  innerRef={formikInstance =>
                    (formikRef.current = formikInstance)
                  }
                  validationSchema={FormValidation}
                  onSubmit={submitForm}
                >
                  {({
                    errors,
                    submitCount,
                    touched,
                    values,
                    setFieldValue,
                  }) => (
                    <Form className="space-y-5">
                      <div
                        className={
                          submitCount
                            ? errors.propertyName
                              ? "has-error"
                              : "has-success"
                            : ""
                        }
                      >
                        <label htmlFor="propertyName">Property Name</label>
                        <div className="flex">
                          <Field
                            name="propertyName"
                            type="text"
                            id="propertyName"
                            className="form-input "
                          />
                        </div>
                        {submitCount ? (
                          errors.propertyName ? (
                            <div className="mt-1 text-danger">
                              {errors.propertyName}
                            </div>
                          ) : (
                            <div className="mt-1 text-success">Looks Good!</div>
                          )
                        ) : (
                          ""
                        )}
                      </div>

                      <div
                        className={
                          submitCount
                            ? errors.propertyDescription
                              ? "has-error"
                              : "has-success"
                            : ""
                        }
                      >
                        <label htmlFor="propertyDescription">
                          Property Description
                        </label>
                        <div className="flex ">
                          <Field
                            name="propertyDescription"
                            type="textarea"
                            as="textarea"
                            id="propertyDescription"
                            className="form-input whitespace-pre-wrap  "
                            rows={8}
                            style={{
                              height: "450px",
                            }}
                          />
                        </div>
                        {submitCount ? (
                          errors.propertyDescription ? (
                            <div className="mt-1 text-danger">
                              {errors.propertyDescription}
                            </div>
                          ) : (
                            <div className="mt-1 text-success">Looks Good!</div>
                          )
                        ) : (
                          ""
                        )}
                      </div>

                      <div
                        className={
                          submitCount
                            ? errors.propertyType
                              ? "has-error"
                              : "has-success"
                            : ""
                        }
                      >
                        {" "}
                        <label htmlFor="propertyType">Property Type</label>
                        <Field
                          as="select"
                          id="propertyType"
                          name="propertyType"
                          className="form-select mt-1 block w-full"
                        >
                          <option value="">Select Property Type</option>
                          {propertyTypeList.map(propertyType => (
                            <option key={propertyType} value={propertyType}>
                              {propertyType}
                            </option>
                          ))}
                        </Field>
                      </div>

                      <div
                        className={
                          submitCount
                            ? errors.propertyDescription
                              ? "has-error"
                              : "has-success"
                            : ""
                        }
                      >
                        <label htmlFor="acres">Property Acres (if known)</label>
                        <div className="flex">
                          <Field
                            type="number"
                            id="acres"
                            name="acres"
                            // disabled={formMode === "show"}
                            className="form-input"
                          />
                        </div>
                        {submitCount ? (
                          errors.acres ? (
                            <div className="mt-1 text-danger">
                              {errors.acres}
                            </div>
                          ) : (
                            <div className="mt-1 text-success">Looks Good!</div>
                          )
                        ) : (
                          ""
                        )}
                      </div>

                      <button type="submit" className="btn btn-primary !mt-6">
                        Create Due Diligence Checklist
                      </button>
                    </Form>
                  )}
                </Formik>
              )}
              {loading && !ready && (
                <div>
                  <ThesisBuildingProgress
                    minutes={minutes}
                    seconds={seconds}
                    progressCss={progressCss}
                    title="Building due diligence checklist..."
                  />
                </div>
              )}
              {!loading && ready && (
                <>
                  <div>
                    <ReactMarkdown
                      children={results}
                      components={{
                        h1: ({ node, ...props }) => (
                          <h5
                            className="mt-5 mb-5 text-lg font-semibold dark:text-white-light"
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h5
                            className="mt-5 mb-5 text-lg font-semibold dark:text-white-light"
                            {...props}
                          />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol
                            className="ml-5 list-decimal dark:text-white-light"
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li
                            className="mb-3 dark:text-white-light"
                            {...props}
                          />
                        ),
                      }}
                    />
                  </div>
                  {process.env.NEXT_PUBLIC_FF_BUSINESS_INFORMATION ===
                    "true" && (
                    <div className="flex flex-row">
                      <button>
                        <Link
                          href={{
                            pathname: "/apps/newton-property-bi-request",
                            query: {
                              loadeval: true,
                            },
                          }}
                          onClick={() => {
                            const {
                              name: propertyName = "",
                              about: propertyDescription = "",
                              type: propertyType = "",
                              acres: acres = "",
                              price = "",
                              email: email = "",
                              firstName: firstName = "",
                              lastName: lastName = "",
                            } = JSON.parse(
                              (router.query.property as string) || "{}"
                            );

                            const existingResults = localStorage.getItem(
                              "newtonPropertyResults"
                            );
                            if (!!existingResults) {
                              localStorage.removeItem("newtonPropertyResults");
                            }
                            localStorage.setItem(
                              "newtonPropertyResults",
                              JSON.stringify({
                                results,
                                propertyName:
                                  propertyName || businessDetails?.propertyName,
                                propertyDescription:
                                  propertyDescription ||
                                  businessDetails?.propertyDescription,
                                propertyType:
                                  propertyType || businessDetails?.propertyType,
                                acres: acres || businessDetails?.acres,
                                price,
                                firstName: firstName || null,
                                lastName: lastName || null,
                                email: email || null,
                              })
                            );
                          }}
                          className="btn btn-primary !mt-6"
                        >
                          Send to Seller
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            className="ml-2 h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                            />
                          </svg>
                        </Link>
                      </button>
                      <button
                        onClick={() => {
                          const {
                            name: propertyName = "",
                            about: propertyDescription = "",
                            type: propertyType = "",
                            acres: acres = "",
                            price = "",
                          } = JSON.parse(
                            (router.query.property as string) || "{}"
                          );
                          const blob = new Blob(
                            [
                              JSON.stringify(
                                {
                                  results,
                                  propertyName:
                                    propertyName ||
                                    businessDetails?.propertyName,
                                  propertyDescription:
                                    propertyDescription ||
                                    businessDetails?.propertyDescription,
                                  propertyType:
                                    propertyType ||
                                    businessDetails?.propertyType,
                                  acres: acres || businessDetails?.acres,
                                  price,
                                },
                                null,
                                2
                              ),
                            ],
                            {
                              type: "application/json",
                            }
                          );
                          saveAs(blob, `property-evaluation.newton`);
                        }}
                        className="btn btn-primary !mt-6 ml-3"
                      >
                        Export list
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          className="ml-2 h-4 w-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(Wizards, BUYER_ROLES);
