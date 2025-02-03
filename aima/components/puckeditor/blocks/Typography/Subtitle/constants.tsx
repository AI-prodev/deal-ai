import { PUCKEDITOR_TEXT_CONFIG } from "../constants";
import { ComponentConfig } from "@measured/puck";
import { SubtitleProps } from "./index";
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
    label: "Subtitle",
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
} as ComponentConfig<SubtitleProps>["fields"];

export const PUCKEDITOR_TEXT_SUBTITLE_CONFIG: Omit<
  ComponentConfig<SubtitleProps>,
  "render"
> = {
  defaultProps: {
    title: "This is my Subtitle",
    // @ts-ignore
    color: "#000000",
    backgroundColor: PUCKEDITOR_BACKGROUND_FIELDS.defaultProps!.backgroundColor,
    spacings: {
      ...PUCKEDITOR_SPACING_FIELDS.defaultProps?.spacings,
      paddingTop: 10,
      paddingBottom: 10,
    },
    fontSize: 24,
    width: 100,
    textAlign: "center",
    ...PUCKEDITOR_FONT_FIELDS.defaultProps,
  },
  fields,
};
