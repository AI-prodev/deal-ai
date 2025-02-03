import styles from "./styles.module.css";
import getClassNameFactory from "@/components/puckeditor/get-classname-factory";
import {
  BackgroundFieldsProps,
  ColorFieldsProps,
  SpacingProps,
} from "@/components/puckeditor/blocks/constants";
import React, { CSSProperties, useEffect, useState } from "react";
import hex2rgba from "@/components/puckeditor/utils/hex2rgba";
import { getMenuItems } from "@/components/puckeditor/generate-html";

const getClassName = getClassNameFactory("Menu", styles);

export type MenuProps = {
  logo?: {
    url: string;
  };
  spacings: SpacingProps;
  backgroundColor: BackgroundFieldsProps;
  logoSize?: number;
  fontFamily: string;
  labelText?: string;
} & ColorFieldsProps;

const MenuRender = (props: MenuProps) => {
  const [menuItems, setMenuItems] = useState([]);
  const { backgroundColor, color } = props;

  useEffect(() => {
    getMenuItems().then(res => setMenuItems(res));
  }, []);

  const styles: CSSProperties = {
    marginTop: props?.spacings?.marginTop ?? 0,
    marginBottom: props?.spacings?.marginBottom ?? 0,
    paddingTop: props?.spacings?.paddingTop ?? 10,
    paddingBottom: props?.spacings?.paddingBottom ?? 10,
    paddingLeft: props?.spacings?.paddingLeft ?? 30,
    paddingRight: props?.spacings?.paddingRight ?? 30,
    fontFamily: props.fontFamily ?? "Arial",
  };

  if (backgroundColor && backgroundColor?.color === "transparent") {
    styles.backgroundColor = "transparent";
  } else if (backgroundColor?.color) {
    styles.backgroundColor = hex2rgba({
      hex: backgroundColor?.color,
      backgroundOpacity: backgroundColor?.opacity,
    });
  }
  const logoUrl = props.logo?.url;

  return (
    <div className={getClassName()} style={styles}>
      <ul>
        {logoUrl && (
          <img
            src={logoUrl}
            alt="logo"
            width={props.logoSize ?? 50}
            height={props.logoSize ?? 50}
          />
        )}
      </ul>
      <label htmlFor="menu" tabIndex={0}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
          className="w-6 h-6"
          width={50}
          height={50}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </label>
      <input id="menu" type="checkbox" />
      <ul id="menu-items" style={{ color, textDecoration: "none" }}>
        {menuItems?.length > 0 &&
          menuItems?.map((it: any, idx: number) => (
            <li key={idx}>
              <a href={it?.path} style={{ color }}>
                {it?.title}
              </a>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default MenuRender;
