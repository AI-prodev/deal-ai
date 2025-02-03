import Link from "next/link";
import { useEffect, useState, Fragment } from "react";
import saveAs from "file-saver";
import * as Yup from "yup";
import { Field, Form, Formik, FormikProps } from "formik";
import Swal from "sweetalert2";
import { useSpring, animated } from "react-spring";
import useMeasure from "react-use-measure";
import { Dialog, Transition, Tab } from "@headlessui/react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/router";
import withAuth from "@/helpers/withAuth";

import { useSession } from "next-auth/react";
import { ThesisBuildingProgress } from "@/components/ThesisBuildingProgress";
import ErrorModal from "@/components/newton/ErrorModal";
import NewTonForm from "@/components/newton/NewTonForm";
import { BUYER_ROLES } from "@/utils/roles";
import Head from "next/head";

const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:3000";

interface FormValues {
  businessName: string;
  entityName: string;
  entityType: string;
  businessDescription: string;
  purchaseType: boolean;
  includedAssets: string;
  ownershipStructure: string;
  ownerNamesAndPercentages: string;
  knownLiabilities: boolean;
  liabilities: string;
}

const FormValidation = Yup.object().shape({
  businessName: Yup.string().required("Please enter the business name"),
  entityName: Yup.string().optional(),
  entityType: Yup.string().optional(),
  businessDescription: Yup.string().required(
    "Please enter the business description"
  ),
});

const Wizards = () => {
  const appName = "Evaluation Tool";

  const [hasEntity, setHasEntity] = useState(false);
  const [purchaseType, setPurchaseType] = useState(false);
  const [ownershipStructureKnown, setOwnershipStructureKnown] = useState(false);
  const [liabilitiesKnown, setLiabilitiesKnown] = useState(false);

  const [loading, setLoading] = useState<Boolean>(false);
  const [ready, setReady] = useState<Boolean>(false);
  const [remainingTime, setRemainingTime] = useState(180);
  const [progress, setProgress] = useState(1);
  const [modal1, setModal1] = useState(false);
  const [results, setResults] = useState("");
  const [businessDetails, setBusinessDetails] = useState({});

  const progressCss = `bg-primary h-4 rounded-full w-${progress}/12 animated-progress`;
  //Get Token for Authorization
  const { data: session } = useSession();
  const router = useRouter();
  const jwtToken = session?.token;

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

  let formikRef: { current: FormikProps<FormValues> | null } = {
    current: null,
  };

  const Formprops = {
    setReady: setReady,
    setLoading: setLoading,
    setBusinessDetails: setBusinessDetails,

    token,
    setProgress: setProgress,
    setToken: setToken,
    jwtToken,
    progress,
    setResults: setResults,
    setModal1: setModal1,
  };

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
              {!loading && !ready && <NewTonForm {...Formprops} />}
              {loading && !ready && (
                <div>
                  {/* <h5 className="mb-3 text-lg font-semibold dark:text-white-light">
                  Building due diligence checklist...
                </h5>
                <LoadingAnimation className="mb-5 max-w-[9rem]" /> */}
                  <ThesisBuildingProgress
                    minutes={minutes}
                    seconds={seconds}
                    progressCss={progressCss}
                    title="Building due diligence checklist..."
                  />
                  {/* <p className="mb-3 text-lg font-semibold dark:text-white-light">{`About ${minutes}m ${seconds}s remaining`}</p>
               
                <div
                  className={progressCss}
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg,hsla(0,0%,100%,.15) 25%,transparent 0,transparent 50%,hsla(0,0%,100%,.15) 0,hsla(0,0%,100%,.15) 75%,transparent 0,transparent)",
                    backgroundSize: "1rem 1rem",
                  }}
                ></div> */}
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
                      <button
                        onClick={() => {
                          const {
                            url,
                            location,
                            price,
                            firstName,
                            lastName,
                            email,
                          } = JSON.parse(router?.query?.business as string);

                          const existingResults =
                            localStorage.getItem("newtonResults");
                          if (!!existingResults) {
                            localStorage.removeItem("newtonResults");
                          }
                          localStorage.setItem(
                            "newtonResults",
                            JSON.stringify({
                              results,
                              ...businessDetails,
                              url: url || null,
                              location: location || null,
                              price: price || null,
                              firstName: firstName || null,
                              lastName: lastName || null,
                              email: email || null,
                            })
                          );
                        }}
                      >
                        <Link
                          href={{
                            pathname: "/apps/newton-bi-request",
                            query: {
                              loadeval: true,
                            },
                          }}
                          className="btn btn-primary !mt-6"
                        >
                          Send to Seller
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
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
                            url,
                            location,
                            price,
                            firstName,
                            lastName,
                            email,
                          } = JSON.parse(router?.query?.business as string);
                          const blob = new Blob(
                            [
                              JSON.stringify(
                                {
                                  results,
                                  ...businessDetails,
                                  url: url || null,
                                  location: location || null,
                                  price: price || null,
                                  firstName: firstName || null,
                                  lastName: lastName || null,
                                  email: email || null,
                                },
                                null,
                                2
                              ),
                            ],
                            {
                              type: "application/json",
                            }
                          );
                          saveAs(blob, `evaluation.newton`);
                        }}
                        className="btn btn-primary !mt-6 ml-3"
                      >
                        Export list
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
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
