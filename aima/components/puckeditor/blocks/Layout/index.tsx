import { DropZone } from "@measured/puck";
import { CSSProperties } from "react";
import { PUCKEDITOR_LAYOUT_CONFIG } from "./constants";
import { PUCKEDITOR_LAYOUT_TYPES } from "./types";
import hex2rgba from "@/components/puckeditor/utils/hex2rgba";
import styles from "./styles.module.css";
import getClassNameFactory from "../../get-classname-factory";
import {
  BackgroundFieldsProps,
  BackgroundImageFieldsProps,
  BorderFieldsProps,
  SpacingProps,
} from "@/components/puckeditor/blocks/constants";

const getClassName = getClassNameFactory("Layout", styles);

type Props = {
  variant: PUCKEDITOR_LAYOUT_TYPES;
  spacings: SpacingProps;
  backgroundColor: BackgroundFieldsProps;
  border: BorderFieldsProps;
  boxShadow?: string;
  items?: any;
} & BackgroundImageFieldsProps;

const LayoutRender = (props: Props) => {
  const {
    variant = "FullWidth",
    spacings,
    border,
    boxShadow,
    backgroundImage,
  } = props || {};
  let { backgroundColor } = props || {};

  const styles: CSSProperties = {
    marginTop: spacings?.marginTop ?? 0,
    marginBottom: spacings?.marginBottom ?? 0,
    paddingTop: spacings?.paddingTop ?? 0,
    paddingBottom: spacings?.paddingBottom ?? 0,
    paddingLeft: spacings?.paddingLeft ?? 0,
    paddingRight: spacings?.paddingRight ?? 0,
    border: `${border?.width}px solid ${border?.color}`,
    boxShadow: boxShadow ?? "",
    borderRadius: `${border.radius ?? 0}px`,
  };

  if (backgroundColor && backgroundColor?.color === "transparent") {
    delete styles?.backgroundColor;
  } else if (backgroundColor?.color) {
    styles.backgroundColor = hex2rgba({
      hex: backgroundColor?.color,
      backgroundOpacity: backgroundColor?.opacity,
    });
  }

  return (
    <div className={getClassName(variant)} style={styles}>
      <DropZone
        zone={`${variant}`}
        disallow={[variant, "HamburgerMenu"]}
        style={{
          minHeight: "64px",
        }}
      />
      {props.items?.map((item: any, idx: number) => {
        return <div key={idx}>{item}</div>;
      })}
      {backgroundImage?.url && (
        <div
          className={getClassName("image")}
          style={{
            backgroundImage: `url("${backgroundImage?.url}")`,
            backgroundPosition: backgroundImage?.position,
            backgroundAttachment: backgroundImage?.attachment,
            backgroundSize: backgroundImage?.size,
            backgroundRepeat: backgroundImage?.repeat,
          }}
        />
      )}
    </div>
  );
};
export const FullWidth: any = {
  ...PUCKEDITOR_LAYOUT_CONFIG,
  render: (props: any) => <LayoutRender variant="FullWidth" {...props} />,
};

export const Wide: any = {
  ...PUCKEDITOR_LAYOUT_CONFIG,
  render: (props: any) => <LayoutRender variant="Wide" {...props} />,
};

export const Medium: any = {
  ...PUCKEDITOR_LAYOUT_CONFIG,
  render: (props: any) => <LayoutRender variant="Medium" {...props} />,
};

export const Small: any = {
  ...PUCKEDITOR_LAYOUT_CONFIG,
  render: (props: any) => <LayoutRender variant="Small" {...props} />,
};
