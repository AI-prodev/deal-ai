/* eslint-disable @next/next/no-img-element */
import React, { CSSProperties } from "react";
import { ComponentConfig } from "@measured/puck";
import styles from "./styles.module.css";
import Section from "../Section";
import getClassNameFactory from "../../get-classname-factory";
import { PUCKEDITOR_BUTTON_GROUP_DEFAULT_ITEM } from "@/components/puckeditor/blocks/ButtonGroup/constants";
import hex2rgba from "@/components/puckeditor/utils/hex2rgba";
import {
  BackgroundFieldsProps,
  BorderFieldsProps,
  PUCKEDITOR_BACKGROUND_FIELDS,
  PUCKEDITOR_BORDER_FIELDS,
  PUCKEDITOR_BOX_SHADOW_FIELDS,
  PUCKEDITOR_COLOR_FIELDS,
  PUCKEDITOR_FONT_FIELDS,
  PUCKEDITOR_FONT_SIZE_FIELDS,
  PUCKEDITOR_SPACING_FIELDS,
  PUCKEDITOR_WIDTH_FIELDS,
  SpacingProps,
} from "@/components/puckeditor/blocks/constants";

const getClassName = getClassNameFactory("ButtonGroup", styles);

export type Button = {
  href: string;
  label: string;
  fontSize: number;
  width: number;
  color: string;
  backgroundColor: BackgroundFieldsProps;
  border: BorderFieldsProps;
  boxShadow: string;
  spacings: SpacingProps;
  fontFamily: string;
  italic: boolean;
  bold: boolean;
  underline: boolean;
};

export type ButtonGroupProps = {
  align?: string;
  buttons: Button[];
  bgColor?: string;
};

const ButtonGroup: ComponentConfig<ButtonGroupProps> = {
  fields: {
    buttons: {
      type: "array",
      getItemSummary: item => item.label || "Button",
      arrayFields: {
        label: {
          type: "text",
          label: "Label",
        },
        fontSize: PUCKEDITOR_FONT_SIZE_FIELDS.fields!.fontSize,
        fontFamily: PUCKEDITOR_FONT_FIELDS.fields!.fontFamily,
        italic: PUCKEDITOR_FONT_FIELDS.fields!.italic,
        bold: PUCKEDITOR_FONT_FIELDS.fields!.bold,
        underline: PUCKEDITOR_FONT_FIELDS.fields!.underline,
        color: PUCKEDITOR_COLOR_FIELDS.fields!.color,
        width: PUCKEDITOR_WIDTH_FIELDS.fields!.width,
        backgroundColor: PUCKEDITOR_BACKGROUND_FIELDS.fields!.backgroundColor,
        border: PUCKEDITOR_BORDER_FIELDS.fields!.border,
        boxShadow: PUCKEDITOR_BOX_SHADOW_FIELDS.fields!.boxShadow,
        spacings: PUCKEDITOR_SPACING_FIELDS.fields!.spacings,
        href: { type: "text" },
      },
      defaultItemProps: PUCKEDITOR_BUTTON_GROUP_DEFAULT_ITEM,
    },
    align: {
      type: "radio",
      options: [
        { label: "left", value: "left" },
        { label: "center", value: "center" },
      ],
    },
    bgColor: {
      label: "Background Color",
      type: "text",
    },
  },
  defaultProps: {
    buttons: [PUCKEDITOR_BUTTON_GROUP_DEFAULT_ITEM],
  },
  render: ({ align, buttons, bgColor }) => {
    return (
      <Section
        className={getClassName({ center: align === "center" })}
        bgColor={bgColor}
      >
        <div className={getClassName("actions")}>
          {buttons.map((button, i) => {
            const {
              width,
              color,
              fontSize,
              border,
              boxShadow,
              spacings,
              fontFamily,
              bold,
              italic,
              underline,
              backgroundColor,
            } = button || {};

            const styles: CSSProperties = {
              width: `${width}%`,
              minWidth: "fit-content",
              height: "fit-content",
              color,
              fontSize,
              lineHeight: "1",
              textAlign: "center",
              border: `${border?.width}px solid ${border?.color}`,
              boxShadow: boxShadow ?? "",
              borderRadius: border?.radius ?? 6,
              marginTop: spacings?.marginTop ?? 0,
              marginBottom: spacings?.marginBottom ?? 0,
              paddingTop: spacings?.paddingTop ?? 0,
              paddingBottom: spacings?.paddingBottom ?? 0,
              paddingLeft: spacings?.paddingLeft ?? 0,
              paddingRight: spacings?.paddingRight ?? 0,
              ...(fontFamily && { fontFamily }),
              ...(bold && { fontWeight: "bold" }),
              ...(italic && { fontStyle: "italic" }),
              ...(underline && { textDecoration: "underline" }),
            };

            if (backgroundColor && backgroundColor?.color === "transparent") {
              delete styles.backgroundColor;
            } else if (backgroundColor?.color) {
              styles.backgroundColor = hex2rgba({
                hex: backgroundColor?.color,
                backgroundOpacity: backgroundColor?.opacity,
              });
            }

            return (
              <a
                key={i}
                href={button.href}
                style={styles}
                className={getClassName("button")}
              >
                {button.label}
              </a>
            );
          })}
        </div>
      </Section>
    );
  },
};

export default ButtonGroup;
