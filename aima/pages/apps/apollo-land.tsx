import Link from "next/link";
import {
  useEffect,
  useState,
  useCallback,
  Fragment,
  useRef,
  useMemo,
} from "react";
import { setPageTitle } from "../../store/themeConfigSlice";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { Dialog, Transition, Tab } from "@headlessui/react";
import useWindowSize from "react-use/lib/useWindowSize";
import SizedConfetti from "react-confetti";
import { ThesisData } from "@/interfaces/ThesisData";
import { useRouter } from "next/router";

import AskingPriceSlider from "@/components/AskingPriceSlider";
import AnimateHeight from "react-animate-height";

import withAuth from "@/helpers/withAuth";
import { useAuth } from "@/helpers/useAuth";
import { useSession } from "next-auth/react";
import ApolloForm from "@/components/ApolloForm";
import { IRootState } from "@/store";
import { updateProgress, startRequest } from "@/store/features/apolloSlice";
import LandMatcher from "@/components/apolloLand/LandMatcher";
import CustomModal from "@/components/socratesLand/CustomModal";
import FilterComponent from "@/components/apolloLand/Filter";
import { Button } from "@/components/Button";
import { StateDataTypes } from "@/utils/data/States";
import { ActionMeta } from "react-select";
import { BUYER_ROLES } from "@/utils/roles";
import Head from "next/head";

const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:3000";

const showMessage1 = () => {
  const toast = Swal.mixin({
    toast: true,
    position: "top-start",
    showConfirmButton: false,
    timer: 3000,
  });

  toast.fire({
    icon: "success",
    title: "Connecting to API",
    padding: "10px 20px",
  });
};

const showMessage2 = () => {
  const toast = Swal.mixin({
    toast: true,
    position: "top-start",
    showConfirmButton: false,
    timer: 3000,
  });

  toast.fire({
    title: "Building thesis (this may take up to 60 seconds)",
    padding: "10px 20px",
  });
};

