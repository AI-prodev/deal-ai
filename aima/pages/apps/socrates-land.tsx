import Link from "next/link";
import { useEffect, useState, useCallback, Fragment } from "react";
import { setPageTitle } from "../../store/themeConfigSlice";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";

import { Dialog, Transition, Tab } from "@headlessui/react";
import useWindowSize from "react-use/lib/useWindowSize";
import SizedConfetti from "react-confetti";
import Theses from "../../components/Theses";
import { ThesisData } from "@/interfaces/ThesisData";
import { saveAs } from "file-saver";
import { useRef } from "react";
import ThinkingAnimation from "../../components/ThinkingAnimation";

import LoadingAnimation from "@/components/LoadingAnimation";
import va from "@vercel/analytics";
import { GetServerSideProps } from "next";
import withAuth from "@/helpers/withAuth";
import { useAuth } from "@/helpers/useAuth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { IRootState } from "@/store";
import {
  startRequest,
  updateProgress,
} from "@/store/features/socratesLandSlice";
import { SocratesData } from "@/interfaces/ISocrates";
import { AsyncThunkAction } from "@reduxjs/toolkit";
import { retryToast, showMessage1, showMessage2 } from "@/utils/toast";
import TabContentOne from "../../components/socratesLand/TabContentOne";
import TabContentTwo, {
  TabContentTwoProps,
} from "../../components/socratesLand/TabContentTwo";
import TabContentThree from "../../components/socratesLand/TabContentThree";
import { SocratesLandData } from "@/interfaces/ISocratesLand";
import CustomModal from "@/components/socratesLand/CustomModal";
import { BUYER_ROLES } from "@/utils/roles";
import Head from "next/head";

type ActionTypes =
  | ReturnType<typeof startRequest>
  | ReturnType<typeof setPageTitle>
  | AsyncThunkAction<any, any, any>;

const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:3000";

