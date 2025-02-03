import { ComponentConfig } from "@measured/puck";
import hex2rgba from "@/components/puckeditor/utils/hex2rgba";
import { CSSProperties } from "react";
import * as React from "react";
import getClassNameFactory from "@/components/puckeditor/get-classname-factory";
import styles from "./styles.module.css";
import clsx from "clsx";
import { ButtonProps, PUCKEDITOR_BUTTON_CONFIG } from "./constants";

const getClassName = getClassNameFactory("Button", styles);

const Button: ComponentConfig<ButtonProps & { href: string }> = {
  // @ts-ignore
  fields: {
    ...PUCKEDITOR_BUTTON_CONFIG!.fields,
    href: {
      type: "text",
    },
  },
  // @ts-ignore
  defaultProps: {
    ...PUCKEDITOR_BUTTON_CONFIG!.defaultProps,
    href: "#",
  },
  render: ({
    href,
    label,
    backgroundColor,
    border,
    boxShadow,
    spacings,
    fontSize,
    color,
    width,
    align,
    fontFamily,
    bold,
    italic,
    underline,
  }) => {
    const styles: CSSProperties = {
      width: `${width}%`,
      minWidth: "fit-content",
      color,
      fontSize,
      lineHeight: "1",
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
        href={href}
        style={styles}
        className={clsx(getClassName(), {
          [getClassName(align)]: getClassName(align),
        })}
      >
        {label}
      </a>
    );
  },
};

export default Button;
