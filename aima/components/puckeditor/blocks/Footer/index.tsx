import React, { CSSProperties } from "react";
import { ComponentConfig } from "@measured/puck";
import styles from "./styles.module.css";
import getClassNameFactory from "../../get-classname-factory";
import {
  BackgroundFieldsProps,
  BorderFieldsProps,
  PUCKEDITOR_BACKGROUND_FIELDS,
  PUCKEDITOR_UPLOAD_IMAGE_FIELDS,
  PUCKEDITOR_BORDER_FIELDS,
  PUCKEDITOR_COLOR_FIELDS,
  PUCKEDITOR_SPACING_FIELDS,
  SpacingProps,
} from "@/components/puckeditor/blocks/constants";
import hex2rgba from "@/components/puckeditor/utils/hex2rgba";

const getClassName = getClassNameFactory("Footer", styles);

export type FooterProps = {
  title: string;
  image: {
    url: string;
  };
  spacings: SpacingProps;
  backgroundColor: BackgroundFieldsProps;
  color: string;
  border: BorderFieldsProps;
};

const Footer: ComponentConfig<FooterProps> = {
  fields: {
    title: { type: "text" },
    image: PUCKEDITOR_UPLOAD_IMAGE_FIELDS.fields!.image,
    spacings: PUCKEDITOR_SPACING_FIELDS.fields!.spacings,
    backgroundColor: PUCKEDITOR_BACKGROUND_FIELDS.fields!.backgroundColor,
    border: PUCKEDITOR_BORDER_FIELDS.fields!.border,
    color: PUCKEDITOR_COLOR_FIELDS.fields!.color,
  },
  defaultProps: {
    title: "Title",
    image: {
      url: "",
    },
    spacings: {
      ...PUCKEDITOR_SPACING_FIELDS.defaultProps!.spacings,
      paddingLeft: 15,
      paddingRight: 15,
      paddingTop: 10,
      paddingBottom: 10,
    },
    backgroundColor: {
      ...PUCKEDITOR_BACKGROUND_FIELDS.defaultProps!.backgroundColor,
      color: "#000000",
    },
    border: PUCKEDITOR_BORDER_FIELDS.defaultProps!.border,
    color: "#ffffff",
  },
  render: ({ title, image, spacings, backgroundColor, border, color }) => {
    const styles: CSSProperties = {
      marginTop: spacings?.marginTop,
      marginBottom: spacings?.marginBottom,
      paddingTop: spacings?.paddingTop,
      paddingBottom: spacings?.paddingBottom,
      paddingLeft: spacings?.paddingLeft,
      paddingRight: spacings?.paddingRight,
      border: `${border?.width}px solid ${border?.color}`,
      borderRadius: border?.radius ?? 0,
      color: color ?? "#ffffff",
    };

    if (backgroundColor) {
      styles.backgroundColor =
        backgroundColor?.color === "transparent"
          ? "transparent"
          : hex2rgba({
              hex: backgroundColor?.color,
              backgroundOpacity: backgroundColor?.opacity,
            });
    }

    return (
      <div className={getClassName()} style={styles}>
        <div className={getClassName("row")}>
          <div className={getClassName("cell")}>
            {image.url && (
              <div className={getClassName("logo")}>
                <img alt="image" src={image?.url} />
              </div>
            )}
            <div className={getClassName("info")}>
              <p className={getClassName("subtitle")}>
                Email:&nbsp;
                <br />
                email@company.com
              </p>
              <p className={getClassName("subtitle2")}>
                Phone:&nbsp;
                <br />
                555-555-5555
              </p>
              <p className={getClassName("paragraph")}>
                All rights reserved by&nbsp;{title}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export default Footer;
