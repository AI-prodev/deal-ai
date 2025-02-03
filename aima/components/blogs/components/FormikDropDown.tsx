import { useToggle } from "@/hooks/useToggle";
import clsx from "clsx";
import React, { MouseEvent, useMemo, useState } from "react";

const DropDown = ({
  value,
  onChange,
  suggestions,
}: {
  value: string;
  onChange: (newValue: string) => void;
  suggestions: { display: string; value: string }[];
}) => {
  const [showSuggestions, setShowSuggestions] = useToggle();

  const selectedLabel = useMemo(() => {
    return suggestions.find(s => s.value === value)?.display || "(no domain)";
  }, [suggestions, value]);

  const handleSelectSuggestion =
    (suggestion: { value: string }) => (evt: MouseEvent<HTMLLIElement>) => {
      onChange(suggestion.value);
      setShowSuggestions(evt);
    };

  return (
    <div className="relative" onClick={setShowSuggestions}>
      <div className="form-input relative p-2 mt-2">
        <div className="my-1 px-4 py-1 text-sm font-medium text-white cursor-pointer">
          {selectedLabel}
        </div>
        {showSuggestions && (
          <ul className="absolute mt-3 max-h-60 w-full rounded-md border border-gray-300 bg-white py-1 text-black shadow-lg z-50">
            {suggestions.map(suggestion => (
              <li
                key={suggestion.value || "undefined"}
                onClick={handleSelectSuggestion(suggestion)}
                className={clsx("cursor-pointer px-4 py-2 hover:bg-gray-100")}
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
  ...props
}: {
  field: { name: string; value: string; onChange: () => void };
  suggestions: { display: string; value: string }[];
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
      onChange={handleUpdateSelection}
      value={field.value}
    />
  );
};

export default FormikDropDown;
