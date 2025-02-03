import { CSSProperties, ReactNode } from "react";
import styles from "./styles.module.css";
import getClassNameFactory from "../../get-classname-factory";

const getClassName = getClassNameFactory("Section", styles);

export type SectionProps = {
  className?: string;
  children: ReactNode;
  padding?: string;
  maxWidth?: string;
  style?: CSSProperties;
  bgColor?: string;
};

const Section = ({
  children,
  className,
  padding = "0px",
  maxWidth = "1280px",
  style = {},
  bgColor,
}: SectionProps) => {
  return (
    <div
      className={`${getClassName()}${className ? ` ${className}` : ""}`}
      style={{
        paddingTop: padding,
        paddingBottom: padding,
        backgroundColor: bgColor,
        ...style,
      }}
    >
      <div className={getClassName("inner")} style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
};

export default Section;