const Wizards = () => {
  const [selectedProperty, setSelectedProperty] = useState("");
  const [manualProperty, setManualProperty] = useState("");

  const [selectedSkill, setSelectedSkill] = useState("");
  const [manualSkills, setManualSkills] = useState("");
  const [selectedOverall, setSelectedOvarall] = useState("");
  const [manualOverAll, setManualOverAll] = useState("");
  const [manualDislike, setManualDislike] = useState("");
  const [progress, setProgress] = useState(1);
  const [modal1, setModal1] = useState(false);
  const [activeTab, setActiveTab] = useState<any>(1);
  const [thesisDone, setThesisDone] = useState<boolean>(false);
  const [thesis, setThesis] = useState<ThesisData[] | []>([]);
  const [party, setParty] = useState(false);
  const [latestData, setLatestData] = useState<SocratesLandData>({
    property: "",
    skills: "",

    overall: "",
    dislike: "",
  });
  const [referenceNumber, setReferenceNumber] = useState<string | null>();
  const [remainingTime, setRemainingTime] = useState(180);

  //Get Token for Authorization
  const { data: session } = useSession();
  const router = useRouter();
  const jwtToken = session?.token;
  if (!jwtToken) {
    router.replace("/auth/cover-login");
  }

  // redux
  const dispatch = useDispatch<any>();
  const socratesStatus = useSelector(
    (state: IRootState) => state.socratesLand?.status
  );
  const socratesToken = useSelector(
    (state: IRootState) => state.socratesLand?.token
  );
  const progressGetThesis = useSelector(
    (state: IRootState) => state.socratesLand.thesis
  );
  const progressGetThesisDone = useSelector(
    (state: IRootState) => state.socratesLand.thesisDone
  );
  const progressGetParty = useSelector(
    (state: IRootState) => state.socratesLand.party
  );
  const progressGetError = useSelector(
    (state: IRootState) => state.socratesLand.error
  );

  useEffect(() => {
    if (activeTab === 3 && !thesisDone) {
      const timer = setInterval(() => {
        if (remainingTime == 0) return;
        setRemainingTime(prevTime => prevTime - 1);
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [activeTab, thesisDone]);

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  useEffect(() => {
    const updatedData = {
      skills: `${selectedSkill
        .replaceAll("\n", " ")
        .replaceAll('"', " ")
        .replaceAll("\\", " ")}, ${manualSkills
        .replaceAll("\n", " ")
        .replaceAll('"', " ")
        .replaceAll("\\", " ")}`,
      property: `${selectedProperty
        .replaceAll("\n", " ")
        .replaceAll('"', " ")
        .replaceAll("\\", " ")}, ${manualProperty
        .replaceAll("\n", " ")
        .replaceAll('"', " ")
        .replaceAll("\\", " ")}`,
      overall: `${selectedOverall
        .replaceAll("\n", " ")
        .replaceAll('"', " ")
        .replaceAll("\\", " ")}, ${manualOverAll
        .replaceAll("\n", " ")
        .replaceAll('"', " ")
        .replaceAll("\\", " ")}`,
      dislike: `${manualDislike
        .replaceAll("\n", " ")
        .replaceAll('"', " ")
        .replaceAll("\\", " ")}`,
    };

    setLatestData(updatedData);
  }, [
    selectedSkill,
    manualSkills,
    selectedProperty,
    manualProperty,
    selectedOverall,
    manualOverAll,

    manualDislike,
  ]);

  const latestDataRef = useRef<SocratesLandData>(latestData);

  useEffect(() => {
    latestDataRef.current = latestData;
  }, [latestData]);

  const handleDownload = (dataCallback: () => SocratesLandData | null) => {
    const data = dataCallback();

    if (data === null) {
      console.error("No data available for download");
      return;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, `${referenceNumber}.socrates`);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = async e => {
        if (e.target && e.target.result) {
          try {
            const data: SocratesLandData = JSON.parse(
              e.target.result as string
            ) as SocratesLandData;
            setLatestData(data);

            setActiveTab(3);
            await fireQuery(data);
          } catch (error) {
            console.error("Error reading the uploaded file:", error);
          }
        }
      };

      reader.readAsText(file);
    }
  };

  const progressCss = `bg-primary h-4 rounded-full w-${progress}/12 animated-progress`;

  const fireQuery = async (socData: SocratesLandData) => {
    setProgress(progress => progress - progress + 1);

    const maxRetries = 5;
    let retryCount = 0;
    let success = false;

    while (!success && ++retryCount <= maxRetries) {
      try {
        if (jwtToken) {
          dispatch(startRequest({ socData }));
        }

        setTimeout(() => showMessage1(), 1000);
        setTimeout(() => showMessage2(), 5000);

        success = true;
      } catch (err) {
        success = false;
        console.error(err);
        retryToast("warning", retryCount);
        await new Promise(res => setTimeout(res, 3000));
      }
    }
  };

  useEffect(() => {
    if (socratesToken) {
      dispatch(updateProgress({ tok: socratesToken, newFire: false }));
    }
  }, [socratesToken]);

  useEffect(() => {
    setThesis(progressGetThesis);
    setThesisDone(progressGetThesisDone);
    setParty(progressGetParty);
  }, [progressGetThesis, progressGetParty, progressGetThesisDone]);

  useEffect(() => {
    if (progressGetError) {
      setModal1(true);
    }
  }, [progressGetError]);

  const handleSelectedProperty = useCallback((commaSeparatedString: string) => {
    setSelectedProperty(commaSeparatedString);
  }, []);

  const handleManualPropertyInput = useCallback(
    (event: React.FormEvent<HTMLTextAreaElement>) => {
      setManualProperty(event.currentTarget.value);
    },
    []
  );

  const handleSelectedSkills = useCallback((commaSeparatedString: string) => {
    setSelectedSkill(commaSeparatedString);
  }, []);

  const handleManualSkillsInput = useCallback(
    (event: React.FormEvent<HTMLTextAreaElement>) => {
      setManualSkills(event.currentTarget.value);
    },
    []
  );

  const handleSelectedOverall = useCallback((commaSeparatedString: string) => {
    setSelectedOvarall(commaSeparatedString);
  }, []);

  const handleManualOverallInput = useCallback(
    (event: React.FormEvent<HTMLTextAreaElement>) => {
      setManualOverAll(event.currentTarget.value);
    },
    []
  );

  const handleManualDislikeInput = useCallback(
    (event: React.FormEvent<HTMLTextAreaElement>) => {
      setManualDislike(event.currentTarget.value);
    },
    []
  );

  const handleReferenceNumberChange = useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      setReferenceNumber(event.currentTarget.value);
    },
    []
  );

  const { width, height } = useWindowSize();

  const props: TabContentTwoProps = {
    handleSelectedProperty: handleSelectedProperty,
    handleManualPropertyInput: handleManualPropertyInput,
    handleSelectedSkills: handleSelectedSkills,
    handleManualSkillsInput: handleManualSkillsInput,
    handleManualDislikeInput: handleManualDislikeInput,
    handleSelectedOverall: handleSelectedOverall,
    handleManualOverallInput: handleManualOverallInput,

    handleReferenceNumberChange: handleReferenceNumberChange,
    handleDownload: handleDownload,
    setActiveTab: setActiveTab,
    fireQuery: fireQuery,
    latestDataRef: latestDataRef,
    activeTab: activeTab,
    latestData: latestData,
  };

  return (
    <>
      <Head>
        <title>Commercial Property Thesis Builder</title>
      </Head>
      <div>
        <div className={"root" + (party ? " party" : "")}>
          <SizedConfetti
            width={width}
            height={height}
            style={{ pointerEvents: "none" }}
            numberOfPieces={party ? 500 : 0}
            recycle={false}
            onConfettiComplete={confetti => {
              setParty(false);
              if (confetti) confetti.reset();
            }}
          />
        </div>
        {/* <div className="mb-5">
        <Transition appear show={modal1} as={Fragment}>
          <Dialog as="div" open={modal1} onClose={() => setModal1(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0" />
            </Transition.Child>
            <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
              <div className="flex min-h-screen items-start justify-center px-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel
                    as="div"
                    className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark"
                  >
                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                      <div className="text-lg font-bold">Socrates Error</div>
                      <button
                        type="button"
                        className="text-white-dark hover:text-dark"
                        onClick={() => setModal1(false)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                    <div className="p-5">
                      <p className="py-3">
                        On this occasion, it was not possible to generate your
                        theses. As alpha software, this sometimes happens,
                        please accept our apologies!
                      </p>
                      <p className="py-3">
                        We have automatically notified our development team, and
                        they'll get to work on fixing it right away.
                      </p>
                      <p className="py-3">Let's try again!</p>
                      <div className="mt-8 flex items-center justify-end">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={async () => {
                            await fireQuery(latestData);
                            return false;
                          }}
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div> */}
        <CustomModal
          modal={modal1}
          setModal={setModal1}
          fireQuery={fireQuery}
          latestData={latestData}
        />
        <ul className="flex space-x-2 rtl:space-x-reverse">
          <li>
            <Link href="#" className="text-primary hover:underline">
              Apps
            </Link>
          </li>
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <span>Commercial Property Thesis Builder</span>
          </li>
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <span>{socratesToken}</span>
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
                  Commercial Property Thesis Builder
                </h5>
              </div>

              <div className="mb-5">
                <div className="inline-block w-full">
                  <ul className="mb-5 grid grid-cols-1 text-center md:grid-cols-2 lg:grid-cols-3">
                    <li>
                      <div
                        className={`${
                          activeTab === 1 ? "!bg-primary text-white" : ""
                        }
                              my-2 block rounded-full bg-[#f3f2ee] p-2.5 dark:bg-[#1b2e4b]  md:my-0`}
                        onClick={() => setActiveTab(1)}
                      >
                        Introduction
                      </div>
                    </li>

                    <li>
                      <div
                        className={`${
                          activeTab === 2 ? "!bg-primary text-white" : ""
                        }  my-2 block rounded-full bg-[#f3f2ee] p-2.5 dark:bg-[#1b2e4b] md:my-0`}
                      >
                        Buyer
                      </div>
                    </li>

                    <li>
                      <div
                        className={`${
                          activeTab === 3 ? "!bg-primary text-white" : ""
                        }  my-2 block rounded-full bg-[#f3f2ee] p-2.5 dark:bg-[#1b2e4b] md:my-0`}
                      >
                        Thesis Result
                      </div>
                    </li>
                  </ul>

                  <div>
                    <div className="mb-5">
                      {activeTab === 1 && (
                        <TabContentOne
                          handleFileUpload={handleFileUpload}
                          setActiveTab={setActiveTab}
                        />
                      )}
                    </div>
                    <p className="mb-5">
                      {activeTab === 2 && <TabContentTwo {...props} />}
                    </p>
                    <p className="mb-5">
                      {activeTab === 3 && (
                        <TabContentThree
                          thesis={thesis}
                          thesisDone={thesisDone}
                          progressCss={progressCss}
                          minutes={minutes}
                          seconds={seconds}
                        />
                      )}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    {activeTab === 1 && (
                      <button
                        type="button"
                        className="btn btn-primary ltr:ml-auto rtl:mr-auto"
                        onClick={() => {
                          setActiveTab(2);
                        }}
                      >
                        Next
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(Wizards, BUYER_ROLES);
