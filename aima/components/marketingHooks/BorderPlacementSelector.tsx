import Tippy from "@tippyjs/react";
import React, { useEffect } from "react";

interface BorderPlacementSelectorProps {
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  values: { borderPlacement: string };
  tooltipContent: string;
}

const borderPlacementOptions = ["None", "Top and Bottom", "Top", "Bottom"];
const DEFAULT_BORDER_PLACEMENT = "None";

export const BorderPlacementSelector: React.FC<
  BorderPlacementSelectorProps
> = ({ setFieldValue, values, tooltipContent }) => {
  const handleBorderPlacementClick = (option: string) => {
    setFieldValue("borderPlacement", option);
  };

  useEffect(() => {
    handleBorderPlacementClick(
      values.borderPlacement || DEFAULT_BORDER_PLACEMENT
    );
  }, [values.borderPlacement, setFieldValue]);

  return (
    <div>
      <Tippy content={tooltipContent} placement="top">
        <label className="block w-fit text-left font-semibold text-white">
          Border Placement
        </label>
      </Tippy>
      <div className="my-4 flex flex-wrap justify-start space-x-2">
        {borderPlacementOptions.map(option => (
          <button
            key={option}
            type="button"
            className={`my-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              values.borderPlacement === option
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-300 text-white hover:bg-gray-100 hover:text-black"
            }`}
            onClick={() => handleBorderPlacementClick(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};
