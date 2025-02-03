import { CSSProperties } from "react";
import hex2rgba from "@/components/puckeditor/utils/hex2rgba";
import {
  BackgroundFieldsProps,
  SpacingProps,
} from "@/components/puckeditor/blocks/constants";
import styles from "./styles.module.css";
import getClassNameFactory from "@/components/puckeditor/get-classname-factory";

const getClassName = getClassNameFactory("Typography", styles);

export type Props = {
  children: React.ReactNode;
  fontSize: number;
  spacings?: SpacingProps;
  textAlign?: CSSProperties["textAlign"];
  color?: string;
  backgroundColor: BackgroundFieldsProps;
  width?: number;
};

export const TypographyRender = ({
  children,
  fontSize,
  spacings,
  textAlign,
  color,
  backgroundColor,
  width,
}: Props) => {
  const styles: CSSProperties = {
    fontSize: fontSize,
    marginTop: spacings?.marginTop ?? 0,
    marginBottom: spacings?.marginBottom ?? 0,
    paddingLeft: spacings?.paddingLeft ?? 0,
    paddingRight: spacings?.paddingRight ?? 0,
    paddingTop: spacings?.paddingTop ?? 0,
    paddingBottom: spacings?.paddingBottom ?? 0,
    textAlign: textAlign ?? "center",
    color: color ?? "black",
    width: `${width ?? 100}%`,
    minHeight: "40px",
    marginLeft: "auto",
    marginRight: "auto",
  };

  if (backgroundColor && backgroundColor?.color === "transparent") {
    delete styles.backgroundColor;
  } else if (backgroundColor) {
    styles.backgroundColor = hex2rgba({
      hex: backgroundColor?.color,
      backgroundOpacity: backgroundColor?.opacity,
    });
  }

  return (
    <div className={getClassName()} style={styles}>
      {children}
    </div>
  );
};
