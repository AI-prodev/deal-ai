import { SvgIconProps } from "@/components/icons/SVGData";
import React, { useState } from "react";

export type ButtonItem<T> = {
  Icon: React.FC<SvgIconProps> | React.FC<{ className?: string }>;
  name: T;
};
type VaultButtonsProps<T> = {
  buttons: ButtonItem<T>[];
  onClick: (name: T) => void;
  width: number;
  styles?: string;
};
const defaultButtonsClass =
  "flex px-2 py-1 border-[1px] border-solid rounded-[9%]";
const VaultButtons = <T,>({
  buttons,
  onClick,
  width,
  styles = defaultButtonsClass,
}: VaultButtonsProps<T>) => {
  const [selectedButton, setSelectedButton] = useState(0);
  const handleButtonClick = (index: number, name: T) => {
    setSelectedButton(index);
    onClick(name);
  };
  const renderedButtons = (): React.ReactNode[] => {
    return buttons.map((button, index) => (
      <div
        key={`${button.name}  ${index}btn`}
        className={`${index === selectedButton ? "bg-primary" : ""} ms-2 me-2 ps-[8px] pe-[8px]`}
      >
        <button
          onClick={() => handleButtonClick(index, button.name)}
          aria-label={button.name as string}
        >
          <button.Icon /> {button.name as React.ReactNode}
        </button>
      </div>
    ));
  };
  return <div className={styles}>{renderedButtons()}</div>;
};

export default VaultButtons;
