import getClassNameFactory from "@/components/puckeditor/get-classname-factory";
import styles from "./styles.module.css";
import { ComponentConfig, Fields } from "@measured/puck";
import { CSSProperties } from "react";
import PuckSlider from "@/components/puckeditor/utils/slider/Slider";
import {
  BackgroundFieldsProps,
  PUCKEDITOR_BACKGROUND_FIELDS,
  PUCKEDITOR_SPACING_FIELDS,
  SpacingProps,
} from "@/components/puckeditor/blocks/constants";
import hex2rgba from "@/components/puckeditor/utils/hex2rgba";

const getClassName = getClassNameFactory("GoogleMap", styles);

export type GoogleMapsProps = {
  embedUrl: string;
  align?: "left" | "center" | "right";
  mapSize?: number;
  spacings: SpacingProps;
  backgroundColor: BackgroundFieldsProps;
};

const fields: Fields<GoogleMapsProps> = {
  embedUrl: {
    label: "Embed URL",
    type: "text",
  },
  mapSize: {
    label: "Map Size",
    type: "custom",
    render: ({ value, name, onChange, field }) => (
      <PuckSlider
        value={value}
        name={name}
        onChange={onChange}
        label={`${field?.label} ${value}`}
        min={150}
        max={500}
      />
    ),
  },
  align: {
    label: "Align",
    type: "radio",
    options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
    ],
  },
  backgroundColor: PUCKEDITOR_BACKGROUND_FIELDS.fields!.backgroundColor,
  spacings: PUCKEDITOR_SPACING_FIELDS.fields!.spacings,
};

const GoogleMaps: ComponentConfig<GoogleMapsProps> = {
  fields,
  defaultProps: {
    embedUrl: "https://maps.google.com/maps?&q=Toronto&z=12&t=q&output=embed",
    mapSize: 250,
    align: "left",
    spacings: {
      ...PUCKEDITOR_SPACING_FIELDS.defaultProps!.spacings,
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 30,
      paddingRight: 30,
    },
    backgroundColor: PUCKEDITOR_BACKGROUND_FIELDS.defaultProps!.backgroundColor,
  },
  render: (props: GoogleMapsProps) => {
    const styles: CSSProperties = {
      ...(props?.spacings?.marginTop && {
        marginTop: props?.spacings?.marginTop,
      }),
      ...(props?.spacings?.marginBottom && {
        marginBottom: props?.spacings?.marginBottom,
      }),
      ...(props?.spacings?.paddingTop && {
        paddingTop: props?.spacings?.paddingTop,
      }),
      ...(props?.spacings?.paddingRight && {
        paddingRight: props?.spacings?.paddingRight,
      }),
      ...(props?.spacings?.paddingBottom && {
        paddingBottom: props?.spacings?.paddingBottom,
      }),
      ...(props?.spacings?.paddingLeft && {
        paddingLeft: props?.spacings?.paddingLeft,
      }),
    };

    if (
      props.backgroundColor &&
      props.backgroundColor?.color === "transparent"
    ) {
      styles.backgroundColor = "transparent";
    } else if (props.backgroundColor?.color) {
      styles.backgroundColor = hex2rgba({
        hex: props.backgroundColor?.color,
        backgroundOpacity: props.backgroundColor?.opacity,
      });
    }

    const iframeStyles: CSSProperties = {};

    const align = props.align ?? "left";

    switch (align) {
      case "left":
        iframeStyles.marginRight = "auto";
        break;
      case "center":
        iframeStyles.marginLeft = "auto";
        iframeStyles.marginRight = "auto";
        break;
      case "right":
        iframeStyles.marginLeft = "auto";
        break;
      default:
        iframeStyles.marginRight = "auto";
        break;
    }

    return (
      <div className={getClassName()} style={styles}>
        <iframe
          className={getClassName("map")}
          src={props.embedUrl}
          width={props.mapSize}
          height={props.mapSize}
          style={iframeStyles}
        ></iframe>
      </div>
    );
  },
};

export default GoogleMaps;
