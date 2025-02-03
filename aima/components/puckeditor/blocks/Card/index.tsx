/* eslint-disable @next/next/no-img-element */
import React, { CSSProperties } from "react";
import { ComponentConfig } from "@measured/puck";
import styles from "./styles.module.css";
import getClassNameFactory from "../../get-classname-factory";
import {
  BackgroundFieldsProps,
  FontStyleProps,
  PUCKEDITOR_BACKGROUND_FIELDS,
  PUCKEDITOR_UPLOAD_IMAGE_FIELDS,
  PUCKEDITOR_FONT_FIELDS,
} from "@/components/puckeditor/blocks/constants";
import hex2rgba from "@/components/puckeditor/utils/hex2rgba";
import { PUCKEDITOR_TEXT_CONFIG } from "@/components/puckeditor/blocks/Typography/constants";
import PuckSlider from "@/components/puckeditor/utils/slider/Slider";

const getClassName = getClassNameFactory("Card", styles);

export type CardProps = {
  title: {
    title: string;
    fontSize: number;
    color: string;
  } & FontStyleProps;
  description: string;
  image: {
    url: string;
  };
  mode: "flat" | "card";
  backgroundColor: BackgroundFieldsProps;
  align?: "left" | "center" | "end";
};

const Card: ComponentConfig<CardProps> = {
  fields: {
    title: {
      type: "object",
      label: "Title",
      objectFields: {
        title: {
          type: "text",
          label: "Title",
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
        fontFamily: PUCKEDITOR_FONT_FIELDS.fields!.fontFamily,
        italic: PUCKEDITOR_FONT_FIELDS.fields!.italic,
        bold: PUCKEDITOR_FONT_FIELDS.fields!.bold,
        underline: PUCKEDITOR_FONT_FIELDS.fields!.underline,
        color: PUCKEDITOR_TEXT_CONFIG.fields!.color,
      },
    },
    description: { type: "textarea" },
    image: PUCKEDITOR_UPLOAD_IMAGE_FIELDS.fields!.image,
    mode: {
      type: "radio",
      options: [
        { label: "card", value: "card" },
        { label: "flat", value: "flat" },
      ],
    },
    backgroundColor: PUCKEDITOR_BACKGROUND_FIELDS.fields!.backgroundColor,
    align: {
      type: "radio",
      options: [
        { label: "Left", value: "start" },
        { label: "Center", value: "center" },
        { label: "Right", value: "end" },
      ],
    },
  },
  defaultProps: {
    title: {
      title: "Title",
      fontSize: 16,
      fontFamily: PUCKEDITOR_FONT_FIELDS.defaultProps!.fontFamily,
      italic: PUCKEDITOR_FONT_FIELDS.defaultProps!.italic,
      bold: PUCKEDITOR_FONT_FIELDS.defaultProps!.bold,
      underline: PUCKEDITOR_FONT_FIELDS.defaultProps!.underline,
      color: PUCKEDITOR_TEXT_CONFIG.defaultProps!.color,
    },
    description: "Description",
    image: {
      url: "",
    },
    mode: "flat",
    backgroundColor: PUCKEDITOR_BACKGROUND_FIELDS.defaultProps!.backgroundColor,
    align: "center",
  },
  render: ({ title, image, description, mode, backgroundColor, align }) => {
    const styles: CSSProperties = {
      alignItems: align,
    };

    if (backgroundColor && backgroundColor?.color === "transparent") {
      delete styles.backgroundColor;
    } else if (backgroundColor?.color) {
      styles.backgroundColor = hex2rgba({
        hex: backgroundColor?.color,
        backgroundOpacity: backgroundColor?.opacity,
      });
    }

    const titleStyles: CSSProperties = {
      fontSize: title?.fontSize,
      color: title?.color,
      fontFamily: title?.fontFamily ?? "Arial",
      ...(title?.bold && { fontWeight: "bold" }),
      ...(title?.italic && { fontStyle: "italic" }),
      ...(title?.underline && { textDecoration: "underline" }),
    };

    return (
      <div className={getClassName({ [mode]: mode })} style={styles}>
        {image?.url && (
          <img
            className={getClassName("image")}
            src={image?.url}
            alt={"image"}
          />
        )}
        <div className={getClassName("title")} style={titleStyles}>
          {title?.title}
        </div>
        <div className={getClassName("description")}>{description}</div>
      </div>
    );
  },
};

export default Card;
