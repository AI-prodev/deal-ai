"use client";

import { FieldLabel } from "@measured/puck";
import { Slider } from "@mui/material";
import { FC } from "react";

interface IPuckSliderProps {
  value: any;
  name: string;
  onChange: (value: any) => void;
  label: string;
  min?: number;
  max: number;
  step?: number;
  defaultValue?: number;
}

const PuckSlider: FC<IPuckSliderProps> = ({
  value,
  name,
  onChange,
  label,
  min = 0,
  max,
  step = 1,
  defaultValue = 0,
}) => {
  const handleChange = (event: Event): void => {
    const target = event?.target as HTMLInputElement;
    if (value?.[name] >= 0) {
      onChange({ ...value, [name]: parseInt(target?.value) ?? 0 });
    } else {
      onChange(parseInt(target?.value));
    }
  };

  return (
    <FieldLabel label={label}>
      <Slider
        contentEditable
        suppressContentEditableWarning
        defaultValue={defaultValue}
        value={value?.[name] || value}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
      />
    </FieldLabel>
  );
};

export default PuckSlider;
