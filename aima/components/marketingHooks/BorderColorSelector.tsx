import Tippy from "@tippyjs/react";
import React, { useEffect } from "react";

interface BorderColorSelectorProps {
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  values: { borderColor: string };
  tooltipContent: string;
}

const borderColorOptions = ["Black", "White", "Color", "Color Gradient"];
const DEFAULT_BORDER_COLOR = "Black";

export const BorderColorSelector: React.FC<BorderColorSelectorProps> = ({
  setFieldValue,
  values,
  tooltipContent,
}) => {
  const handleBorderColorClick = (option: string) => {
    setFieldValue("borderColor", option);
  };

  useEffect(() => {
    handleBorderColorClick(values.borderColor || DEFAULT_BORDER_COLOR);
  }, [values.borderColor, setFieldValue]);

  return (
    <div>
      <Tippy content={tooltipContent} placement="top">
        <label className="block w-fit text-left font-semibold text-white">
          Border Color
        </label>
      </Tippy>
      <div className="my-4 flex flex-wrap justify-start space-x-2">
        {borderColorOptions.map(option => (
          <button
            key={option}
            type="button"
            className={`my-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              values.borderColor === option
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-300 text-white hover:bg-gray-100 hover:text-black"
            }`}
            onClick={() => handleBorderColorClick(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};
