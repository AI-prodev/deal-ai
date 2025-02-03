import { PUCKEDITOR_BUTTON_CONFIG } from "@/components/puckeditor/blocks/Button/constants";
import { Button } from "@/components/puckeditor/blocks/ButtonGroup/index";

export const PUCKEDITOR_BUTTON_GROUP_DEFAULT_ITEM: Button = {
  label: PUCKEDITOR_BUTTON_CONFIG.defaultProps!.label,
  color: PUCKEDITOR_BUTTON_CONFIG.defaultProps!.color,
  fontSize: PUCKEDITOR_BUTTON_CONFIG.defaultProps!.fontSize,
  fontFamily: PUCKEDITOR_BUTTON_CONFIG.defaultProps!.fontFamily,
  italic: PUCKEDITOR_BUTTON_CONFIG.defaultProps!.italic,
  bold: PUCKEDITOR_BUTTON_CONFIG.defaultProps!.bold,
  underline: PUCKEDITOR_BUTTON_CONFIG.defaultProps!.underline,
  backgroundColor: PUCKEDITOR_BUTTON_CONFIG.defaultProps!.backgroundColor,
  width: PUCKEDITOR_BUTTON_CONFIG.defaultProps!.width,
  border: PUCKEDITOR_BUTTON_CONFIG.defaultProps!.border,
  boxShadow: PUCKEDITOR_BUTTON_CONFIG.defaultProps!.boxShadow,
  // @ts-ignore
  spacings: PUCKEDITOR_BUTTON_CONFIG.defaultProps!.spacings,
  href: "#",
};
