import React, { RefObject } from "react";
import ProfessionsButtonGroup from "../ProfessionsButtonGroup";
import CompetenciesButtonGroup from "../CompetenciesButtonGroup";
import NegativeCompetenciesButtonGroup from "../NegativeCompetenciesButtonGroup";
import HobbiesButtonGroup from "../HobbiesButtonGroup";
import { SocratesData } from "@/interfaces/ISocrates";
import va from "@vercel/analytics";

export interface TabContentTwoProps {
  handleSelectedCompetencies: (commaSeparatedString: string) => void;
  activeTab: number;
  handleManualCompetenciesInput: (
    event: React.FormEvent<HTMLTextAreaElement>
  ) => void;
  handleSelectedProfessions: (commaSeparatedString: string) => void;
  handleManualProfessionsInput: (
    event: React.FormEvent<HTMLTextAreaElement>
  ) => void;
  handleManualCurrentBusinessesInput: (
    event: React.FormEvent<HTMLTextAreaElement>
  ) => void;
  handleSelectedNegativeCompetencies: (commaSeparatedString: string) => void;
  handleManualNegativeCompetenciesInput: (
    event: React.FormEvent<HTMLTextAreaElement>
  ) => void;
  handleSelectedHobbies: (commaSeparatedString: string) => void;
  handleManualHobbiesInput: (
    event: React.FormEvent<HTMLTextAreaElement>
  ) => void;
  handleReferenceNumberChange: (
    event: React.FormEvent<HTMLInputElement>
  ) => void;
  handleDownload: (dataCallback: () => SocratesData | null) => void;
  setActiveTab: (value: number) => void;
  fireQuery: (data: any) => Promise<void>;
  latestDataRef: RefObject<SocratesData>;
  latestData: SocratesData;
}

const TabContentTwo: React.FC<TabContentTwoProps> = props => {
  const {
    handleSelectedCompetencies,
    handleManualCompetenciesInput,
    handleSelectedProfessions,
    handleManualProfessionsInput,
    handleManualCurrentBusinessesInput,
    handleSelectedNegativeCompetencies,
    handleManualNegativeCompetenciesInput,
    handleSelectedHobbies,
    handleManualHobbiesInput,
    handleReferenceNumberChange,
    handleDownload,
    setActiveTab,
    fireQuery,
    latestDataRef,
    activeTab,
    latestData,
  } = props;
  return (
    <form className="space-y-5">
      <h5 className="text-lg font-semibold dark:text-white-light">
        Core Competencies
      </h5>
      <span className="mt-0.5 inline-block text-[14px] text-white-dark">{`Select five to ten of the buyer's stongest areas in order of importance.`}</span>
      <CompetenciesButtonGroup
        onSelectedCompetencies={handleSelectedCompetencies}
      />
      <div>
        <textarea
          placeholder="Other competencies if not in list above"
          className="form-input"
          onInput={handleManualCompetenciesInput}
        />
      </div>

      <h5 className="text-lg font-semibold dark:text-white-light">
        Professional History
      </h5>
      <span className="mt-0.5 inline-block text-[14px] text-white-dark">{`Select the current and previous professional history for the buyer in order from most to least recent.`}</span>
      <ProfessionsButtonGroup
        onSelectedProfessions={handleSelectedProfessions}
      />
      <div>
        <textarea
          placeholder="Other professions if not in list above"
          className="form-input"
          onInput={handleManualProfessionsInput}
        />
      </div>

      <h5 className="text-lg font-semibold dark:text-white-light">
        Current Businesses
      </h5>
      <span className="mt-0.5 inline-block text-[14px] text-white-dark">{`Current business the buyer is operating (if any).`}</span>
      <div>
        <textarea
          placeholder="Current business the buyer is operating (if any)"
          className="form-input"
          onInput={handleManualCurrentBusinessesInput}
        />
      </div>

      <h5 className="text-lg font-semibold dark:text-white-light">
        Negative Areas
      </h5>
      <span className="mt-0.5 inline-block text-[14px] text-white-dark">{`Select five to ten skill areas the buyer doesn't wish to match with prospective businesses in order of importance.`}</span>
      <NegativeCompetenciesButtonGroup
        onSelectedNegativeCompetencies={handleSelectedNegativeCompetencies}
      />
      <div>
        <textarea
          placeholder="Other negative areas if not in list above"
          className="form-input"
          onInput={handleManualNegativeCompetenciesInput}
        />
      </div>

      <h5 className="text-lg font-semibold dark:text-white-light">
        Hobbies and Interests
      </h5>
      <span className="mt-0.5 inline-block text-[14px] text-white-dark">{`(Optional) Select outside interests the buyer has in order of importance, to help the matching process`}</span>
      <HobbiesButtonGroup onSelectedHobbies={handleSelectedHobbies} />
      <div>
        <textarea
          placeholder="Other hobbies and interests if not in list above"
          className="form-input"
          onInput={handleManualHobbiesInput}
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
          va.track("Run Socrates");
          setActiveTab(activeTab === 1 ? 2 : 3);
          await fireQuery(latestData);
          return false;
        }}
        className="btn btn-secondary !mt-6"
      >
        Build Thesis
      </button>
    </form>
  );
};

export default TabContentTwo;
