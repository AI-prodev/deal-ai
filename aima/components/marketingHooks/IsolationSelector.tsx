import Tippy from "@tippyjs/react";
import React, { useEffect } from "react";
import { LabeledTooltip } from "./LabeledTooltip";

interface IsolationSelectorProps {
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  values: { isolation: string };
  tooltipContent: string;
  tooltipContentIconLink?: string;
}

const isolationOptions = ["None", "Black", "White", "Color"];
const DEFAULT_ISOLATION = "Black";

export const IsolationSelector: React.FC<IsolationSelectorProps> = ({
  setFieldValue,
  values,
  tooltipContent,
  tooltipContentIconLink,
}) => {
  const handleIsolationClick = (option: string) => {
    setFieldValue("isolation", option);
  };

  useEffect(() => {
    handleIsolationClick(values.isolation || DEFAULT_ISOLATION);
  }, [values.isolation, setFieldValue]);

  return (
    <div>
      <LabeledTooltip
        labelText="Isolation"
        tooltipContent={tooltipContent}
        tooltipIconContentLink={tooltipContentIconLink}
      />

      <div className="my-4 flex flex-wrap justify-start space-x-2">
        {isolationOptions.map(option => (
          <button
            key={option}
            type="button"
            className={`my-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              values.isolation === option
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-300 text-white hover:bg-gray-100 hover:text-black"
            }`}
            onClick={() => handleIsolationClick(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IsolationSelector;
