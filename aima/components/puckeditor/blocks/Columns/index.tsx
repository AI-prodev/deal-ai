import React, { CSSProperties } from "react";
import { ComponentConfig, DropZone } from "@measured/puck";
import styles from "./styles.module.css";
import Section from "../Section";
import getClassNameFactory from "../../get-classname-factory";
import {
  BackgroundFieldsProps,
  BorderFieldsProps,
  BoxShadowFieldsProps,
  PUCKEDITOR_BACKGROUND_FIELDS,
  PUCKEDITOR_BORDER_FIELDS,
  PUCKEDITOR_BOX_SHADOW_FIELDS,
  PUCKEDITOR_SPACING_FIELDS,
  SpacingProps,
} from "@/components/puckeditor/blocks/constants";
import hex2rgba from "@/components/puckeditor/utils/hex2rgba";
import { PUCKEDITOR_COLUMNS_DEFAULT_ITEM } from "@/components/puckeditor/blocks/Columns/constants";

const getClassName = getClassNameFactory("Columns", styles);

export type ColumnsProps = {
  distribution: "auto" | "manual";
  columns: {
    span?: number;
    backgroundColor: BackgroundFieldsProps;
    border: BorderFieldsProps;
    spacings: SpacingProps;
    boxShadow: string;
  }[];
  backgroundColor: BackgroundFieldsProps;
  border: BorderFieldsProps;
  spacings: SpacingProps;
  zoneItems?: any;
} & BoxShadowFieldsProps;

const Columns: ComponentConfig<ColumnsProps> = {
  //@ts-ignore
  fields: {
    distribution: {
      type: "radio",
      options: [
        {
          value: "auto",
          label: "Auto",
        },
        {
          value: "manual",
          label: "Manual",
        },
      ],
    },
    columns: {
      type: "array",
      getItemSummary: (col, id) =>
        `Column ${id! + 1}, span ${
          col.span ? Math.max(Math.min(col.span, 12), 1) : "auto"
        }`,
      arrayFields: {
        span: {
          label: "Span (1-12)",
          // @ts-ignore
          type: "number",
          min: 0,
          max: 12,
        },
        backgroundColor: PUCKEDITOR_BACKGROUND_FIELDS.fields!.backgroundColor,
        border: PUCKEDITOR_BORDER_FIELDS.fields!.border,
        boxShadow: PUCKEDITOR_BOX_SHADOW_FIELDS.fields!.boxShadow,
        spacings: PUCKEDITOR_SPACING_FIELDS.fields!.spacings,
      },
      defaultItemProps: PUCKEDITOR_COLUMNS_DEFAULT_ITEM,
    },
    backgroundColor: PUCKEDITOR_BACKGROUND_FIELDS.fields!.backgroundColor,
    border: PUCKEDITOR_BORDER_FIELDS.fields!.border,
    boxShadow: PUCKEDITOR_BOX_SHADOW_FIELDS.fields!.boxShadow,
    spacings: PUCKEDITOR_SPACING_FIELDS.fields!.spacings,
  },
  defaultProps: {
    distribution: "auto",
    columns: [PUCKEDITOR_COLUMNS_DEFAULT_ITEM, PUCKEDITOR_COLUMNS_DEFAULT_ITEM],
    zoneItems: null,
    backgroundColor: PUCKEDITOR_BACKGROUND_FIELDS.defaultProps!.backgroundColor,
    border: PUCKEDITOR_BORDER_FIELDS.defaultProps!.border,
    boxShadow: PUCKEDITOR_BOX_SHADOW_FIELDS.defaultProps!.boxShadow,
    spacings: PUCKEDITOR_SPACING_FIELDS.defaultProps!.spacings,
  },
  render: ({
    columns,
    distribution,
    backgroundColor,
    zoneItems,
    spacings,
    border,
    boxShadow,
  }) => {
    const style: CSSProperties = {
      border: `${border?.width}px solid ${border?.color}`,
      borderRadius: border?.radius ?? 0,
      boxShadow: boxShadow ?? "",
      marginTop: spacings?.marginTop ?? 0,
      marginBottom: spacings?.marginBottom ?? 0,
      paddingTop: spacings?.paddingTop ?? 0,
      paddingBottom: spacings?.paddingBottom ?? 0,
      paddingLeft: spacings?.paddingLeft ?? 0,
      paddingRight: spacings?.paddingRight ?? 0,
    };

    if (backgroundColor && backgroundColor?.color === "transparent") {
      delete style.backgroundColor;
    } else if (backgroundColor?.color) {
      style.backgroundColor = hex2rgba({
        hex: backgroundColor?.color,
        backgroundOpacity: backgroundColor?.opacity,
      });
    }

    return (
      <Section style={style}>
        <div
          className={getClassName()}
          style={{
            gridTemplateColumns:
              distribution === "manual"
                ? "repeat(12, 1fr)"
                : `repeat(${columns?.length}, 1fr)`,
          }}
        >
          {columns?.map(
            ({ span, backgroundColor, spacings, border, boxShadow }, idx) => {
              const columnStyle: CSSProperties = {
                display: "flex",
                flexDirection: "column",
                gridColumn:
                  span && distribution === "manual"
                    ? `span ${Math.max(Math.min(span, 12), 1)}`
                    : "",
                border: `${border?.width}px solid ${border?.color}`,
                borderRadius: border?.radius ?? 0,
                boxShadow: boxShadow ?? "",
                marginTop: spacings?.marginTop ?? 0,
                marginBottom: spacings?.marginBottom ?? 0,
                paddingTop: spacings?.paddingTop ?? 0,
                paddingBottom: spacings?.paddingBottom ?? 0,
                paddingLeft: spacings?.paddingLeft ?? 0,
                paddingRight: spacings?.paddingRight ?? 0,
              };

              if (backgroundColor && backgroundColor?.color === "transparent") {
                delete columnStyle.backgroundColor;
              } else if (backgroundColor?.color) {
                columnStyle.backgroundColor = hex2rgba({
                  hex: backgroundColor?.color,
                  backgroundOpacity: backgroundColor?.opacity,
                });
              }

              return (
                <div key={idx} style={columnStyle}>
                  <DropZone
                    style={{ background: "transparent" }}
                    zone={`Columns-${idx}`}
                    disallow={["Hero", "Logos", "Stats"]}
                  />
                  {zoneItems?.filter((zoneItem: any, index: number) => {
                    if (idx === index) {
                      return zoneItem;
                    } else {
                      return false;
                    }
                  })}
                </div>
              );
            }
          )}
        </div>
      </Section>
    );
  },
};

export default Columns;
