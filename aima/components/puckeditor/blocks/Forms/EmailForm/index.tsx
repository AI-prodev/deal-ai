import getClassNameFactory from "../../../get-classname-factory";
import styles from "./styles.module.css";
import {
  ButtonProps,
  PUCKEDITOR_BUTTON_CONFIG,
} from "@/components/puckeditor/blocks/Button/constants";
import { CSSProperties } from "react";
import hex2rgba from "@/components/puckeditor/utils/hex2rgba";
import {
  PUCKEDITOR_BACKGROUND_FIELDS,
  PUCKEDITOR_BORDER_FIELDS,
  PUCKEDITOR_BOX_SHADOW_FIELDS,
  PUCKEDITOR_SPACING_FIELDS,
  PUCKEDITOR_WIDTH_FIELDS,
  BackgroundFieldsProps,
  SpacingProps,
  BoxShadowFieldsProps,
  BorderFieldsProps,
  WidthFieldsProps,
  PUCKEDITOR_FONT_FIELDS,
  FontStyleProps,
  PUCKEDITOR_COLOR_FIELDS,
  ColorFieldsProps,
} from "@/components/puckeditor/blocks/constants";
import {
  PUCKEDITOR_TEXT_CONFIG,
  PuckEditorTextProps,
} from "@/components/puckeditor/blocks/Typography/constants";
import PuckSlider from "@/components/puckeditor/utils/slider/Slider";
import * as React from "react";
import clsx from "clsx";
import AddInput from "@/components/puckeditor/blocks/Forms/EmailForm/AddInput";
import ShippingForm from "@/components/puckeditor/blocks/Forms/EmailForm/ShippingForm";

const getClassName = getClassNameFactory("EmailForm", styles);

export type EmailFormProps = {
  title: {
    title: string;
    fontSize: number;
    spacings: SpacingProps;
    backgroundColor: BackgroundFieldsProps;
  } & FontStyleProps &
    PuckEditorTextProps;
  inputs: {
    phoneNumber: boolean;
    address: boolean;
    shippingAddress: boolean;
    fontSize: number;
    spacings: SpacingProps;
  } & FontStyleProps &
    ColorFieldsProps;
  button: ButtonProps;
  form: {
    spacings: SpacingProps;
    backgroundColor: BackgroundFieldsProps;
    border: BorderFieldsProps;
  } & BoxShadowFieldsProps &
    WidthFieldsProps;
};

