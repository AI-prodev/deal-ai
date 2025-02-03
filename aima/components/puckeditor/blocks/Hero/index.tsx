/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { Button, ComponentConfig } from "@measured/puck";
import styles from "./styles.module.css";
import Section from "../Section";
import getClassNameFactory from "../../get-classname-factory";
import PuckRichTextEditor from "@/components/puckeditor/utils/PuckRichTextEditor";

const getClassName = getClassNameFactory("Hero", styles);

export type HeroProps = {
  title: {
    text: string;
    color?: string;
    size?: number;
  };
  description: {
    text: string;
    color?: string;
    size?: number;
  };
  align?: string;
  padding: string;
  image?: {
    mode?: "inline" | "background";
    url?: string;
    overlayer?: boolean;
    overlayerColor?: string;
  };
  buttons: {
    label: string;
    href: string;
    variant?: "primary" | "secondary";
    more?: { text: string }[];
  }[];
  bgColor?: string;
};

const Hero: ComponentConfig<HeroProps> = {
  fields: {
    title: {
      type: "object",
      objectFields: {
        text: {
          label: "Text",
          type: "custom",
          render: (props: any) => <PuckRichTextEditor {...props} rows={3} />,
        },
        color: { type: "text" },
        size: { type: "number" },
      },
    },
    description: {
      type: "object",
      objectFields: {
        text: {
          label: "Text",
          type: "custom",
          render: (props: any) => <PuckRichTextEditor {...props} />,
        },
        color: { type: "text" },
        size: { type: "number" },
      },
    },
    buttons: {
      type: "array",
      // @ts-ignore
      min: 1,
      max: 4,
      getItemSummary: item => item.label || "Button",
      arrayFields: {
        label: { type: "text" },
        href: { type: "text" },
        variant: {
          type: "select",
          options: [
            { label: "primary", value: "primary" },
            { label: "secondary", value: "secondary" },
          ],
        },
      },
    },
    align: {
      type: "radio",
      options: [
        { label: "left", value: "left" },
        { label: "center", value: "center" },
      ],
    },
    image: {
      type: "object",
      objectFields: {
        url: { type: "text" },
        mode: {
          type: "radio",
          options: [
            { label: "inline", value: "inline" },
            { label: "background", value: "background" },
          ],
        },
        overlayer: {
          type: "radio",
          options: [
            { label: "Show", value: true },
            { label: "Hide", value: false },
          ],
        },
        overlayerColor: {
          type: "text",
          label: "Over Layer Color",
        },
      },
    },
    padding: { type: "text" },
    bgColor: {
      label: "Background Color",
      type: "text",
    },
  },
  defaultProps: {
    title: {
      text: "Hero",
      color: "#000000",
      size: 64,
    },
    align: "left",
    description: {
      text: "Description",
      color: "#000000",
      size: 18,
    },
    buttons: [{ label: "Learn more", href: "#" }],
    padding: "64px",
  },
  render: ({ align, title, description, buttons, padding, image, bgColor }) => {
    return (
      <Section
        padding={padding}
        className={getClassName({
          left: align === "left",
          center: align === "center",
          hasImageBackground: image?.mode === "background",
        })}
        bgColor={bgColor}
      >
        {image?.mode === "background" && (
          <>
            <div
              className={getClassName("image")}
              style={{
                backgroundImage: `url("${image?.url}")`,
              }}
            ></div>

            {image?.overlayer && (
              <div
                className={getClassName("imageOverlay")}
                style={{
                  backgroundColor: image?.overlayerColor,
                }}
              ></div>
            )}
          </>
        )}

        <div className={getClassName("inner")}>
          <div className={getClassName("content")}>
            <h1
              className={image?.overlayer ? "" : getClassName("white")}
              style={{
                color: title.color,
                fontSize: title.size + "px",
                whiteSpace: "pre-line",
              }}
            >
              {title.text}
            </h1>
            <p
              className={
                image?.overlayer
                  ? getClassName("subtitle")
                  : getClassName("subtitle-white")
              }
              style={{
                color: description.color,
                fontSize: description.size + "px",
                whiteSpace: "pre-line",
              }}
            >
              {description.text}
            </p>
            <div className={getClassName("actions")}>
              {buttons.map((button, i) => (
                <Button
                  key={i}
                  href={button.href}
                  variant={button.variant}
                  size="large"
                >
                  {button.label}
                </Button>
              ))}
            </div>
          </div>

          {align !== "center" && image?.mode !== "background" && image?.url && (
            <div
              style={{
                backgroundImage: `url('${image?.url}')`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                borderRadius: 24,
                height: 356,
                marginLeft: "auto",
                width: "100%",
              }}
            />
          )}
        </div>
      </Section>
    );
  },
};

export default Hero;
