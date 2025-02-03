import { PUCKEDITOR_TEXT_CONFIG } from "../constants";
import { ComponentConfig } from "@measured/puck";
import { HeadlineProps } from "./index";
import PuckSlider from "@/components/puckeditor/utils/slider/Slider";
import * as React from "react";
import {
  PUCKEDITOR_BACKGROUND_FIELDS,
  PUCKEDITOR_FONT_FIELDS,
  PUCKEDITOR_LINE_HEIGHT_FIELDS,
  PUCKEDITOR_SPACING_FIELDS,
} from "@/components/puckeditor/blocks/constants";

const fields = {
  title: {
    label: "Headline",
    type: "text",
  },
  fontSize: {
    label: "Font Size",
    type: "custom",
    render: ({ value, name, onChange, field }) => (
      <PuckSlider
        value={value}
        name={name}
        onChange={onChange}
        label={`${field?.label} ${value}`}
        min={10}
        max={100}
      />
    ),
  },
  lineHeight: PUCKEDITOR_LINE_HEIGHT_FIELDS.fields!.lineHeight,
  ...PUCKEDITOR_FONT_FIELDS.fields,
  ...PUCKEDITOR_TEXT_CONFIG.fields,
} as ComponentConfig<HeadlineProps>["fields"];

export const PUCKEDITOR_TEXT_HEADLINE_CONFIG: Omit<
  ComponentConfig<HeadlineProps>,
  "render"
> = {
  defaultProps: {
    title: "This is my Headline Content",
    // @ts-ignore
    color: "#000000",
    backgroundColor: PUCKEDITOR_BACKGROUND_FIELDS.defaultProps!.backgroundColor,
    spacings: {
      ...PUCKEDITOR_SPACING_FIELDS.defaultProps?.spacings,
      paddingTop: 20,
      paddingBottom: 20,
    },
    fontSize: 32,
    width: 100,
    textAlign: "center",
    ...PUCKEDITOR_FONT_FIELDS.defaultProps,
  },
  fields,
};
