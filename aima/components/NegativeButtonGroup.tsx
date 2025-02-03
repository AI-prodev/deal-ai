import React, { useState } from "react";
import { Button } from "./Button";

interface NegativeButtonGroupProps {
  buttons: Button[];
  onSelect: (selectedButtons: Button[]) => void;
}

const NegativeButtonGroup: React.FC<NegativeButtonGroupProps> = ({
  buttons,
  onSelect,
}) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const toggleButton = (index: number) => {
    const newSelectedIndices = selectedIndices.includes(index)
      ? selectedIndices.filter(i => i !== index)
      : [...selectedIndices, index];

    setSelectedIndices(newSelectedIndices);
    onSelect(newSelectedIndices.map(i => buttons[i]));
  };

  return (
    <div className="items-left mb-5 flex flex-wrap place-items-center justify-center ">
      {buttons.map((button, index) => (
        <button
          key={index}
          type="button"
          className={`btn ${
            selectedIndices.includes(index) ? "btn-warning" : "btn-dark"
          } mx-1 my-1`}
          onClick={() => toggleButton(index)}
        >
          {button.svgContent && (
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

          <span className="ml-2">{button.label}</span>
        </button>
      ))}
    </div>
  );
};

export default NegativeButtonGroup;
