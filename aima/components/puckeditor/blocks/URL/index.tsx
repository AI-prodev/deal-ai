import {
  BackgroundFieldsProps,
  BorderFieldsProps,
  BoxShadowFieldsProps,
  ColorFieldsProps,
  FontStyleProps,
  MAX_SPACING,
  PUCKEDITOR_BACKGROUND_FIELDS,
  PUCKEDITOR_UPLOAD_IMAGE_FIELDS,
  PUCKEDITOR_BORDER_FIELDS,
  PUCKEDITOR_BOX_SHADOW_FIELDS,
  PUCKEDITOR_COLOR_FIELDS,
  PUCKEDITOR_FONT_FIELDS,
  PUCKEDITOR_SPACING_FIELDS,
  PUCKEDITOR_WIDTH_FIELDS,
  SpacingProps,
  WidthFieldsProps,
} from "@/components/puckeditor/blocks/constants";
import hex2rgba from "@/components/puckeditor/utils/hex2rgba";
import clsx from "clsx";
import styles from "./styles.module.css";
import getClassNameFactory from "@/components/puckeditor/get-classname-factory";
import PuckSlider from "@/components/puckeditor/utils/slider/Slider";

const getClassName = getClassNameFactory("URL", styles);

type TitleType = {
  backgroundColor: BackgroundFieldsProps;
  spacings: SpacingProps;
  border: BorderFieldsProps;
} & ColorFieldsProps &
  BoxShadowFieldsProps &
  WidthFieldsProps &
  FontStyleProps;

export type URLFieldsProps = {
  urls: {
    href: string;
    title?: string;
    image: {
      image: {
        url?: string;
      };
    };
  }[];
  separator?: string;
  fontSize?: number;
  align?: "left" | "center" | "right";
  gap?: number;
} & TitleType;

const URL: any = {
  fields: {
    urls: {
      label: "URLs",
      type: "array",
      getItemSummary: (url: string, id: number) => `URL ${id! + 1}`,
      defaultItemProps: {
        href: "http://example.com",
        title: "Link",
      },
      arrayFields: {
        href: {
          type: "text",
          label: "URL",
        },
        title: {
          label: "Title",
          type: "text",
        },
        image: {
          type: "object",
          label: "Image",
          objectFields: {
            image: PUCKEDITOR_UPLOAD_IMAGE_FIELDS.fields!.image,
          },
        },
      },
    },
    separator: {
      label: "Separator",
      type: "text",
    },
    fontSize: {
      label: "Font Size",
      type: "custom",
      render: ({ value, onChange }: any) => (
        <PuckSlider
          value={value}
          name={"fontSize"}
          onChange={onChange}
          label={`Font Size - ${value ?? 0}px`}
          min={7}
          max={100}
        />
      ),
    },
    align: {
      type: "radio",
      options: [
        { label: "left", value: "left" },
        { label: "center", value: "center" },
        { label: "right", value: "right" },
      ],
    },
    gap: {
      label: "Gap",
      type: "custom",
      render: ({ value, onChange }: any) => (
        <PuckSlider
          value={value}
          name="gap"
          onChange={onChange}
          label={`Gap ${value ?? 0}px`}
          max={MAX_SPACING}
          defaultValue={13}
        />
      ),
    },
    ...PUCKEDITOR_BACKGROUND_FIELDS.fields,
    ...PUCKEDITOR_SPACING_FIELDS.fields,
    ...PUCKEDITOR_COLOR_FIELDS.fields,
    ...PUCKEDITOR_BORDER_FIELDS.fields,
    ...PUCKEDITOR_BOX_SHADOW_FIELDS.fields,
    ...PUCKEDITOR_WIDTH_FIELDS.fields,
    ...PUCKEDITOR_FONT_FIELDS.fields,
  },
  defaultProps: {
    urls: [
      {
        href: "http://example.com",
        title: "Link 1",
      },
    ],
    separator: "|",
    image: {
      image: {
        url: "",
      },
    },
    fontSize: 12,
    align: "center",
    gap: 15,
    width: 100,
    backgroundColor: PUCKEDITOR_BACKGROUND_FIELDS.defaultProps!.backgroundColor,
    spacings: PUCKEDITOR_SPACING_FIELDS.defaultProps!.spacings,
    color: PUCKEDITOR_COLOR_FIELDS.defaultProps!.color,
    border: PUCKEDITOR_BORDER_FIELDS.defaultProps!.border,
    boxShadow: PUCKEDITOR_BOX_SHADOW_FIELDS.defaultProps!.boxShadow,
    fontFamily: PUCKEDITOR_FONT_FIELDS.defaultProps!.fontFamily,
    italic: PUCKEDITOR_FONT_FIELDS.defaultProps!.italic,
    bold: PUCKEDITOR_FONT_FIELDS.defaultProps!.bold,
    underline: PUCKEDITOR_FONT_FIELDS.defaultProps!.underline,
  },
  render: (props: URLFieldsProps) => {
    const { urls, separator, align } = props;
    let titleBgColor;
    if (props?.backgroundColor) {
      titleBgColor =
        props?.backgroundColor?.color === "transparent"
          ? "transparent"
          : hex2rgba({
              hex: props?.backgroundColor?.color,
              backgroundOpacity: props?.backgroundColor?.opacity,
            });
    }

    const {
      marginTop,
      marginBottom,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight,
    } = props?.spacings || {};

    const titleStyles = {
      ...(titleBgColor && { backgroundColor: titleBgColor }),
      ...(props?.color && { color: props.color }),
      ...(props?.fontFamily && { fontFamily: props.fontFamily }),
      ...(props?.bold && { fontWeight: "bold" }),
      ...(props?.italic && { fontStyle: "italic" }),
      ...(props?.underline && { textDecoration: "underline" }),
      ...(props?.width && { width: `${props.width}%` }),
      ...(props?.boxShadow && { boxShadow: props.boxShadow }),
      ...(props?.border?.radius && {
        borderRadius: `${props.border.radius}px`,
      }),
      ...(props?.border && {
        border: `${props?.border?.width}px solid ${props?.border?.color}`,
      }),
      marginTop: `${marginTop}px`,
      marginBottom: `${marginBottom}px`,
      paddingTop: `${paddingTop}px`,
      paddingBottom: `${paddingBottom}px`,
      paddingLeft: `${paddingLeft}px`,
      paddingRight: `${paddingRight}px`,
      gap: `${props?.gap || 15}px`,
      fontSize: props?.fontSize || 12,
    };

    return (
      <span
        style={titleStyles}
        className={clsx(getClassName(), {
          [getClassName(align)]: getClassName(align),
        })}
      >
        {urls?.map((url, idx) => {
          const imageUrl = url?.image?.image?.url;

          return (
            <div key={idx}>
              <a
                style={{
                  color: props?.color ?? "#000",
                  textDecoration: "none",
                }}
                href={`${url.href}`}
              >
                {url.title}
                {imageUrl && (
                  <img
                    style={{
                      width: "100px",
                      height: "100px",
                    }}
                    src={imageUrl}
                    alt="Puck Editor Url Image"
                  />
                )}
              </a>
              {idx !== urls?.length - 1 ? " " + separator + " " : ""}
            </div>
          );
        })}
      </span>
    );
  },
};

export default URL;
