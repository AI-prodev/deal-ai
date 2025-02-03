import { TypographyRender } from "..";
import { PUCKEDITOR_TEXT_SUBTITLE_CONFIG } from "@/components/puckeditor/blocks/Typography/Subtitle/constants";
import {
  BackgroundFieldsProps,
  FontStyleProps,
  LineHeightFieldsProps,
} from "@/components/puckeditor/blocks/constants";
import { CSSProperties } from "react";
import styles from "./styles.module.css";
import getClassNameFactory from "@/components/puckeditor/get-classname-factory";

const getClassName = getClassNameFactory("Subtitle", styles);

export type SubtitleProps = {
  title?: string;
  fontSize: number;
  textAlign: "center" | "left" | "right";
  backgroundColor: BackgroundFieldsProps;
} & LineHeightFieldsProps;

export type SubtitleFontProps = SubtitleProps & FontStyleProps;

const Subtitle: any = {
  ...PUCKEDITOR_TEXT_SUBTITLE_CONFIG,

  render: (props: SubtitleFontProps) => {
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
        <h2
          className={getClassName()}
          style={{
            fontSize: fontSize ? `${fontSize}px` : "24px",
            textAlign: textAlign ?? "center",
            ...styles,
          }}
        >
          {title}
        </h2>
      </TypographyRender>
    );
  },
};

export default Subtitle;
