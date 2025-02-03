/* eslint-disable @next/next/no-img-element */
import React, { CSSProperties } from "react";
import { ComponentConfig } from "@measured/puck";
import styles from "./styles.module.css";
import Section from "../Section";
import getClassNameFactory from "../../get-classname-factory";
import {
  ColorFieldsProps,
  FontSizeProps,
  FontStyleProps,
  PUCKEDITOR_COLOR_FIELDS,
  PUCKEDITOR_FONT_FIELDS,
  PUCKEDITOR_FONT_SIZE_FIELDS,
} from "@/components/puckeditor/blocks/constants";
import { PUCKEDITOR_STATS_DEFAULT_ITEM } from "@/components/puckeditor/blocks/Stats/constants";

const getClassName = getClassNameFactory("Stats", styles);

export type StatsProps = {
  items: {
    title: {
      title: string;
    } & FontStyleProps &
      FontSizeProps &
      ColorFieldsProps;
    description: {
      description: string;
    } & FontStyleProps &
      FontSizeProps &
      ColorFieldsProps;
  }[];
};

const Stats: ComponentConfig<StatsProps> = {
  fields: {
    items: {
      type: "array",
      getItemSummary: (item, i) => item?.title?.title || `Feature #${i}`,
      defaultItemProps: PUCKEDITOR_STATS_DEFAULT_ITEM,
      arrayFields: {
        title: {
          type: "object",
          label: "Title",
          objectFields: {
            title: {
              label: "Title",
              type: "text",
            },
            fontFamily: PUCKEDITOR_FONT_FIELDS.fields!.fontFamily,
            italic: PUCKEDITOR_FONT_FIELDS.fields!.italic,
            bold: PUCKEDITOR_FONT_FIELDS.fields!.bold,
            underline: PUCKEDITOR_FONT_FIELDS.fields!.underline,
            fontSize: PUCKEDITOR_FONT_SIZE_FIELDS.fields!.fontSize,
            color: PUCKEDITOR_COLOR_FIELDS.fields!.color,
          },
        },
        description: {
          type: "object",
          label: "Description",
          objectFields: {
            description: {
              label: "Description",
              type: "text",
            },
            fontFamily: PUCKEDITOR_FONT_FIELDS.fields!.fontFamily,
            italic: PUCKEDITOR_FONT_FIELDS.fields!.italic,
            bold: PUCKEDITOR_FONT_FIELDS.fields!.bold,
            underline: PUCKEDITOR_FONT_FIELDS.fields!.underline,
            fontSize: PUCKEDITOR_FONT_SIZE_FIELDS.fields!.fontSize,
            color: PUCKEDITOR_COLOR_FIELDS.fields!.color,
          },
        },
      },
    },
  },
  defaultProps: {
    items: [PUCKEDITOR_STATS_DEFAULT_ITEM],
  },
  render: ({ items }) => {
    return (
      <Section className={getClassName()} maxWidth={"916px"}>
        <div className={getClassName("items")}>
          {items.map((item, i) => {
            const title = item?.title || {};
            const description = item?.description || {};

            const titleStyles: CSSProperties = {
              fontSize: title?.fontSize,
              fontFamily: title?.fontFamily ?? "Arial",
              ...(title?.bold && { fontWeight: "bold" }),
              ...(title?.italic && { fontStyle: "italic" }),
              ...(title?.underline && {
                textDecoration: "underline",
              }),
              color: title?.color,
            };

            const descriptionStyles: CSSProperties = {
              fontSize: description?.fontSize,
              fontFamily: description?.fontFamily ?? "Arial",
              ...(description?.bold && { fontWeight: "bold" }),
              ...(description?.italic && { fontStyle: "italic" }),
              ...(description?.underline && {
                textDecoration: "underline",
              }),
              color: description?.color,
            };

            return (
              <div key={i} className={getClassName("item")}>
                <div className={getClassName("label")} style={titleStyles}>
                  {title?.title}
                </div>
                <div
                  className={getClassName("value")}
                  style={descriptionStyles}
                >
                  {description?.description}
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    );
  },
};

export default Stats;
