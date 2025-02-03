import * as React from "react";
import getClassNameFactory from "@/components/puckeditor/get-classname-factory";
import styles from "./styles.module.css";
import { CSSProperties, FC } from "react";
const getClassName = getClassNameFactory("EmailForm", styles);

interface IShippingFormProps {
  title: string;
  titleStyle: CSSProperties;
  type: "address" | "shippingAddress";
}

const ShippingForm: FC<IShippingFormProps> = ({ title, titleStyle, type }) => {
  return (
    <div style={{ width: "100%", marginTop: "16px" }}>
      <h4 style={titleStyle}>{title}</h4>
      <input
        name={`${type}FullName`}
        className={`form-input ${getClassName("input")}`}
        required
        placeholder="Full Name..."
      />
      <div>
        <input
          name={`${type}Street`}
          className={`form-input ${getClassName("input")}`}
          required
          placeholder="Street..."
        />
        <input
          name={`${type}Apartment`}
          className={`form-input ${getClassName("input")}`}
          required
          placeholder="Apartment/Suite..."
        />
      </div>
      <div>
        <input
          name={`${type}City`}
          className={`form-input ${getClassName("input")}`}
          required
          inputMode="numeric"
          placeholder="City..."
        />
        <input
          name={`${type}State`}
          className={`form-input ${getClassName("input")}`}
          required
          placeholder="State..."
        />
        <input
          name={`${type}Country`}
          className={`form-input ${getClassName("input")}`}
          required
          placeholder="Country..."
        />
        <input
          name={`${type}ZipCode`}
          className={`form-input ${getClassName("input")}`}
          required
          placeholder="ZIP/PIN Code..."
        />
      </div>
    </div>
  );
};

export default ShippingForm;
