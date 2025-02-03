import React from "react";
import { Field } from "formik";
import Tippy, { tippy } from "@tippyjs/react";
import clsx from "clsx";

interface FieldWithLabelProps {
  name: string;
  label: string;
  tooltipContent?: string;
  isLightMode?: boolean;
  component: "input" | "textarea" | "select"; // Extend this as needed
  [x: string]: any; // This allows other props like className, rows, etc.
}

interface ComponentFieldWithLabelProps {
  name: string;
  label: string;
  component: React.FC<any>;
  tooltipContent?: string;
  isLightMode?: boolean;
  [x: string]: any; // This allows other props like className, rows, etc.
}

export const FieldWithLabel: React.FC<FieldWithLabelProps> = ({
  name,
  label,
  component,
  tooltipContent,
  isLightMode = false,
  ...rest
}) => (
  <div>
    {tooltipContent ? (
      <Tippy content={tooltipContent} placement="top">
        <label
          htmlFor={name}
          className={clsx("w-fit", {
            "text-black": isLightMode,
          })}
        >
          {label}
        </label>
      </Tippy>
    ) : (
      <label
        htmlFor={name}
        className={clsx("", {
          "text-black": isLightMode,
        })}
      >
        {label}
      </label>
    )}

    <div>
      <Field name={name} as={component} id={name} {...rest} />
    </div>
  </div>
);

export const ComponentFieldWithLabel: React.FC<
  ComponentFieldWithLabelProps
> = ({
  name,
  label,
  component,
  tooltipContent,
  isLightMode = false,
  ...rest
}) => (
  <div>
    {tooltipContent ? (
      <Tippy content={tooltipContent} placement="top">
        <label
          htmlFor={name}
          className={clsx("w-fit", {
            "text-black": isLightMode,
          })}
        >
          {label}
        </label>
      </Tippy>
    ) : (
      <label
        htmlFor={name}
        className={clsx("", {
          "text-black": isLightMode,
        })}
      >
        {label}
      </label>
    )}

    <div>
      <Field name={name} component={component} {...rest} />
    </div>
  </div>
);
