import PuckSlider from "@/components/puckeditor/utils/slider/Slider";
import {
  BackgroundFieldsProps,
  BorderFieldsProps,
  ColorFieldsProps,
  PUCKEDITOR_BACKGROUND_FIELDS,
  PUCKEDITOR_BORDER_FIELDS,
  PUCKEDITOR_BOX_SHADOW_FIELDS,
  PUCKEDITOR_COLOR_FIELDS,
  PUCKEDITOR_FONT_FIELDS,
  PUCKEDITOR_SPACING_FIELDS,
  PUCKEDITOR_WIDTH_FIELDS,
  SpacingProps,
} from "@/components/puckeditor/blocks/constants";
import * as React from "react";
import { ComponentConfig } from "@measured/puck";

export type ButtonProps = {
  label: string;
  fontSize: number;
  width: number;
  align: string;
  backgroundColor: BackgroundFieldsProps;
  border: BorderFieldsProps;
  boxShadow: string;
  spacings: SpacingProps;
  fontFamily: string;
  italic: boolean;
  bold: boolean;
  underline: boolean;
} & ColorFieldsProps;

export type ButtonFieldsProps = Omit<ComponentConfig<ButtonProps>, "render">;

const fields = {
  label: {
    type: "text",
  },
  fontSize: {
    label: "Font Size",
    type: "custom",
    render: ({ value, name, onChange, field }: any) => (
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
  ...PUCKEDITOR_FONT_FIELDS.fields,
  color: PUCKEDITOR_COLOR_FIELDS.fields!.color,
  align: {
    type: "radio",
    options: [
      { label: "left", value: "left" },
      { label: "center", value: "center" },
      { label: "right", value: "right" },
    ],
  },
  ...PUCKEDITOR_WIDTH_FIELDS.fields,
  ...PUCKEDITOR_BACKGROUND_FIELDS.fields,
  ...PUCKEDITOR_BORDER_FIELDS.fields,
  ...PUCKEDITOR_BOX_SHADOW_FIELDS.fields,
  ...PUCKEDITOR_SPACING_FIELDS.fields,
};

export const PUCKEDITOR_BUTTON_CONFIG = {
  defaultProps: {
    label: "Learn more",
    color: "#ffffff",
    fontSize: 25,
    align: "center",
    width: 25,
    backgroundColor: {
      ...PUCKEDITOR_BACKGROUND_FIELDS?.defaultProps!.backgroundColor,
      color: "#0158ad",
    },
    border: {
      ...PUCKEDITOR_BORDER_FIELDS.defaultProps!.border,
      radius: 10,
    },
    boxShadow: "",
    spacings: {
      ...PUCKEDITOR_SPACING_FIELDS.defaultProps?.spacings,
      paddingTop: 10,
      paddingBottom: 10,
      paddingRight: 25,
      paddingLeft: 25,
    },
    fontFamily: "Arial",
    italic: false,
    bold: false,
    underline: false,
  },
  fields,
};
