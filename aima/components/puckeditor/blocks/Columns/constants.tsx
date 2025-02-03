import {
  PUCKEDITOR_BACKGROUND_FIELDS,
  PUCKEDITOR_BORDER_FIELDS,
  PUCKEDITOR_BOX_SHADOW_FIELDS,
  PUCKEDITOR_SPACING_FIELDS,
} from "@/components/puckeditor/blocks/constants";

export const PUCKEDITOR_COLUMNS_DEFAULT_ITEM = {
  backgroundColor: PUCKEDITOR_BACKGROUND_FIELDS.defaultProps!.backgroundColor,
  border: PUCKEDITOR_BORDER_FIELDS.defaultProps!.border,
  boxShadow: PUCKEDITOR_BOX_SHADOW_FIELDS.defaultProps!.boxShadow,
  spacings: {
    ...PUCKEDITOR_SPACING_FIELDS.defaultProps!.spacings,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
};
