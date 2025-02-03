import React from "react";
import getClassNameFactory from "../../get-classname-factory";
import styles from "./styles.module.css";
import PuckSlider from "@/components/puckeditor/utils/slider/Slider";
import {
  BackgroundFieldsProps,
  BorderRadiusFieldsProps,
  ColorFieldsProps,
  FontStyleProps,
  PUCKEDITOR_BACKGROUND_FIELDS,
  PUCKEDITOR_BORDER_RADIUS_FIELDS,
  PUCKEDITOR_COLOR_FIELDS,
  PUCKEDITOR_FONT_FIELDS,
  PUCKEDITOR_SPACING_FIELDS,
  SpacingProps,
} from "@/components/puckeditor/blocks/constants";
import hex2rgba from "@/components/puckeditor/utils/hex2rgba";
import PuckImageUpload from "@/components/puckeditor/utils/UploadImage/PuckUploadImage";

const getClassName = getClassNameFactory("Header", styles);

export type HeaderProps = {
  title: string;
  logo: {
    image?: {
      url?: string;
    };
    spacings: SpacingProps;
  } & BorderRadiusFieldsProps;
  backgroundColor: BackgroundFieldsProps;
  textAlign: "center" | "left" | "right";
  fontSize?: number;
  spacings: SpacingProps;
} & ColorFieldsProps;

export type HeaderFontProps = HeaderProps & FontStyleProps;

const Header: any = {
  fields: {
    title: { type: "text" },
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
    ...PUCKEDITOR_FONT_FIELDS.fields,
    textAlign: {
      label: "Align",
      type: "radio",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
    logo: {
      type: "object",
      label: "Logo",
      objectFields: {
        image: {
          type: "custom",
          label: "Image",
          render: (props: any) => <PuckImageUpload {...props} />,
        },
        borderRadius: PUCKEDITOR_BORDER_RADIUS_FIELDS.fields!.borderRadius,
        spacings: PUCKEDITOR_SPACING_FIELDS.fields!.spacings,
      },
    },
    ...PUCKEDITOR_BACKGROUND_FIELDS.fields,
    color: PUCKEDITOR_COLOR_FIELDS.fields!.color,
    ...PUCKEDITOR_SPACING_FIELDS.fields,
  },
  defaultProps: {
    title: "Header Title",
    logo: {
      image: {
        url: "https://d210f0zr81wwm8.cloudfront.net/6618fca1ea4cc37ae0ca4786_a67920fe-76e8-4ce5-96de-d2042ca561ba_pngtree-website-url-rgb-color-icon-url-logo-line-vector-png-image_12735502.png",
      },
      borderRadius: PUCKEDITOR_BORDER_RADIUS_FIELDS.defaultProps!.borderRadius,
      spacings: PUCKEDITOR_SPACING_FIELDS.defaultProps!.spacings,
    },
    textAlign: "center",
    color: PUCKEDITOR_COLOR_FIELDS.defaultProps!.color,
    fontSize: 16,
    ...PUCKEDITOR_SPACING_FIELDS.defaultProps,
    ...PUCKEDITOR_BACKGROUND_FIELDS.defaultProps,
  },
  render: (props: HeaderFontProps) => {
    const {
      title,
      logo,
      backgroundColor,
      fontFamily,
      bold,
      italic,
      underline,
      spacings,
    } = props;

    const blockStyles = {
      marginTop: spacings?.marginTop,
      marginBottom: spacings?.marginBottom,
      paddingTop: spacings?.paddingTop,
      paddingBottom: spacings?.paddingBottom,
      paddingLeft: spacings?.paddingLeft,
      paddingRight: spacings?.paddingRight,
    } as React.CSSProperties;

    const logoStyles = {
      overflow: "hidden",
      borderRadius: logo?.borderRadius,
      marginTop: logo?.spacings?.marginTop,
      marginBottom: logo?.spacings?.marginBottom,
      paddingTop: logo?.spacings?.paddingTop,
      paddingBottom: logo?.spacings?.paddingBottom,
      paddingLeft: logo?.spacings?.paddingLeft,
      paddingRight: logo?.spacings?.paddingRight,
    } as React.CSSProperties;

    const titleStyles = {
      textAlign: props.textAlign,
      color: props.color,
      fontSize: props.fontSize,
      ...(fontFamily && { fontFamily }),
      ...(bold && { fontWeight: "bold" }),
      ...(italic && { fontStyle: "italic" }),
      ...(underline && { textDecoration: "underline" }),
    } as React.CSSProperties;

    if (backgroundColor && backgroundColor?.color === "transparent") {
      delete blockStyles?.backgroundColor;
    } else if (backgroundColor?.color) {
      blockStyles.backgroundColor = hex2rgba({
        hex: backgroundColor?.color,
        backgroundOpacity: backgroundColor?.opacity,
      });
    }

    return (
      <div className={getClassName()} style={blockStyles}>
        <div className={getClassName("logo")} style={logoStyles}>
          <img
            alt="Header Logo"
            src={logo?.image?.url}
            style={{ borderRadius: logoStyles?.borderRadius }}
          />
        </div>
        {title && (
          <div className={getClassName("title")} style={titleStyles}>
            {title}
          </div>
        )}
      </div>
    );
  },
};

export default Header;
