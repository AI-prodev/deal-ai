/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ComponentConfig } from "@measured/puck";
import styles from "./styles.module.css";
import Section from "../Section";
import getClassNameFactory from "../../get-classname-factory";

const getClassName = getClassNameFactory("Logos", styles);

export type LogosProps = {
  logos: {
    alt: string;
    imageUrl: string;
  }[];
  bgColor?: string;
};

const Logos: ComponentConfig<LogosProps> = {
  fields: {
    logos: {
      type: "array",
      getItemSummary: (item, i) => item.alt || `Feature #${i}`,
      defaultItemProps: {
        alt: "",
        imageUrl: "",
      },
      arrayFields: {
        alt: { type: "text" },
        imageUrl: { type: "text" },
      },
    },
    bgColor: {
      label: "Background Color",
      type: "text",
    },
  },
  defaultProps: {
    logos: [
      {
        alt: "google",
        imageUrl:
          "https://logolook.net/wp-content/uploads/2021/06/Google-Logo.png",
      },
      {
        alt: "google",
        imageUrl:
          "https://logolook.net/wp-content/uploads/2021/06/Google-Logo.png",
      },
      {
        alt: "google",
        imageUrl:
          "https://logolook.net/wp-content/uploads/2021/06/Google-Logo.png",
      },
      {
        alt: "google",
        imageUrl:
          "https://logolook.net/wp-content/uploads/2021/06/Google-Logo.png",
      },
      {
        alt: "google",
        imageUrl:
          "https://logolook.net/wp-content/uploads/2021/06/Google-Logo.png",
      },
    ],
  },
  render: ({ logos, bgColor }) => {
    return (
      <Section className={getClassName()} bgColor={bgColor}>
        <div className={getClassName("items")}>
          {logos.map((item, i) => (
            <div key={i} className={getClassName("item")}>
              <img
                className={getClassName("image")}
                alt={item.alt}
                src={item.imageUrl}
                height={64}
              ></img>
            </div>
          ))}
        </div>
      </Section>
    );
  },
};

export default Logos;
