import Link from "next/link";
import { useEffect, useState, useCallback, Fragment } from "react";
import { setPageTitle } from "../../store/themeConfigSlice";
import { useDispatch, useSelector } from "react-redux";

import useWindowSize from "react-use/lib/useWindowSize";
import SizedConfetti from "react-confetti";

import { ThesisData } from "@/interfaces/ThesisData";
import { saveAs } from "file-saver";
import { useRef } from "react";

import withAuth from "@/helpers/withAuth";

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { IRootState } from "@/store";
import { startRequest, updateProgress } from "@/store/features/socratesSlice";
import { SocratesData } from "@/interfaces/ISocrates";
import { AsyncThunkAction } from "@reduxjs/toolkit";
import { retryToast, showMessage1, showMessage2 } from "@/utils/toast";
import TabContentOne from "../../components/socrates/TabContentOne";
import TabContentTwo, {
  TabContentTwoProps,
} from "../../components/socrates/TabContentTwo";
import TabContentThree from "../../components/socrates/TabContentThree";
import CustomModal from "@/components/socratesLand/CustomModal";
import { BUYER_ROLES } from "@/utils/roles";
import Head from "next/head";

type ActionTypes =
  | ReturnType<typeof startRequest>
  | ReturnType<typeof setPageTitle>
  | AsyncThunkAction<any, any, any>;

const Wizards = () => {
  const [selectedCompetencies, setSelectedCompetencies] = useState("");
  const [manualCompetencies, setManualCompetencies] = useState("");
  const [selectedHobbies, setSelectedHobbies] = useState("");
  const [manualHobbies, setManualHobbies] = useState("");
  const [selectedProfessions, setSelectedProfessions] = useState("");
  const [manualProfessions, setManualProfessions] = useState("");
  const [selectedNegativeCompetencies, setSelectedNegativeCompetencies] =
    useState("");
  const [manualNegativeCompetencies, setManualNegativeCompetencies] =
    useState("");
  const [manualCurrentBusinesses, setManualCurrentBusinesses] = useState("");
  const [progress, setProgress] = useState(1);
  const [modal1, setModal1] = useState(false);
  const [activeTab, setActiveTab] = useState<any>(1);
  const [thesisDone, setThesisDone] = useState<boolean>(false);
  const [thesis, setThesis] = useState<ThesisData[] | []>([]);
  const [party, setParty] = useState(false);
  const [latestData, setLatestData] = useState<SocratesData>({
    professionHistory: "",
    competencies: "",
    negativeCompetencies: "",
    hobbies: "",
    previousAcquisitions: "",
  });
  const [referenceNumber, setReferenceNumber] = useState<string | null>();
  const [remainingTime, setRemainingTime] = useState(180);

  //Get Token for Authorization
  const { data: session } = useSession();
  const router = useRouter();
  const jwtToken = session?.token;

  // redux
  const dispatch = useDispatch<any>();
  const socratesStatus = useSelector(
    (state: IRootState) => state.socrates?.status
  );
  const socratesToken = useSelector(
    (state: IRootState) => state.socrates?.token
  );
  const progressGetThesis = useSelector(
    (state: IRootState) => state.socrates.thesis
  );
  const progressGetThesisDone = useSelector(
    (state: IRootState) => state.socrates.thesisDone
  );
  const progressGetParty = useSelector(
    (state: IRootState) => state.socrates.party
  );
  const progressGetError = useSelector(
    (state: IRootState) => state.socrates.error
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
    const cleanText = (text: string) => {
      return typeof text === "string"
        ? text.replace(/\n/g, " ").replace(/"/g, " ").replace(/\\/g, " ")
        : text;
    };

    const updatedData = {
      professionHistory: `${cleanText(selectedProfessions)}, ${cleanText(
        manualProfessions
      )}`,
      competencies: `${cleanText(selectedCompetencies)}, ${cleanText(
        manualCompetencies
      )}`,
      negativeCompetencies: `${cleanText(
        selectedNegativeCompetencies
      )}, ${cleanText(manualNegativeCompetencies)}`,
      hobbies: `${cleanText(selectedHobbies)}, ${cleanText(manualHobbies)}`,
      previousAcquisitions: `${cleanText(manualCurrentBusinesses)}`,
    };

    setLatestData(updatedData);
  }, [
    selectedProfessions,
    manualProfessions,
    selectedCompetencies,
    manualCompetencies,
    selectedNegativeCompetencies,
    manualNegativeCompetencies,
    selectedHobbies,
    manualHobbies,
    manualCurrentBusinesses,
  ]);
  const latestDataRef = useRef<SocratesData>(latestData);

  useEffect(() => {
    latestDataRef.current = latestData;
  }, [latestData]);

  const handleDownload = (dataCallback: () => SocratesData | null) => {
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
            const data: SocratesData = JSON.parse(
              e.target.result as string
            ) as SocratesData;
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

  const fireQuery = async (socData: SocratesData) => {
    setProgress(progress => progress - progress + 1);

    const maxRetries = 5;
    let retryCount = 0;
    let success = false;

    while (!success && ++retryCount <= maxRetries) {
      try {
        dispatch(startRequest({ socData }));

        setTimeout(() => showMessage1(), 1000);
        setTimeout(() => showMessage2(), 5000);

        success = true;
      } catch (err) {
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

  // Create a  handler
  const createHandler = (setState: any) => {
    return (eventOrValue: React.FormEvent<HTMLTextAreaElement> | any) => {
      if (eventOrValue && eventOrValue.currentTarget) {
        // if it's an event object, extract value from it
        const value = eventOrValue.currentTarget.value;
        setState(value);
      } else {
        // if it's a direct value
        setState(eventOrValue);
      }
    };
  };

  const handleSelectedCompetencies = createHandler(setSelectedCompetencies);

  const handleManualCompetenciesInput = createHandler(setManualCompetencies);

  const handleSelectedHobbies = createHandler(setSelectedHobbies);

  const handleManualHobbiesInput = createHandler(setManualHobbies);

  const handleSelectedProfessions = createHandler(setSelectedProfessions);

  const handleManualProfessionsInput = createHandler(setManualProfessions);

  const handleSelectedNegativeCompetencies = createHandler(
    setSelectedNegativeCompetencies
  );

  const handleManualNegativeCompetenciesInput = createHandler(
    setManualNegativeCompetencies
  );

  const handleManualCurrentBusinessesInput = createHandler(
    setManualCurrentBusinesses
  );

  const handleReferenceNumberChange = createHandler(setReferenceNumber);

  const { width, height } = useWindowSize();

  const props: TabContentTwoProps = {
    handleSelectedCompetencies: handleSelectedCompetencies,
    handleManualCompetenciesInput: handleManualCompetenciesInput,
    handleSelectedProfessions: handleSelectedProfessions,
    handleManualProfessionsInput: handleManualProfessionsInput,
    handleManualCurrentBusinessesInput: handleManualCurrentBusinessesInput,
    handleSelectedNegativeCompetencies: handleSelectedNegativeCompetencies,
    handleManualNegativeCompetenciesInput:
      handleManualNegativeCompetenciesInput,
    handleSelectedHobbies: handleSelectedHobbies,
    handleManualHobbiesInput: handleManualHobbiesInput,
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
        <title>Business Thesis Builder</title>
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
            <span>Business Thesis Builder</span>
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
                  Business Thesis Builder
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
