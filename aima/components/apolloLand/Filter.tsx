import React, { useMemo } from "react";
import AnimateHeight from "react-animate-height";
import Select from "react-select";
import ButtonGroup from "../ButtonGroup";
import AskingPriceSlider from "../AskingPriceSlider";
import { Button } from "../Button";
import LoadingSpinner from "@/pages/components/loadingSpinner";
import { StateDataTypes, statesData } from "@/utils/data/States";
import { ActionMeta } from "react-select";

const countryButtons: Button[] = [
  {
    label: "United States",
  },
  { label: "Australia" },
  {
    label: "France",
  },
  {
    label: "Canada",
  },
  {
    label: "Spain",
  },
  {
    label: "South Africa",
  },
  {
    label: "United Kingdom",
  },
  {
    label: "India",
  },
  {
    label: "Thailand",
  },
  {
    label: "Italy",
  },
  {
    label: " New Zealand",
  },
  {
    label: "Germany",
  },
];

interface SliderRef {
  getSliderValues: () => { low: number; high: number };
}

interface FilterComponentProps {
  onSelectedItems: (selectedButtons: Button[]) => void;
  selectAll?: boolean;
  active: string;
  sliderRef: React.RefObject<SliderRef>;
  onSelectedStates?: (
    option: readonly StateDataTypes[],
    actionMeta: ActionMeta<StateDataTypes>
  ) => void;

  handleFilterButtonClick: () => void;
  showSpinner: boolean;
  handlePotentialDuplicatesChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  showSelectState?: boolean;
  hideCountry?: boolean;
}

const FilterIcon = () => (
  <svg
    fill="#FFFFFF"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    id="filter"
    data-name="Line Color"
    xmlns="http://www.w3.org/2000/svg"
    className="icon line-color"
  >
    <path
      id="primary"
      d="M5,4V6.64a1,1,0,0,0,.23.64l4.54,5.44a1,1,0,0,1,.23.64V21l4-2V13.36a1,1,0,0,1,.23-.64l4.54-5.44A1,1,0,0,0,19,6.64V4a1,1,0,0,0-1-1H6A1,1,0,0,0,5,4Z"
      style={{
        fill: "none",
        stroke: "#FFFFFF",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
      }}
    />
  </svg>
);

const PotentialDuplicates = ({
  onChange,
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex items-center p-2 ">
    <input
      type="checkbox"
      id="potentialDuplicate"
      className="form-checkbox"
      onChange={onChange}
    />
    <label
      htmlFor="potentialDuplicate"
      className="mb-0 items-center  justify-center text-center font-semibold text-white-dark"
    >
      Filter Potential Duplicates
    </label>
  </div>
);

const FilterComponent: React.FC<FilterComponentProps> = ({
  onSelectedItems,
  selectAll = false,
  active,
  sliderRef,
  handleFilterButtonClick,
  showSpinner,
  handlePotentialDuplicatesChange,
  onSelectedStates,
  showSelectState = false,
  hideCountry = false,
}) => {
  const getHeight = useMemo(() => (active === "1" ? "auto" : 0), [active]);

  return (
    <div>
      <AnimateHeight duration={300} height={getHeight}>
        <div className="space-y-2 border-t border-[#d3d3d3] p-4 text-[13px] text-white-dark dark:border-[#1b2e4b]">
          <AskingPriceSlider ref={sliderRef} />
          {!hideCountry && (
            <div>
              <ButtonGroup
                buttons={countryButtons}
                onSelect={onSelectedItems}
                selectAll={selectAll}
                flag
              />
            </div>
          )}

          {showSelectState && (
            <div className="custom-select ">
              <Select
                placeholder="Select states..."
                options={statesData}
                isMulti
                isSearchable={true}
                onChange={onSelectedStates}
              />
            </div>
          )}

          <PotentialDuplicates onChange={handlePotentialDuplicatesChange} />

          <button
            type="button"
            className="btn btn-primary mt-7 text-white"
            onClick={handleFilterButtonClick}
          >
            {showSpinner ? <LoadingSpinner isLoading /> : <FilterIcon />}
            Filter
          </button>
        </div>
      </AnimateHeight>
    </div>
  );
};

export default FilterComponent;
