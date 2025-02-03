import { TypographyRender } from "..";
import { PUCKEDITOR_TEXT_HEADLINE_CONFIG } from "@/components/puckeditor/blocks/Typography/Headline/constants";
import { CSSProperties } from "react";
import {
  BackgroundFieldsProps,
  FontStyleProps,
  LineHeightFieldsProps,
} from "@/components/puckeditor/blocks/constants";
import getClassNameFactory from "@/components/puckeditor/get-classname-factory";
import styles from "./styles.module.css";

const getClassName = getClassNameFactory("Headline", styles);

export type HeadlineProps = {
  title?: string;
  fontSize: number;
  textAlign: "center" | "left" | "right";
  width: number;
  backgroundColor: BackgroundFieldsProps;
} & LineHeightFieldsProps;

export type HeadlineFontProps = HeadlineProps & FontStyleProps;

const Headline: any = {
  ...PUCKEDITOR_TEXT_HEADLINE_CONFIG,

  render: (props: HeadlineFontProps) => {
    const {
      title,
      fontSize,
      textAlign,
      fontFamily,
      bold,
      italic,
      underline,
      lineHeight,
    } = props;

    const styles: CSSProperties = {
      ...(fontFamily && { fontFamily }),
      fontWeight: bold ? "bold" : "normal",
      ...(italic && { fontStyle: "italic" }),
      ...(underline && { textDecoration: "underline" }),
      ...(lineHeight && { lineHeight }),
    };

    return (
      <TypographyRender {...props}>
        <h1
          className={getClassName()}
          style={{
            fontSize: fontSize ? `${fontSize}px` : "32px",
            textAlign: textAlign ?? "center",
            ...styles,
          }}
        >
          {title}
        </h1>
      </TypographyRender>
    );
  },
};

export default Headline;
