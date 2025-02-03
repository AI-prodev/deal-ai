import React, { useState } from "react";
import clsx from "clsx";

const DropDown = ({
  value,
  onChange,
  suggestions,
  isLightMode = false,
}: {
  value: string;
  isLightMode?: boolean;
  onChange: (newValue: string) => void;
  suggestions: { display: string; value: string }[];
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSelectSuggestion = (suggestion: { value: string }) => {
    onChange(suggestion.value);
    setShowSuggestions(false);
  };

  return (
    <div
      className="relative"
      onClick={e => {
        setShowSuggestions(!showSuggestions);
        e.stopPropagation();
      }}
    >
      <div
        className={clsx("form-input relative p-2 mt-2", {
          "!bg-white": isLightMode,
        })}
      >
        <div
          className={clsx("my-1 px-4 py-1 text-sm font-medium cursor-pointer", {
            "text-black": isLightMode,
            "text-white": !isLightMode,
          })}
        >
          {suggestions.find(s => s.value === value)?.display || ""}
        </div>
        {showSuggestions && (
          <ul className="absolute mt-3 max-h-60 w-full rounded-md border border-gray-300 bg-white py-1 text-black shadow-lg z-50">
            {suggestions.map(suggestion => (
              <li
                key={suggestion.value || "undefined"}
                onClick={e => {
                  e.stopPropagation();
                  handleSelectSuggestion(suggestion);
                }}
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
              >
                {suggestion.display}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const FormikDropDown = ({
  field, // { name, value, onChange, onBlur }
  form: { setFieldValue },
  suggestions,
  isLightMode = false,
  ...props
}: {
  field: { name: string; value: string; onChange: () => void };
  suggestions: { display: string; value: string }[];
  isLightMode?: boolean;
  form: {
    setFieldValue: (fieldName: string, newValue: string) => void;
  };
}) => {
  const handleUpdateSelection = (newValue: string) => {
    setFieldValue(field.name, newValue);
  };

  return (
    <DropDown
      {...field}
      {...props}
      suggestions={suggestions}
      isLightMode={isLightMode}
      onChange={handleUpdateSelection}
      value={field.value}
    />
  );
};

export default FormikDropDown;
