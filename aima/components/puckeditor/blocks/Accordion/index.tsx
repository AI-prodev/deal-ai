import React, { CSSProperties } from "react";
import { ComponentConfig } from "@measured/puck";
import styles from "./styles.module.css";
import getClassNameFactory from "../../get-classname-factory";
import Section from "../Section";
import PuckColourPicker from "@/components/puckeditor/utils/slider/ColourPicker";
import PuckSlider from "@/components/puckeditor/utils/slider/Slider";
import {
  BackgroundFieldsProps,
  MAX_SPACING,
  SPACING_FIELDS,
  SpacingProps,
} from "@/components/puckeditor/blocks/constants";
import hex2rgba from "@/components/puckeditor/utils/hex2rgba";
import { PUCKEDITOR_ACCORDION_DEFAULT_ITEM } from "@/components/puckeditor/blocks/Accordion/constant";
import PuckAccordion from "@/components/puckeditor/utils/PuckAccordion";

const getClassName = getClassNameFactory("Accordion", styles);

export type AccordionItem = {
  title: {
    text: string;
    color?: string;
    size?: number;
    align: "left" | "center" | "right";
    backgroundColor: BackgroundFieldsProps;
    spacings: SpacingProps;
  };
  description: {
    text: string;
    color?: string;
    size?: number;
    align: "left" | "center" | "right";
    backgroundColor: BackgroundFieldsProps;
    spacings: SpacingProps;
  };
};

export type AccordionProps = {
  items: AccordionItem[];
  maxWidth?: number;
};

const Accordion: ComponentConfig<AccordionProps> = {
  fields: {
    items: {
      type: "array",
      getItemSummary: (_, id) => `Item ${id! + 1}` || "Item",
      arrayFields: {
        title: {
          label: "Title",
          type: "object",
          objectFields: {
            text: { type: "text" },
            color: {
              label: "Title Color",
              type: "custom",
              render: (props: any) => <PuckColourPicker {...props} />,
            },
            size: {
              label: "Title Size",
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
            align: {
              type: "radio",
              options: [
                { label: "Left", value: "left" },
                { label: "Center", value: "center" },
                { label: "Right", value: "right" },
              ],
            },
            backgroundColor: {
              type: "custom",
              label: "Background Color",
              render: ({ value, onChange, field }) => (
                <PuckAccordion label={field?.label}>
                  <PuckColourPicker
                    value={value}
                    name="color"
                    onChange={onChange}
                  />
                  <PuckSlider
                    value={value}
                    name="opacity"
                    onChange={onChange}
                    label={`Background Opacity ${value?.opacity ?? 0}`}
                    max={100}
                    defaultValue={100}
                  />
                </PuckAccordion>
              ),
            },
            spacings: {
              type: "custom",
              label: "Spacings",
              render: ({ value, onChange, field }) => (
                <PuckAccordion label={field?.label}>
                  {SPACING_FIELDS?.map(field => (
                    <PuckSlider
                      key={field?.id}
                      value={value}
                      name={field?.name}
                      onChange={onChange}
                      label={`${field?.label} ${value?.[field?.name] || 0}`}
                      max={MAX_SPACING}
                    />
                  ))}
                </PuckAccordion>
              ),
            },
          },
        },
        description: {
          label: "Description",
          type: "object",
          objectFields: {
            text: { type: "textarea" },
            color: {
              label: "Description Color",
              type: "custom",
              render: (props: any) => <PuckColourPicker {...props} />,
            },
            size: {
              label: "Description Size",
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
            align: {
              type: "radio",
              options: [
                { label: "Left", value: "left" },
                { label: "Center", value: "center" },
                { label: "Right", value: "right" },
              ],
            },
            backgroundColor: {
              type: "custom",
              label: "Background Color",
              render: ({ value, onChange, field }) => (
                <PuckAccordion label={field?.label}>
                  <PuckColourPicker
                    value={value}
                    name="color"
                    onChange={onChange}
                  />
                  <PuckSlider
                    value={value}
                    name="opacity"
                    onChange={onChange}
                    label={`Background Opacity ${value?.opacity ?? 0}`}
                    max={100}
                    defaultValue={100}
                  />
                </PuckAccordion>
              ),
            },
            spacings: {
              type: "custom",
              label: "Spacings",
              render: ({ value, onChange, field }) => (
                <PuckAccordion label={field?.label}>
                  {SPACING_FIELDS?.map(field => (
                    <PuckSlider
                      key={field?.id}
                      value={value}
                      name={field?.name}
                      onChange={onChange}
                      label={`${field?.label} ${value?.[field?.name] || 0}`}
                      max={MAX_SPACING}
                    />
                  ))}
                </PuckAccordion>
              ),
            },
          },
        },
      },
      defaultItemProps: PUCKEDITOR_ACCORDION_DEFAULT_ITEM,
    },
    maxWidth: {
      label: "Max Width (px)",
      type: "number",
    },
  },
  defaultProps: {
    items: [PUCKEDITOR_ACCORDION_DEFAULT_ITEM],
  },
  render: ({ items, maxWidth }) => {
    return (
      <Section padding="10px" maxWidth={`${maxWidth}px`}>
        {items?.map((item, index) => {
          const title = item?.title || {};
          const description = item?.description || {};

          let titleBgColor;
          if (title?.backgroundColor) {
            titleBgColor =
              title?.backgroundColor?.color === "transparent"
                ? "transparent"
                : hex2rgba({
                    hex: title?.backgroundColor?.color,
                    backgroundOpacity: title?.backgroundColor?.opacity,
                  });
          }

          let descriptionBgColor;
          if (description?.backgroundColor) {
            descriptionBgColor =
              description?.backgroundColor?.color === "transparent"
                ? "transparent"
                : hex2rgba({
                    hex: description?.backgroundColor?.color,
                    backgroundOpacity: description.backgroundColor?.opacity,
                  });
          }

          const titleStyles: CSSProperties = {
            color: title.color,
            fontSize: title.size,
            textAlign: title.align,
            fontWeight: "bold",
            marginTop: title.spacings?.marginTop ?? 0,
            marginBottom: title.spacings?.marginBottom ?? 0,
            paddingTop: title.spacings?.paddingTop ?? 0,
            paddingBottom: title.spacings?.paddingBottom ?? 0,
            paddingLeft: title.spacings?.paddingLeft ?? 0,
            paddingRight: title.spacings?.paddingRight ?? 0,
            ...(titleBgColor && { backgroundColor: titleBgColor }),
          };

          const descriptionStyles: CSSProperties = {
            color: description.color,
            fontSize: description.size,
            textAlign: description.align,
            marginTop: description.spacings?.marginTop ?? 0,
            marginBottom: description.spacings?.marginBottom ?? 0,
            paddingTop: description.spacings?.paddingTop ?? 0,
            paddingBottom: description.spacings?.paddingBottom ?? 0,
            paddingLeft: description.spacings?.paddingLeft ?? 0,
            paddingRight: description.spacings?.paddingRight ?? 0,
            ...(descriptionBgColor && {
              backgroundColor: descriptionBgColor,
            }),
          };
          return (
            <div key={index} className={getClassName()}>
              <input
                className={getClassName("input")}
                id={`accordion-${index}`}
                type="radio"
                name="accordion"
              />
              <label
                className={getClassName("label")}
                htmlFor={`accordion-${index}`}
                style={titleStyles}
              >
                {title.text}
              </label>
              <div className={getClassName("content")}>
                <p style={descriptionStyles}>{description.text}</p>
              </div>
            </div>
          );
        })}
      </Section>
    );
  },
};

export default Accordion;