// TODO: Add field types
const EmailForm: any = {
  fields: {
    inputs: {
      type: "object",
      label: "Inputs",
      objectFields: {
        phoneNumber: {
          label: "Phone Number",
          type: "custom",
          render: (props: any) => <AddInput {...props} />,
        },
        address: {
          label: "Address",
          type: "custom",
          render: (props: any) => <AddInput {...props} />,
        },
        shippingAddress: {
          label: "Shipping Address",
          type: "custom",
          render: (props: any) => <AddInput {...props} />,
        },
        ...PUCKEDITOR_FONT_FIELDS.fields,
        ...PUCKEDITOR_SPACING_FIELDS.fields,
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
              defaultValue={20}
            />
          ),
        },
        color: PUCKEDITOR_COLOR_FIELDS.fields!.color,
      },
    },
    title: {
      type: "object",
      label: "Title",
      objectFields: {
        title: {
          type: "text",
          label: "Title",
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
              defaultValue={20}
            />
          ),
        },
        ...PUCKEDITOR_FONT_FIELDS.fields,
        ...PUCKEDITOR_TEXT_CONFIG.fields,
      },
    },
    form: {
      type: "object",
      label: "Form",
      objectFields: {
        ...PUCKEDITOR_BACKGROUND_FIELDS.fields,
        ...PUCKEDITOR_BORDER_FIELDS.fields,
        ...PUCKEDITOR_BOX_SHADOW_FIELDS.fields,
        ...PUCKEDITOR_WIDTH_FIELDS.fields,
        ...PUCKEDITOR_SPACING_FIELDS.fields,
      },
    },
    button: {
      type: "object",
      label: "Button",
      objectFields: {
        ...PUCKEDITOR_BUTTON_CONFIG.fields,
      },
    },
  },
  defaultProps: {
    title: {
      title: "Contact Us",
      fontFamily: PUCKEDITOR_FONT_FIELDS.defaultProps!.fontFamily,
      italic: PUCKEDITOR_FONT_FIELDS.defaultProps!.italic,
      bold: PUCKEDITOR_FONT_FIELDS.defaultProps!.bold,
      underline: PUCKEDITOR_FONT_FIELDS.defaultProps!.underline,
      textAlign: PUCKEDITOR_TEXT_CONFIG.defaultProps!.textAlign,
      color: PUCKEDITOR_TEXT_CONFIG.defaultProps!.color,
      fontSize: 20,
      spacings: {
        ...PUCKEDITOR_SPACING_FIELDS.defaultProps!.spacings,
        paddingLeft: 12,
        paddingTop: 6,
        paddingBottom: 6,
        paddingRight: 12,
      },
      backgroundColor:
        PUCKEDITOR_BACKGROUND_FIELDS.defaultProps!.backgroundColor,
      width: 50,
    },
    inputs: {
      phoneNumber: false,
      address: false,
      shippingAddress: false,
      fontSize: 20,
      color: PUCKEDITOR_COLOR_FIELDS.defaultProps!.color,
      fontFamily: "Arial",
      italic: false,
      bold: false,
      underline: false,
      spacings: PUCKEDITOR_SPACING_FIELDS.defaultProps!.spacings,
    },
    form: {
      spacings: {
        ...PUCKEDITOR_SPACING_FIELDS.defaultProps!.spacings,
        paddingLeft: 20,
        paddingTop: 20,
        paddingBottom: 20,
        paddingRight: 20,
      },
      width: 50,
      backgroundColor:
        PUCKEDITOR_BACKGROUND_FIELDS.defaultProps!.backgroundColor,
      border: PUCKEDITOR_BORDER_FIELDS.defaultProps!.border,
      boxShadow: "",
    },
    button: {
      ...PUCKEDITOR_BUTTON_CONFIG.defaultProps,
      label: "Submit",
      spacings: {
        ...PUCKEDITOR_SPACING_FIELDS.defaultProps!.spacings,
        marginTop: 20,
        paddingTop: 10,
        paddingBottom: 10,
        paddingRight: 25,
        paddingLeft: 25,
      },
      width: 50,
    },
  },
  render: ({ inputs, button, form, title }: any) => {
    const buttonStyles: CSSProperties = {
      width: `${button?.width}%`,
      color: button?.color,
      fontSize: button?.fontSize,
      border: `${button?.border?.width}px solid ${button?.border?.color}`,
      boxShadow: button?.boxShadow ?? "",
      borderRadius: button?.border?.radius ?? 6,
      marginTop: button?.spacings?.marginTop ?? 0,
      marginBottom: button?.spacings?.marginBottom ?? 0,
      paddingTop: button?.spacings?.paddingTop ?? 10,
      paddingBottom: button?.spacings?.paddingBottom ?? 10,
      paddingLeft: button?.spacings?.paddingLeft ?? 25,
      paddingRight: button?.spacings?.paddingRight ?? 25,
      fontFamily: button?.fontFamily ?? "Arial",
      ...(button?.bold && { fontWeight: "bold" }),
      ...(button?.italic && { fontStyle: "italic" }),
      ...(button?.underline && { textDecoration: "underline" }),
    };

    if (
      button?.backgroundColor &&
      button?.backgroundColor?.color === "transparent"
    ) {
      delete buttonStyles.backgroundColor;
    } else if (button?.backgroundColor?.color) {
      buttonStyles.backgroundColor = hex2rgba({
        hex: button?.backgroundColor?.color,
        backgroundOpacity: button?.backgroundColor?.opacity,
      });
    }

    const formStyles: CSSProperties = {
      width: `${form?.width}%`,
      marginTop: form?.spacings?.marginTop ?? 0,
      marginBottom: form?.spacings?.marginBottom ?? 0,
      paddingTop: form?.spacings?.paddingTop ?? 0,
      paddingBottom: form?.spacings?.paddingBottom ?? 0,
      paddingLeft: form?.spacings?.paddingLeft ?? 0,
      paddingRight: form?.spacings?.paddingRight ?? 0,
      border: `${form?.border?.width}px solid ${form?.border?.color}`,
      boxShadow: form?.boxShadow ?? "",
      borderRadius: form?.border?.radius ?? 0,
    };

    if (
      form?.backgroundColor &&
      form?.backgroundColor?.color === "transparent"
    ) {
      delete formStyles.backgroundColor;
    } else if (form?.backgroundColor?.color) {
      formStyles.backgroundColor = hex2rgba({
        hex: form?.backgroundColor?.color,
        backgroundOpacity: form?.backgroundColor?.opacity,
      });
    }

    const titleStyles: CSSProperties = {
      fontSize: title?.fontSize,
      color: title?.color,
      fontFamily: title?.fontFamily ?? "Arial",
      ...(title?.bold && { fontWeight: "bold" }),
      ...(title?.italic && { fontStyle: "italic" }),
      ...(title?.underline && { textDecoration: "underline" }),
      marginTop: title?.spacings?.marginTop ?? 0,
      marginBottom: title?.spacings?.marginBottom ?? 0,
      paddingTop: title?.spacings?.paddingTop ?? 0,
      paddingBottom: title?.spacings?.paddingBottom ?? 0,
      paddingLeft: title?.spacings?.paddingLeft ?? 0,
      paddingRight: title?.spacings?.paddingRight ?? 0,
    };

    if (
      title?.backgroundColor &&
      title?.backgroundColor?.color === "transparent"
    ) {
      delete titleStyles.backgroundColor;
    } else if (title?.backgroundColor?.color) {
      titleStyles.backgroundColor = hex2rgba({
        hex: title?.backgroundColor?.color,
        backgroundOpacity: title?.backgroundColor?.opacity,
      });
    }

    const shippingFormStyles: CSSProperties = {
      fontSize: inputs?.fontSize,
      color: inputs?.color,
      fontFamily: inputs?.fontFamily ?? "Arial",
      ...(inputs?.bold && { fontWeight: "bold" }),
      ...(inputs?.italic && { fontStyle: "italic" }),
      ...(inputs?.underline && { textDecoration: "underline" }),
      marginTop: inputs?.spacings?.marginTop ?? 0,
      marginBottom: inputs?.spacings?.marginBottom ?? 0,
      paddingTop: inputs?.spacings?.paddingTop ?? 0,
      paddingBottom: inputs?.spacings?.paddingBottom ?? 0,
      paddingLeft: inputs?.spacings?.paddingLeft ?? 0,
      paddingRight: inputs?.spacings?.paddingRight ?? 0,
    };

    return (
      <form id="emailForm" className={getClassName()} style={formStyles}>
        {title?.title && (
          <h3
            className={clsx("", {
              [getClassName(`title-${title?.textAlign}`)]: getClassName(
                `title-${title?.textAlign}`
              ),
            })}
            style={titleStyles}
          >
            {title?.title}
          </h3>
        )}
        <input
          name="emailFormFullName"
          className={`form-input ${getClassName("input")}`}
          required
          placeholder="Full Name..."
        />
        <input
          name="emailFormEmail"
          className={`form-input ${getClassName("input")}`}
          required
          type="email"
          inputMode="email"
          placeholder="Email Address..."
        />
        {inputs?.phoneNumber && (
          <input
            name="emailFormPhoneNumber"
            className={`form-input ${getClassName("input")}`}
            required
            inputMode="numeric"
            placeholder="Phone Number..."
          />
        )}
        {inputs?.address && (
          <ShippingForm
            title="Address"
            type="address"
            titleStyle={shippingFormStyles}
          />
        )}
        {inputs?.shippingAddress && (
          <ShippingForm
            title="Shipping Address"
            type="shippingAddress"
            titleStyle={shippingFormStyles}
          />
        )}
        <button
          type="submit"
          className={getClassName("button")}
          style={buttonStyles}
        >
          {button?.label}
        </button>
      </form>
    );
  },
};

export default EmailForm;
