import React, { RefObject, useState, useCallback } from "react";
import ProfessionsButtonGroup from "../ProfessionsButtonGroup";
import CompetenciesButtonGroup from "../CompetenciesButtonGroup";
import NegativeCompetenciesButtonGroup from "../NegativeCompetenciesButtonGroup";
import HobbiesButtonGroup from "../HobbiesButtonGroup";
import { SocratesData } from "@/interfaces/ISocrates";
import _ from "lodash";
import va from "@vercel/analytics";
import SocratesLandButtonGroups from "./SocratesLandButtonGroups";
import {
  goalsButtons,
  propertyButtons,
  skillButtons,
} from "./scoratesLandButton";
import { SocratesLandData } from "@/interfaces/ISocratesLand";
import {
  showErrorToast,
  showErrorToastTimer,
  showSuccessToast,
} from "@/utils/toast";

const isValidInput = (input: string) => {
  const trimmedInput = _.trim(input, ", ");
  return !_.isEmpty(trimmedInput);
};

export interface TabContentTwoProps {
  handleSelectedProperty: (commaSeparatedString: string) => void;
  activeTab: number;
  handleManualPropertyInput: (
    event: React.FormEvent<HTMLTextAreaElement>
  ) => void;
  handleSelectedSkills: (commaSeparatedString: string) => void;
  handleManualSkillsInput: (
    event: React.FormEvent<HTMLTextAreaElement>
  ) => void;
  handleManualDislikeInput: (
    event: React.FormEvent<HTMLTextAreaElement>
  ) => void;
  handleSelectedOverall: (commaSeparatedString: string) => void;
  handleManualOverallInput: (
    event: React.FormEvent<HTMLTextAreaElement>
  ) => void;

  handleReferenceNumberChange: (
    event: React.FormEvent<HTMLInputElement>
  ) => void;
  handleDownload: (dataCallback: () => SocratesLandData | null) => void;
  setActiveTab: (value: number) => void;
  fireQuery: (data: any) => Promise<void>;
  latestDataRef: RefObject<SocratesLandData>;
  latestData: SocratesLandData;
}

const TabContentTwo: React.FC<TabContentTwoProps> = props => {
  //Move that to SocratesLandButtonGroups if necessary to add all Topics
  const [selectAll, setSelectAll] = useState(false);

  const handleToggleSelectAll = useCallback(() => {
    setSelectAll(prevState => !prevState);
  }, []);

  const {
    handleSelectedProperty,
    handleManualPropertyInput,
    handleSelectedSkills,
    handleManualSkillsInput,
    handleSelectedOverall,
    handleManualOverallInput,
    handleManualDislikeInput,
    handleReferenceNumberChange,
    handleDownload,
    setActiveTab,
    fireQuery,
    latestDataRef,
    activeTab,
    latestData,
  } = props;

  return (
    <form
      className="space-y-5"
      onSubmit={async event => {
        event.preventDefault();
        const { property, skills, overall } = latestData;
        if (
          isValidInput(property) &&
          isValidInput(skills) &&
          isValidInput(overall)
        ) {
          va.track("Run Socrates");
          setActiveTab(activeTab === 1 ? 2 : 3);
          await fireQuery(latestData);
        } else {
          showErrorToastTimer({
            title: "All fields except 'Dislikes' must be filled",
          });
        }
        return false;
      }}
    >
      <h5 className="text-lg font-semibold dark:text-white-light">
        Desired Property Types
      </h5>
      <button
        type="button"
        className={`btn ${selectAll ? "btn-secondary" : "btn-primary"} my-2`}
        onClick={handleToggleSelectAll}
      >
        {selectAll ? "Deselect All" : "Select All"}
      </button>

      <SocratesLandButtonGroups
        onSelectedItems={handleSelectedProperty}
        buttons={propertyButtons}
        selectAll={selectAll}
      />
      <div>
        <textarea
          placeholder="Other types of property if not in list above"
          className="form-input"
          onInput={handleManualPropertyInput}
        />
      </div>

      <h5 className="text-lg font-semibold dark:text-white-light">
        Background and Skills
      </h5>

      <SocratesLandButtonGroups
        onSelectedItems={handleSelectedSkills}
        buttons={skillButtons}
      />
      <div>
        <textarea
          placeholder="Other skills if not in list above"
          className="form-input"
          onInput={handleManualSkillsInput}
        />
      </div>

      <h5 className="text-lg font-semibold dark:text-white-light">
        Overall Goals
      </h5>

      <SocratesLandButtonGroups
        onSelectedItems={handleSelectedOverall}
        buttons={goalsButtons}
      />
      <div>
        <textarea
          placeholder="Other goals if not in list above"
          className="form-input"
          onInput={handleManualOverallInput}
        />
      </div>

      <h5 className="text-lg font-semibold dark:text-white-light">Dislikes</h5>
      <div>
        <textarea
          placeholder="Dislikes (if any)"
          className="form-input"
          onInput={handleManualDislikeInput}
        />
      </div>

      <div className="justify-left my-5 mb-5 flex items-center">
        <div className="w-full max-w-[32rem] rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
          <div className="py-7 px-6">
            <div className="mb-5 inline-block rounded-full bg-[#3b3f5c] p-3 text-[#f1f2f3]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="8"
                  cy="10"
                  r="2"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <circle
                  cx="2"
                  cy="2"
                  r="2"
                  transform="matrix(1 0 0 -1 14 16)"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 14V19"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M16 10V5"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M8 5V6"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M16 19V18"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h5 className="mb-4 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
              New!
            </h5>
            <p className="text-white-dark">Download your model for later use</p>
            <input
              placeholder="Buyer reference"
              className="form-input my-5"
              onInput={handleReferenceNumberChange}
            />
            <button
              type="button"
              className="btn btn-primary mt-5 rounded-full"
              onClick={() => {
                va.track("Download model");
                handleDownload(() => latestDataRef.current);
              }}
            >
              Download
              <svg
                className="ml-3"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 3V16M12 16L16 11.625M12 16L8 11.625"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 21H9C6.17157 21 4.75736 21 3.87868 20.1213C3 19.2426 3 17.8284 3 15M21 15C21 17.8284 21 19.2426 20.1213 20.1213C19.8215 20.4211 19.4594 20.6186 19 20.7487"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={async () => {
          <button
            // onClick={async (event) => {
            //   event.preventDefault();
            //   const { property, skills, overall } = latestData;
            //   if (
            //     isValidInput(property) &&
            //     isValidInput(skills) &&
            //     isValidInput(overall)
            //   ) {
            //     va.track("Run Socrates");
            //     setActiveTab(activeTab === 1 ? 2 : 3);
            //     await fireQuery(latestData);
            //   } else {
            //     showErrorToast(
            //       "Error: All fields except 'dislike' must be filled",
            //     );
            //   }
            //   return false;
            // }}
            className="btn btn-secondary !mt-6"
          >
            Build Thesis
          </button>;
        }}
        className="btn btn-secondary !mt-6"
      >
        Build Thesis
      </button>
    </form>
  );
};

export default TabContentTwo;
