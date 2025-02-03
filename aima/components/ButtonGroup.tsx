import React, { useEffect, useState } from "react";
import { Button } from "./Button";
import { countryCodes } from "@/utils/data/Countries";
import Flag from "react-world-flags";

interface ButtonGroupProps {
  buttons: Button[];
  onSelect: (selectedButtons: Button[]) => void;
  selectAll?: boolean;
  includeSelectAll?: boolean;
  flag?: boolean;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  buttons,
  onSelect,
  selectAll = false,
  includeSelectAll = false,
  flag = false,
}) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  useEffect(() => {
    if (includeSelectAll) {
      if (selectAll) {
        setSelectedIndices(buttons.map((_, index) => index));
      } else {
        setSelectedIndices([]);
      }
    }
  }, [selectAll, buttons]);

  useEffect(() => {
    const selectedButtons = selectedIndices.map(i => buttons[i]);
    if (onSelect) {
      onSelect(selectedButtons);
    }
  }, [selectedIndices, buttons, onSelect]);

  const toggleButton = (index: number) => {
    const newSelectedIndices = selectedIndices.includes(index)
      ? selectedIndices.filter(i => i !== index)
      : [...selectedIndices, index];

    setSelectedIndices(newSelectedIndices);
  };

  function getISOAlpha2Code(country: string): string | undefined {
    const formattedCountry = country.trim().toLowerCase();
    const countryCode = countryCodes.find(
      c => c.name.toLowerCase() === formattedCountry
    );

    return countryCode?.code;
  }

  return (
    <div className="items-left mb-5 flex flex-wrap place-items-center justify-center ">
      {buttons.map((button, index) => (
        <button
          key={index}
          type="button"
          className={`btn ${
            selectedIndices.includes(index) ? "btn-primary" : "btn-dark"
          } mx-1 my-1`}
          onClick={() => toggleButton(index)}
        >
          {button.height &&
            button.width &&
            button.svgContent &&
            button.viewBox && (
              <svg
                width={button.width}
                height={button.height}
                viewBox={button.viewBox}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                dangerouslySetInnerHTML={{
                  __html: button.svgContent,
                }}
              />
            )}
          {!button.svgContent && flag && (
            <div className="flex items-center justify-center">
              {getISOAlpha2Code(button.label) !== undefined && (
                <Flag
                  code={getISOAlpha2Code(button.label)}
                  height="28"
                  width="28"
                />
              )}
            </div>
          )}

          <span className="ml-2">{button.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ButtonGroup;
