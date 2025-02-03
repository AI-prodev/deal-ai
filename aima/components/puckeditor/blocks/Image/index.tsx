import React from "react";
import getClassNameFactory from "../../get-classname-factory";
import styles from "./styles.module.css";
import { ComponentConfig } from "@measured/puck";
import clsx from "clsx";
import {
  AlignFieldsProps,
  MarginProps,
  PUCKEDITOR_ALIGN_FIELDS,
  PUCKEDITOR_UPLOAD_IMAGE_FIELDS,
  PUCKEDITOR_BORDER_RADIUS_FIELDS,
  PUCKEDITOR_MARGIN_FIELDS,
} from "@/components/puckeditor/blocks/constants";

const getClassName = getClassNameFactory("Image", styles);

export type ImageProps = {
  image: {
    url: string;
  };
  width?: number;
  height?: number;
  borderRadius: number;
  spacings: MarginProps;
} & AlignFieldsProps;

const Image: ComponentConfig<ImageProps> = {
  fields: {
    image: PUCKEDITOR_UPLOAD_IMAGE_FIELDS.fields!.image,
    align: PUCKEDITOR_ALIGN_FIELDS.fields!.align,
    spacings: PUCKEDITOR_MARGIN_FIELDS.fields!.spacings,
    width: {
      type: "text",
      label: "Width (PX)",
    },
    height: {
      type: "text",
      label: "Height (PX)",
    },
    borderRadius: PUCKEDITOR_BORDER_RADIUS_FIELDS.fields!.borderRadius,
  },
  defaultProps: {
    borderRadius: 0,
    align: PUCKEDITOR_ALIGN_FIELDS.defaultProps!.align,
    image: {
      url: "",
    },
    spacings: PUCKEDITOR_MARGIN_FIELDS.defaultProps!.spacings,
  },
  render: ({ image, align, width, height, borderRadius, spacings }) => (
    <img
      className={clsx(getClassName(), {
        [getClassName(align)]: getClassName(align),
      })}
      style={{
        display: "block",
        maxWidth: "100%",
        ...(!!width && { width: `${width}px` }),
        ...(!!height && { height: `${height}px` }),
        borderRadius,
        marginTop: spacings?.marginTop || 0,
        marginBottom: spacings?.marginBottom || 0,
      }}
      alt="Image Component"
      src={image?.url}
    />
  ),
};

export default Image;
