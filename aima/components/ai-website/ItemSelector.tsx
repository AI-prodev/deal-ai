import React, { useEffect } from "react";
import clsx from "clsx";

interface IsolationSelectorProps {
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  value: string;
  options: any;
  item: string;
  isLightMode?: boolean;
}

const DEFAULT_ISOLATION = "";

export const ItemSelector: React.FC<IsolationSelectorProps> = ({
  setFieldValue,
  value,
  options,
  item,
  isLightMode = false,
}) => {
  const handleIsolationClick = (option: string) => {
    setFieldValue(item, option);
  };

  useEffect(() => {
    handleIsolationClick(value || DEFAULT_ISOLATION);
  }, [value, setFieldValue]);

  return (
    <div>
      <div className="my-4 flex flex-wrap justify-start space-x-2">
        {options.map((option: any) => (
          <button
            key={option}
            type="button"
            className={clsx(
              `my-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                value === option
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-gray-300 hover:bg-gray-100 hover:text-black"
              }`,
              {
                "text-black": isLightMode,
                "text-white": !isLightMode,
              }
            )}
            onClick={() => handleIsolationClick(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ItemSelector;
