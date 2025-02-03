// RangeSlider.tsx
import Tippy from "@tippyjs/react";
import React from "react";

interface RangeSliderProps {
  label: string;
  name: string;
  min: number;
  max: number;
  value: number;
  showValue: boolean;
  leftLabel?: string;
  rightLabel?: string;
  gradient?: boolean;
  tooltipContent?: string;
  onChange: (value: number) => void;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  name,
  min,
  max,
  value,
  showValue,
  leftLabel,
  rightLabel,
  gradient,
  onChange,
  tooltipContent,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <Tippy content={tooltipContent} placement="top">
        <label htmlFor={name} className="block w-fit text-sm font-medium">
          {label}
        </label>
      </Tippy>
      <div className="relative mt-2">
        <input
          type="range"
          id={name}
          name={name}
          className={`range range-primary h-2 w-full rounded-md bg-gray-200 outline-none ${
            gradient && "gradient-slider"
          }`}
          style={{ backgroundSize: `${percentage}% 100%` }}
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
        />
        <div className="flex justify-between px-2 text-xs">
          <span>{leftLabel || min}</span>
          {showValue && <span>{value}</span>}
          <span>{rightLabel || max}</span>
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;