const Wizards = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const [progress, setProgress] = useState(1);
  const [modal1, setModal1] = useState(false);
  const [thesisDone, setThesisDone] = useState<boolean>(false);
  const [thesis, setThesis] = useState<ThesisData | null>(null);
  const [party, setParty] = useState(false);
  const [slider, setSlider] = useState<any>([500, 4000]);
  const [percent, setPercent] = useState<any>([5, 40]);
  const [minAskingPrice, setMinAskingPrice] = useState<number | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[] | null>(
    null
  );
  const [maxAskingPrice, setMaxAskingPrice] = useState<number | null>(null);
  const [potentialCheckDuplicates, setPotentialCheckDuplicates] =
    useState(false);
  const [potentialDuplicates, setPotentialDuplicates] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [selectedButtons, setSelectedButtons] = useState<Button[]>([]);
  const [selectedSatesItem, setSelectedStateItem] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[] | null>(null);
  const [isThesisProcessed, setIsThesisProcessed] = useState(false);

  const dispatch = useDispatch<any>();
  const apolloStatus = useSelector(
    (state: IRootState) => state.apolloLand?.status
  );
  const apolloToken = useSelector(
    (state: IRootState) => state.apolloLand?.token
  );
  const progressGetThesis = useSelector(
    (state: IRootState) => state.apolloLand.thesis
  );
  const progressGetThesisDone = useSelector(
    (state: IRootState) => state.apolloLand.thesisDone
  );
  const progressGetParty = useSelector(
    (state: IRootState) => state.apolloLand.party
  );
  const progressGetError = useSelector(
    (state: IRootState) => state.apolloLand.error
  );

  interface SliderRef {
    getSliderValues: () => { low: number; high: number };
  }

  const sliderRef = useRef<SliderRef | null>(null);
  const handleFilterButtonClick = async () => {
    if (sliderRef.current) {
      setShowSpinner(true);
      setTimeout(() => {
        setShowSpinner(false);
      }, 10000);
      const { low, high } = sliderRef.current.getSliderValues();
      setMinAskingPrice(low);
      setMaxAskingPrice(high);
      setSelectedCountries(selectedButtons.map(button => button.label));
      setSelectedStates(selectedSatesItem);
      setPotentialDuplicates(potentialCheckDuplicates);
    }
  };

  const handleSelectedCountries = useCallback((selectedButtons: Button[]) => {
    setSelectedButtons(selectedButtons);
  }, []);

  useEffect(() => {
    if (
      selectedSatesItem &&
      selectedSatesItem.length > 0 &&
      !selectedButtons.some(button => button.label === "United States")
    ) {
      setSelectedButtons(prevButtons => [
        ...prevButtons,
        { label: "United States" },
      ]);
    }
  }, [selectedButtons, selectedSatesItem]);

  const handlePotentialDuplicatesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPotentialCheckDuplicates(e.target.checked);
  };

  const handleStatesChange = (
    option: readonly StateDataTypes[],
    actionMeta: ActionMeta<StateDataTypes>
  ) => {
    const selectedStatesValue =
      option && option.map((option: StateDataTypes) => option?.value);
    setSelectedStateItem(selectedStatesValue);
  };

  const [active, setActive] = useState<string>("0");
  const togglePara = (value: string) => {
    setActive(oldValue => {
      return oldValue === value ? "" : value;
    });
  };

  const jwtToken = session?.token;
  const thesisJson = useMemo(
    () => router.query.thesis as string | undefined,
    [router.query.thesis]
  );

  useEffect(() => {
    if (thesisJson && !isThesisProcessed) {
      try {
        setThesis(JSON.parse(thesisJson) as ThesisData);
        setIsThesisProcessed(true);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    }
  }, [thesisJson, isThesisProcessed]);

  const query = `
    {
      "professionHistory": ""
    }
  `;

  const progressCss = `bg-primary h-4 rounded-full w-${progress}/12 animated-progress`;

  const [token, setToken] = useState("");

  const fireQuery = async () => {
    setTimeout(() => showMessage1(), 1000);
    setTimeout(() => showMessage2(), 5000);

    dispatch(startRequest({ socData: query }));

    setTimeout(async () => {
      if (apolloToken) {
        dispatch(updateProgress({ tok: apolloToken, newFire: false }));
      }
    }, 5000);
  };

  useEffect(() => {
    if (progressGetThesis.thesis) {
      setThesis(progressGetThesis);
      setThesisDone(progressGetThesisDone);
      setParty(progressGetParty);
    }
  }, [progressGetThesis, progressGetParty, progressGetThesisDone]);

  const { width, height } = useWindowSize();

  return (
    <>
      <Head>
        <title>Explore Commercial Property</title>
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
        />
        <ul className="flex space-x-2 rtl:space-x-reverse">
          <li>
            <Link href="#" className="text-primary hover:underline">
              Apps
            </Link>
          </li>
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <span>Explore Commercial Property</span>
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
                  Explore Commercial Property
                </h5>
              </div>

              <div className="mb-5 flex items-center justify-center">
                <div className="grow rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
                  <div className="py-7 px-6">
                    {thesis?.thesis ? (
                      <>
                        <div className="mb-5 inline-block grow rounded-full bg-[#3b3f5c] p-3 text-[#f1f2f3]">
                          <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M14.5 19.5H9.5M14.5 19.5C14.5 18.7865 14.5 18.4297 14.5381 18.193C14.6609 17.4296 14.6824 17.3815 15.1692 16.7807C15.3201 16.5945 15.8805 16.0927 17.0012 15.0892C18.5349 13.7159 19.5 11.7206 19.5 9.5C19.5 8.62341 19.3496 7.78195 19.0732 7M14.5 19.5C14.5 20.4346 14.5 20.9019 14.299 21.25C14.1674 21.478 13.978 21.6674 13.75 21.799C13.4019 22 12.9346 22 12 22C11.0654 22 10.5981 22 10.25 21.799C10.022 21.6674 9.83261 21.478 9.70096 21.25C9.5 20.9019 9.5 20.4346 9.5 19.5M9.5 19.5C9.5 18.7865 9.5 18.4297 9.46192 18.193C9.3391 17.4296 9.31762 17.3815 8.83082 16.7807C8.67987 16.5945 8.11945 16.0927 6.99876 15.0892C5.4651 13.7159 4.5 11.7206 4.5 9.5C4.5 5.35786 7.85786 2 12 2C13.3637 2 14.6423 2.36394 15.7442 3"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <path
                              d="M12.7857 8.5L10.6428 11.5H13.6428L11.5 14.5"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <h5 className="mb-4 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
                          Your Thesis
                        </h5>
                        <p className="text-large text-white">
                          <h5 className="mb-4 text-xl font-semibold text-[#ffffff] dark:text-white-light">
                            {thesis?.thesis}
                          </h5>
                          <p className="text-md text-white-light">
                            <ul>
                              {thesis.me && (
                                <li className="mb-2.5">
                                  <span className="font-bold">
                                    Relevance to me:
                                  </span>{" "}
                                  {thesis?.me}
                                </li>
                              )}
                              {thesis.trends && (
                                <li>
                                  <span className="font-bold">
                                    Relevance to current trends:
                                  </span>{" "}
                                  {thesis?.trends}
                                </li>
                              )}
                            </ul>
                          </p>
                        </p>
                      </>
                    ) : (
                      <ApolloForm land />
                    )}
                  </div>
                </div>
              </div>
              {thesis?.thesis && (
                <>
                  <div className="mb-5">
                    <div className="space-y-2 font-semibold">
                      <div className="rounded border border-[#d3d3d3] dark:border-[#1b2e4b]">
                        <button
                          type="button"
                          className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] ${
                            active === "1" ? "!text-primary" : ""
                          }`}
                          onClick={() => togglePara("1")}
                        >
                          Advanced Options
                          <div
                            className={`ltr:ml-auto rtl:mr-auto ${
                              active === "1" ? "rotate-180" : ""
                            }`}
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="3"
                                stroke="#4361ee"
                                strokeWidth="1.5"
                              />
                              <path
                                d="M3.66122 10.6392C4.13377 10.9361 4.43782 11.4419 4.43782 11.9999C4.43781 12.558 4.13376 13.0638 3.66122 13.3607C3.33966 13.5627 3.13248 13.7242 2.98508 13.9163C2.66217 14.3372 2.51966 14.869 2.5889 15.3949C2.64082 15.7893 2.87379 16.1928 3.33973 16.9999C3.80568 17.8069 4.03865 18.2104 4.35426 18.4526C4.77508 18.7755 5.30694 18.918 5.83284 18.8488C6.07287 18.8172 6.31628 18.7185 6.65196 18.5411C7.14544 18.2803 7.73558 18.2699 8.21895 18.549C8.70227 18.8281 8.98827 19.3443 9.00912 19.902C9.02332 20.2815 9.05958 20.5417 9.15224 20.7654C9.35523 21.2554 9.74458 21.6448 10.2346 21.8478C10.6022 22 11.0681 22 12 22C12.9319 22 13.3978 22 13.7654 21.8478C14.2554 21.6448 14.6448 21.2554 14.8478 20.7654C14.9404 20.5417 14.9767 20.2815 14.9909 19.9021C15.0117 19.3443 15.2977 18.8281 15.7811 18.549C16.2644 18.27 16.8545 18.2804 17.3479 18.5412C17.6837 18.7186 17.9271 18.8173 18.1671 18.8489C18.693 18.9182 19.2249 18.7756 19.6457 18.4527C19.9613 18.2106 20.1943 17.807 20.6603 17C20.8677 16.6407 21.029 16.3614 21.1486 16.1272M20.3387 13.3608C19.8662 13.0639 19.5622 12.5581 19.5621 12.0001C19.5621 11.442 19.8662 10.9361 20.3387 10.6392C20.6603 10.4372 20.8674 10.2757 21.0148 10.0836C21.3377 9.66278 21.4802 9.13092 21.411 8.60502C21.3591 8.2106 21.1261 7.80708 20.6601 7.00005C20.1942 6.19301 19.9612 5.7895 19.6456 5.54732C19.2248 5.22441 18.6929 5.0819 18.167 5.15113C17.927 5.18274 17.6836 5.2814 17.3479 5.45883C16.8544 5.71964 16.2643 5.73004 15.781 5.45096C15.2977 5.1719 15.0117 4.6557 14.9909 4.09803C14.9767 3.71852 14.9404 3.45835 14.8478 3.23463C14.6448 2.74458 14.2554 2.35523 13.7654 2.15224C13.3978 2 12.9319 2 12 2C11.0681 2 10.6022 2 10.2346 2.15224C9.74458 2.35523 9.35523 2.74458 9.15224 3.23463C9.05958 3.45833 9.02332 3.71848 9.00912 4.09794C8.98826 4.65566 8.70225 5.17191 8.21891 5.45096C7.73557 5.73002 7.14548 5.71959 6.65205 5.4588C6.31633 5.28136 6.0729 5.18269 5.83285 5.15108C5.30695 5.08185 4.77509 5.22436 4.35427 5.54727C4.03866 5.78945 3.80569 6.19297 3.33974 7C3.13231 7.35929 2.97105 7.63859 2.85138 7.87273"
                                stroke="#4361ee"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        </button>

                        <FilterComponent
                          handleFilterButtonClick={handleFilterButtonClick}
                          sliderRef={sliderRef}
                          onSelectedItems={handleSelectedCountries}
                          active={active}
                          showSpinner={showSpinner}
                          handlePotentialDuplicatesChange={
                            handlePotentialDuplicatesChange
                          }
                          onSelectedStates={handleStatesChange}
                          showSelectState
                          hideCountry
                        />
                      </div>
                    </div>
                  </div>
                  <LandMatcher
                    thesis={thesis}
                    minAskingPrice={minAskingPrice}
                    maxAskingPrice={maxAskingPrice}
                    countries={selectedCountries}
                    potentialDuplicates={potentialDuplicates}
                    states={selectedStates}
                    combine
                  />
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
