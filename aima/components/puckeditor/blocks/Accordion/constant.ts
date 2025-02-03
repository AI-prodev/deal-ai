import {
  PUCKEDITOR_BACKGROUND_FIELDS,
  PUCKEDITOR_SPACING_FIELDS,
} from "@/components/puckeditor/blocks/constants";
import { AccordionItem } from "@/components/puckeditor/blocks/Accordion/index";

export const PUCKEDITOR_ACCORDION_DEFAULT_ITEM: AccordionItem = {
  title: {
    text: "Question?",
    color: "#ffffff",
    size: 20,
    align: "left",
    backgroundColor: {
      ...PUCKEDITOR_BACKGROUND_FIELDS.defaultProps!.backgroundColor,
      color: "#0158ad",
    },
    spacings: {
      ...PUCKEDITOR_SPACING_FIELDS.defaultProps!.spacings,
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 20,
      paddingRight: 20,
    },
  },
  description: {
    text: "Answer",
    color: "#000000",
    size: 17,
    align: "left",
    backgroundColor: PUCKEDITOR_BACKGROUND_FIELDS.defaultProps!.backgroundColor,
    spacings: {
      ...PUCKEDITOR_SPACING_FIELDS.defaultProps!.spacings,
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 20,
      paddingRight: 20,
    },
  },
};
