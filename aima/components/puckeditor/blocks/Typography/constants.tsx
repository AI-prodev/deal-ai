import {
  PUCKEDITOR_BACKGROUND_FIELDS,
  PUCKEDITOR_COLOR_FIELDS,
  PUCKEDITOR_SPACING_FIELDS,
  PUCKEDITOR_WIDTH_FIELDS,
} from "../constants";
import PuckColourPicker from "../../utils/slider/ColourPicker";
import { ComponentConfig } from "@measured/puck";

export type PuckEditorTextProps = {
  textAlign: "center" | "left" | "right";
  color: string;
  width: number;
};

export const PUCKEDITOR_TEXT_CONFIG: Omit<
  ComponentConfig<PuckEditorTextProps>,
  "render"
> = {
  defaultProps: {
    textAlign: "center",
    color: PUCKEDITOR_COLOR_FIELDS.defaultProps!.color,
    width: 100,
    ...PUCKEDITOR_SPACING_FIELDS.defaultProps,
  },
  fields: {
    textAlign: {
      label: "Align",
      type: "radio",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
    width: PUCKEDITOR_WIDTH_FIELDS.fields!.width,
    color: PUCKEDITOR_COLOR_FIELDS.fields!.color,
    ...PUCKEDITOR_BACKGROUND_FIELDS.fields,
    ...PUCKEDITOR_SPACING_FIELDS.fields,
  },
};
