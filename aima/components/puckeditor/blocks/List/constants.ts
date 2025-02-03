import {
  PUCKEDITOR_BACKGROUND_FIELDS,
  PUCKEDITOR_COLOR_FIELDS,
  PUCKEDITOR_FONT_FIELDS,
} from "@/components/puckeditor/blocks/constants";

export const PUCKEDITOR_LIST_DEFAULT_ITEM = {
  icon: {
    color: "#ffffff",
    backgroundColor: {
      ...PUCKEDITOR_BACKGROUND_FIELDS.defaultProps!.backgroundColor,
      color: "#000000",
    },
  },
  text: {
    text: "This is my List Content",
    color: PUCKEDITOR_COLOR_FIELDS.defaultProps!.color,
    fontFamily: PUCKEDITOR_FONT_FIELDS.defaultProps!.fontFamily,
    italic: PUCKEDITOR_FONT_FIELDS.defaultProps!.italic,
    bold: PUCKEDITOR_FONT_FIELDS.defaultProps!.bold,
    underline: PUCKEDITOR_FONT_FIELDS.defaultProps!.underline,
    fontSize: 18,
  },
};
