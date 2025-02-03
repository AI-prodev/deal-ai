import { ComponentConfig } from "@measured/puck";
import {
  BackgroundFieldsProps,
  BorderFieldsProps,
  ColorFieldsProps,
  FontStyleProps,
  PUCKEDITOR_BACKGROUND_FIELDS,
  PUCKEDITOR_BORDER_FIELDS,
  PUCKEDITOR_COLOR_FIELDS,
  PUCKEDITOR_FONT_FIELDS,
  PUCKEDITOR_SPACING_FIELDS,
  SpacingProps,
} from "@/components/puckeditor/blocks/constants";
import { CSSProperties } from "react";
import hex2rgba from "@/components/puckeditor/utils/hex2rgba";
import PuckSlider from "@/components/puckeditor/utils/slider/Slider";
import * as React from "react";
import { PUCKEDITOR_LIST_DEFAULT_ITEM } from "@/components/puckeditor/blocks/List/constants";

export type ListProps = {
  list: {
    icon: {
      color: string;
      backgroundColor: BackgroundFieldsProps;
    };
    text: {
      text: string;
      fontSize: number;
    } & ColorFieldsProps &
      FontStyleProps;
  }[];
  spacings: SpacingProps;
  backgroundColor: BackgroundFieldsProps;
  border: BorderFieldsProps;
};

const List: ComponentConfig<ListProps> | any = {
  fields: {
    list: {
      type: "array",
      getItemSummary: (_: any, id: any) => `Item ${id! + 1}`,
      arrayFields: {
        icon: {
          type: "object",
          label: "Icon",
          objectFields: {
            color: PUCKEDITOR_COLOR_FIELDS.fields!.color,
            backgroundColor:
              PUCKEDITOR_BACKGROUND_FIELDS.fields?.backgroundColor,
          },
        },
        text: {
          type: "object",
          label: "Text",
          objectFields: {
            text: {
              type: "text",
              label: "Text",
            },
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
            fontFamily: PUCKEDITOR_FONT_FIELDS.fields!.fontFamily,
            italic: PUCKEDITOR_FONT_FIELDS.fields!.italic,
            bold: PUCKEDITOR_FONT_FIELDS.fields!.bold,
            underline: PUCKEDITOR_FONT_FIELDS.fields!.underline,
            color: PUCKEDITOR_COLOR_FIELDS.fields!.color,
          },
        },
      },
      defaultItemProps: PUCKEDITOR_LIST_DEFAULT_ITEM,
    },
    spacings: PUCKEDITOR_SPACING_FIELDS.fields!.spacings,
    backgroundColor: PUCKEDITOR_BACKGROUND_FIELDS.fields!.backgroundColor,
    border: PUCKEDITOR_BORDER_FIELDS.fields!.border,
  },
  defaultProps: {
    list: [PUCKEDITOR_LIST_DEFAULT_ITEM],
    spacings: {
      ...PUCKEDITOR_SPACING_FIELDS.defaultProps!.spacings,
      paddingLeft: 15,
      paddingRight: 15,
      paddingTop: 10,
      paddingBottom: 10,
    },
    backgroundColor: PUCKEDITOR_BACKGROUND_FIELDS.defaultProps!.backgroundColor,
    border: PUCKEDITOR_BORDER_FIELDS.defaultProps!.border,
  },
  render: ({ list, spacings, backgroundColor, border }: any) => {
    const styles: CSSProperties = {
      marginTop: spacings?.marginTop,
      marginBottom: spacings?.marginBottom,
      paddingTop: spacings?.paddingTop,
      paddingBottom: spacings?.paddingBottom,
      paddingLeft: spacings?.paddingLeft,
      paddingRight: spacings?.paddingRight,
      border: `${border?.width}px solid ${border?.color}`,
      borderRadius: border?.radius ?? 0,
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
      <div style={styles}>
        {list?.map(({ text, icon }: any, index: number) => {
          const iconStyles: CSSProperties = {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "45px",
            minWidth: "45px",
            height: "45px",
            minHeight: "45px",
            fontSize: "20px",
            fontWeight: "bold",
            borderRadius: "50%",
            marginRight: "12px",
            color: icon?.color,
          };

          if (
            icon?.backgroundColor &&
            icon?.backgroundColor?.color === "transparent"
          ) {
            delete iconStyles.backgroundColor;
          } else if (icon?.backgroundColor?.color) {
            iconStyles.backgroundColor = hex2rgba({
              hex: icon?.backgroundColor?.color,
              backgroundOpacity: icon?.backgroundColor?.opacity,
            });
          }

          const textStyles: CSSProperties = {
            fontSize: text?.fontSize,
            color: text?.color,
            fontFamily: text?.fontFamily ?? "Arial",
            ...(text?.bold && { fontWeight: "bold" }),
            ...(text?.italic && { fontStyle: "italic" }),
            ...(text?.underline && { textDecoration: "underline" }),
          };

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "12px",
              }}
            >
              <div style={iconStyles}>{index + 1}</div>
              <p style={textStyles}>{text?.text}</p>
            </div>
          );
        })}
      </div>
    );
  },
};

export default List;
