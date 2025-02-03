import React from "react";

import { ComponentConfig } from "@measured/puck";
import { spacingOptions } from "../../options";

export type VerticalSpaceProps = {
  size: string;
  bgColor?: string;
};

const VerticalSpace: ComponentConfig<VerticalSpaceProps> = {
  fields: {
    size: {
      type: "select",
      options: spacingOptions,
    },
    bgColor: {
      label: "Background Color",
      type: "text",
    },
  },
  defaultProps: {
    size: "24px",
  },
  render: ({ size, bgColor }) => {
    return (
      <div
        style={{
          height: size,
          width: "100%",
          backgroundColor: bgColor,
        }}
      />
    );
  },
};

export default VerticalSpace;
