import {
  PUCKEDITOR_SPACING_FIELDS,
  PUCKEDITOR_BACKGROUND_FIELDS,
  PUCKEDITOR_BACKGROUND_IMAGE_FIELDS,
  PuckEditorSpacingProps,
  PuckEditorBackgroundProps,
  PuckEditorBackgroundImageProps,
  PUCKEDITOR_BORDER_FIELDS,
  PuckEditorBorderProps,
  PuckEditorBorderRadiusProps,
  PUCKEDITOR_BOX_SHADOW_FIELDS,
  PuckEditorBoxShadowProps,
  PuckEditorUploadImageProps,
} from "../constants";

export type LayoutFieldsProps = PuckEditorSpacingProps &
  PuckEditorBackgroundProps &
  PuckEditorUploadImageProps &
  PuckEditorBackgroundImageProps &
  PuckEditorBorderProps &
  PuckEditorBorderRadiusProps &
  PuckEditorBoxShadowProps;

const fields = {
  ...PUCKEDITOR_BACKGROUND_IMAGE_FIELDS.fields,
  ...PUCKEDITOR_BACKGROUND_FIELDS.fields,
  ...PUCKEDITOR_BORDER_FIELDS.fields,
  ...PUCKEDITOR_BOX_SHADOW_FIELDS.fields,
  ...PUCKEDITOR_SPACING_FIELDS.fields,
} as LayoutFieldsProps;

export const PUCKEDITOR_LAYOUT_CONFIG = {
  defaultProps: {
    spacings: {
      paddingLeft: 20,
      paddingTop: 20,
      paddingBottom: 20,
      paddingRight: 20,
      marginTop: 0,
      marginBottom: 0,
    },
    backgroundColor: {
      color: "transparent",
      opacity: 100,
    },
    border: PUCKEDITOR_BORDER_FIELDS?.defaultProps!.border,
    backgroundImage:
      PUCKEDITOR_BACKGROUND_IMAGE_FIELDS.defaultProps!.backgroundImage,
    boxShadow: "",
  },
  fields,
};
