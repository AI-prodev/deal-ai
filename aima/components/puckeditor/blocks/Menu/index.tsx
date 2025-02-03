import { ComponentConfig, Fields } from "@measured/puck";
import PuckSlider from "@/components/puckeditor/utils/slider/Slider";
import {
  BackgroundFieldsProps,
  ColorFieldsProps,
  SpacingProps,
  PUCKEDITOR_BACKGROUND_FIELDS,
  PUCKEDITOR_COLOR_FIELDS,
  PUCKEDITOR_SPACING_FIELDS,
} from "@/components/puckeditor/blocks/constants";
import React from "react";
import PuckImageUpload from "@/components/puckeditor/utils/UploadImage/PuckUploadImage";
import { FontFamilyList } from "@/components/puckeditor/constants/font-family";
import MenuRender from "@/components/puckeditor/blocks/Menu/MenuRender";

export type MenuProps = {
  logo?: {
    url: string;
  };
  spacings: SpacingProps;
  backgroundColor: BackgroundFieldsProps;
  logoSize?: number;
  fontFamily: string;
  items?: any[];
  labelText?: string;
} & ColorFieldsProps;

const fields: Fields<Omit<MenuProps, "items">> = {
  labelText: {
    label: "Label",
    type: "custom",
    render: () => (
      <div>The pages in this menu are configured on the website dashboard.</div>
    ),
  },
  logo: {
    type: "custom",
    label: "Logo URL",
    render: (props: any) => <PuckImageUpload {...props} />,
  },
  logoSize: {
    label: "Logo Size",
    type: "custom",
    render: ({ value, name, onChange, field }) => (
      <PuckSlider
        value={value}
        name={name}
        onChange={onChange}
        label={`${field?.label} ${value}`}
        min={50}
        max={150}
      />
    ),
  },
  fontFamily: {
    label: "Font Family",
    type: "select",
    options: FontFamilyList,
  },
  backgroundColor: PUCKEDITOR_BACKGROUND_FIELDS.fields!.backgroundColor,
  color: PUCKEDITOR_COLOR_FIELDS.fields!.color,
  spacings: PUCKEDITOR_SPACING_FIELDS.fields!.spacings,
};

const Menu: ComponentConfig<MenuProps> = {
  fields,
  defaultProps: {
    logo: {
      url: "https://d210f0zr81wwm8.cloudfront.net/6618fca1ea4cc37ae0ca4786_a67920fe-76e8-4ce5-96de-d2042ca561ba_pngtree-website-url-rgb-color-icon-url-logo-line-vector-png-image_12735502.png",
    },
    logoSize: 50,
    fontFamily: "Arial",
    spacings: {
      ...PUCKEDITOR_SPACING_FIELDS.defaultProps!.spacings,
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 30,
      paddingRight: 30,
    },
    backgroundColor: PUCKEDITOR_BACKGROUND_FIELDS.defaultProps!.backgroundColor,
    color: PUCKEDITOR_COLOR_FIELDS.defaultProps!.color,
  },
  render: (props: MenuProps) => <MenuRender {...props} />,
};

export default Menu;
