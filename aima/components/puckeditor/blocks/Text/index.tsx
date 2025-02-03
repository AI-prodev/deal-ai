import React, { CSSProperties } from "react";
import Section from "../Section";
import hex2rgba from "@/components/puckeditor/utils/hex2rgba";
import {
  BackgroundFieldsProps,
  FontStyleProps,
  LineHeightFieldsProps,
  PUCKEDITOR_BACKGROUND_FIELDS,
  PUCKEDITOR_BORDER_RADIUS_FIELDS,
  PUCKEDITOR_BOX_SHADOW_FIELDS,
  PUCKEDITOR_FONT_FIELDS,
  PUCKEDITOR_LINE_HEIGHT_FIELDS,
  SpacingProps,
} from "@/components/puckeditor/blocks/constants";
import { PUCKEDITOR_TEXT_CONFIG } from "@/components/puckeditor/blocks/Typography/constants";
import PuckRichTextEditor from "@/components/puckeditor/utils/PuckRichTextEditor";
import getClassNameFactory from "@/components/puckeditor/get-classname-factory";
import styles from "./styles.module.css";
import PuckSlider from "@/components/puckeditor/utils/slider/Slider";

const getClassName = getClassNameFactory("Text", styles);

export type TextProps = {
  textAlign: "left" | "center" | "right";
  text?: string;
  padding?: string;
  fontSize: number;
  color: string;
  maxWidth?: string;
  backgroundColor: BackgroundFieldsProps;
  spacings: SpacingProps;
  width: number;
  boxShadow: string;
  borderRadius: number;
} & LineHeightFieldsProps;

export type TextFontProps = TextProps & FontStyleProps;

const Text: any = {
  fields: {
    text: {
      label: "Text",
      type: "custom",
      render: (props: any) => <PuckRichTextEditor {...props} />,
    },
    fontSize: {
      label: "Font Size",
      type: "custom",
      render: ({ value, onChange }: any) => (
        <PuckSlider
          value={value}
          name="fontSize"
          onChange={onChange}
          label={`Font Size ${value ?? 0}px`}
          max={100}
          min={5}
          defaultValue={20}
        />
      ),
    },
    lineHeight: PUCKEDITOR_LINE_HEIGHT_FIELDS.fields!.lineHeight,
    ...PUCKEDITOR_FONT_FIELDS.fields,
    ...PUCKEDITOR_TEXT_CONFIG.fields,
    ...PUCKEDITOR_BOX_SHADOW_FIELDS.fields,
    ...PUCKEDITOR_BORDER_RADIUS_FIELDS.fields,
    // getItemSummary: (item) => {
    //       console.log(item, 'ITEM')
    //
    //     return item
    // },
  },
  defaultProps: {
    align: "left",
    text: "Text",
    padding: "24px",
    fontSize: 20,
    color: "#000000",
    ...PUCKEDITOR_BACKGROUND_FIELDS.defaultProps,
    ...PUCKEDITOR_FONT_FIELDS.defaultProps,
    ...PUCKEDITOR_TEXT_CONFIG.defaultProps,
    ...PUCKEDITOR_BOX_SHADOW_FIELDS.defaultProps,
    ...PUCKEDITOR_BORDER_RADIUS_FIELDS.defaultProps,
  },
  render: ({
    textAlign,
    color,
    text,
    fontSize,
    backgroundColor,
    spacings,
    width,
    fontFamily,
    italic,
    bold,
    underline,
    boxShadow,
    borderRadius,
    lineHeight,
  }: TextFontProps) => {
    let bgColor;
    if (backgroundColor) {
      bgColor =
        backgroundColor?.color === "transparent"
          ? "transparent"
          : hex2rgba({
              hex: backgroundColor?.color,
              backgroundOpacity: backgroundColor?.opacity,
            });
    }

    const styles: CSSProperties = {
      ...(fontFamily && { fontFamily }),
      ...(bold && { fontWeight: "bold" }),
      ...(italic && { fontStyle: "italic" }),
      ...(underline && { textDecoration: "underline" }),
      ...(lineHeight && { lineHeight }),
    };

    return (
      <Section
        style={{
          width: `${width}%`,
          marginLeft: "auto",
          marginRight: "auto",
          ...(boxShadow && { boxShadow }),
          ...(borderRadius && { borderRadius: `${borderRadius}px` }),
        }}
        bgColor={bgColor ?? "transparent"}
      >
        <span
          className={getClassName()}
          style={{
            color,
            whiteSpace: "pre-line",
            display: "flex",
            textAlign,
            width: "100%",
            fontSize: `${fontSize}px`,
            marginTop: spacings?.marginTop ?? 0,
            marginBottom: spacings?.marginBottom ?? 0,
            paddingLeft: spacings?.paddingLeft ?? 0,
            paddingRight: spacings?.paddingRight ?? 0,
            paddingTop: spacings?.paddingTop ?? 0,
            paddingBottom: spacings?.paddingBottom ?? 0,
            marginLeft: "auto",
            marginRight: "auto",
            justifyContent:
              textAlign === "center"
                ? "center"
                : textAlign === "right"
                  ? "flex-end"
                  : "flex-start",
            ...styles,
          }}
        >
          {text}
        </span>
      </Section>
    );
  },
};

export default Text;
