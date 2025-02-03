import React, { useEffect, useMemo, useState } from "react";

const CapsuleDropDown = ({
  value,
  onChange,
  onUpdateSuggestions,
  suggestions,
}: {
  value: string;
  onChange: () => void;
  onUpdateSuggestions: (newSuggestions: string[]) => void;
  suggestions: string[];
}) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState(suggestions);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const currentSelections = useMemo(
    () => (value ? value.split(",").map(v => v.trim()) : []),
    [value]
  );

  const updateFilteredSuggestions = (newValue: string) => {
    // const filtered = newValue
    //   ? suggestions.filter((suggestion: string) =>
    //       suggestion.toLowerCase().includes(newValue.toLowerCase()),
    //     )
    //   : suggestions.filter((s) => !currentSelections.includes(s));
    const filtered = suggestions.filter(s => !currentSelections.includes(s));

    setFilteredSuggestions(filtered);
  };

  const handleInputChange = (event: { target: { value: string } }) => {
    const newValue = event.target.value;

    setInputValue(newValue);
    updateFilteredSuggestions(newValue);
    setShowSuggestions(true);
  };

  useEffect(() => {
    updateFilteredSuggestions("");
  }, [currentSelections]);

  const handleSelectSuggestion = (suggestion: string) => {
    if (!currentSelections.includes(suggestion)) {
      onUpdateSuggestions([...currentSelections, suggestion]);
    }

    setInputValue("");
    updateFilteredSuggestions("");
    setShowSuggestions(false);
  };

  const handleRemoveItem = (itemToRemove: string) => {
    const newSelections = currentSelections.filter(s => s !== itemToRemove);
    onUpdateSuggestions(newSelections);
  };

  const handleClearAll = () => {
    onUpdateSuggestions([]);
  };

  const handleInputKeyDown = (event: {
    key: string;
    preventDefault: () => void;
  }) => {
    if (event.key === "Enter" && inputValue) {
      handleSelectSuggestion(inputValue);
      event.preventDefault();
    } else if (
      event.key === "Backspace" &&
      !inputValue &&
      currentSelections.length > 0
    ) {
      handleRemoveItem(currentSelections.at(-1)!);
      event.preventDefault();
    }
  };

  const toggleDropdown = () => {
    setShowSuggestions(!showSuggestions);
  };

  return (
    <div
      className="relative"
      onClick={e => {
        toggleDropdown();
        e.stopPropagation();
      }}
    >
      <ul className="mt-3 flex max-h-60 w-full flex-wrap justify-start space-x-2">
        {filteredSuggestions.length > 0 &&
          filteredSuggestions.map((suggestion: string) => (
            <li
              key={suggestion}
              onClick={e => {
                e.stopPropagation();
                handleSelectSuggestion(suggestion);
              }}
              className="h mb-3 cursor-pointer rounded-full border border-gray-300 px-4  py-2 text-white hover:bg-gray-100 hover:text-black"
            >
              {suggestion}
            </li>
          ))}
        {/* : (
           <li className="px-4 py-2 text-gray-500">No options</li>
        )} */}
      </ul>
      <div
        className="form-input relative flex flex-wrap items-center gap-2 p-2"
        onClick={e => e.stopPropagation()}
      >
        {currentSelections.map(item => (
          <div
            key={item}
            className="my-1 flex items-center gap-1 rounded-full border border-blue-500 bg-blue-500 px-4 py-1 text-sm font-medium text-white transition-colors"
          >
            {item}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                handleRemoveItem(item);
              }}
              className="text-lg text-white hover:text-gray-300"
            >
              &times;
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          className="flex-1 bg-transparent text-white outline-none"
          placeholder=""
          onClick={e => {
            e.stopPropagation();
            toggleDropdown();
          }}
        />
        {currentSelections.length > 0 && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              handleClearAll();
            }}
            className="absolute right-2 top-0 flex items-end items-end justify-end text-lg text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
};

const FormikCapsuleDropDown = ({
  field, // { name, value, onChange, onBlur }
  form: { setFieldValue, touched, errors },
  suggestions,
  defaultValue,
  ...props
}: {
  field: { name: string; value: string; onChange: () => void };
  suggestions: string[];
  form: {
    setFieldValue: (fieldName: string, newValue: string) => void;
    touched: any;
    errors: any;
  };
  defaultValue: string;
}) => {
  const handleUpdateSuggestions = (newSuggestions: string[]) => {
    setFieldValue(field.name, newSuggestions.join(", "));
  };
  const valueToUse = field.value !== undefined ? field.value : defaultValue;
  return (
    <CapsuleDropDown
      {...field}
      {...props}
      suggestions={suggestions}
      onUpdateSuggestions={handleUpdateSuggestions}
      value={valueToUse}
    />
  );
};

export default FormikCapsuleDropDown;
