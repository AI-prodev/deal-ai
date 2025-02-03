import * as React from "react";
import PuckImageUpload from "@/components/puckeditor/utils/UploadImage/PuckUploadImage";
import dynamic from "next/dynamic";
import { FontFamilyList } from "@/components/puckeditor/constants/font-family";
import PuckAccordion from "@/components/puckeditor/utils/PuckAccordion";
import PuckSlider from "@/components/puckeditor/utils/slider/Slider";
import PuckColourPicker from "@/components/puckeditor/utils/slider/ColourPicker";
import { ComponentConfig } from "@measured/puck";
import PuckSelect from "@/components/puckeditor/utils/PuckSelect";
import {
  BACKGROUND_IMAGE_ATTACHMENTS,
  BACKGROUND_IMAGE_POSITIONS,
  BACKGROUND_IMAGE_REPEATS,
  BACKGROUND_IMAGE_SIZES,
} from "@/components/puckeditor/constants/backgroundImage";

const PuckShadowPicker = dynamic(
  () => import("@/components/puckeditor/utils/slider/ShadowPicker"),
  {
    ssr: false,
  }
);

export type SpacingProps = {
  marginTop: number;
  marginBottom: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
};

export type PuckEditorSpacingProps = Omit<
  ComponentConfig<{ spacings: SpacingProps }>,
  "render"
>;

export const MAX_SPACING = 200;
const MARGIN_FIELDS = [
  {
    id: 1,
    name: "marginTop",
    label: "Margin Top",
  },
  {
    id: 2,
    name: "marginBottom",
    label: "Margin Bottom",
  },
];

export const SPACING_FIELDS = [
  ...MARGIN_FIELDS,
  {
    id: 3,
    name: "paddingTop",
    label: "Padding Top",
  },
  {
    id: 4,
    name: "paddingBottom",
    label: "Padding Bottom",
  },
  {
    id: 5,
    name: "paddingLeft",
    label: "Padding Left",
  },
  {
    id: 6,
    name: "paddingRight",
    label: "Padding Right",
  },
];

export const PUCKEDITOR_SPACING_FIELDS: PuckEditorSpacingProps = {
  fields: {
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
  defaultProps: {
    spacings: {
      marginTop: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
};

export type MarginProps = {
  marginTop: number;
  marginBottom: number;
};

export type PuckEditorMarginProps = Omit<
  ComponentConfig<{ spacings: MarginProps }>,
  "render"
>;

export const PUCKEDITOR_MARGIN_FIELDS: PuckEditorMarginProps = {
  fields: {
    spacings: {
      type: "custom",
      label: "Spacings",
      render: ({ value, onChange, field }) => (
        <PuckAccordion label={field?.label}>
          {MARGIN_FIELDS?.map(field => (
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
  defaultProps: {
    spacings: {
      marginTop: 0,
      marginBottom: 0,
    },
  },
};

export type BackgroundFieldsProps = {
  color: string;
  opacity: number;
};

export type PuckEditorBackgroundProps = Omit<
  ComponentConfig<{ backgroundColor: BackgroundFieldsProps }>,
  "render"
>;

export const PUCKEDITOR_BACKGROUND_FIELDS: PuckEditorBackgroundProps = {
  fields: {
    backgroundColor: {
      type: "custom",
      label: "Background Color",
      render: ({ value, onChange, field }) => (
        <PuckAccordion label={field?.label}>
          <PuckColourPicker value={value} name="color" onChange={onChange} />
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
  },
  defaultProps: {
    backgroundColor: {
      color: "transparent",
      opacity: 100,
    },
  },
};

export type ColorFieldsProps = {
  color: string;
};

export type PuckEditorColorProps = Omit<
  ComponentConfig<ColorFieldsProps>,
  "render"
>;

export const PUCKEDITOR_COLOR_FIELDS: PuckEditorColorProps = {
  fields: {
    color: {
      type: "custom",
      label: "Color",
      render: ({ value, onChange, field }) => (
        <PuckAccordion label={field?.label}>
          <PuckColourPicker value={value} name="color" onChange={onChange} />
        </PuckAccordion>
      ),
    },
  },
  defaultProps: {
    color: "#000000",
  },
};

export type LineHeightFieldsProps = {
  lineHeight: string;
};

export type PuckEditorLineHeightProps = Omit<
  ComponentConfig<LineHeightFieldsProps>,
  "render"
>;

export const PUCKEDITOR_LINE_HEIGHT_FIELDS: PuckEditorLineHeightProps = {
  fields: {
    lineHeight: {
      type: "text",
      label: "Line Height",
    },
  },
};

export type UploadImageFieldsProps = {
  image: {
    url: string;
  };
};

export type PuckEditorUploadImageProps = Omit<
  ComponentConfig<UploadImageFieldsProps>,
  "render"
>;

export const PUCKEDITOR_UPLOAD_IMAGE_FIELDS: PuckEditorUploadImageProps = {
  fields: {
    image: {
      type: "custom",
      label: "Upload Image",
      render: props => <PuckImageUpload {...props} />,
    },
  },
};

export type BackgroundImageFieldsProps = {
  backgroundImage: {
    url: string;
    position: string;
    attachment: string;
    size: string;
    repeat: string;
  };
};

export type PuckEditorBackgroundImageProps = Omit<
  ComponentConfig<BackgroundImageFieldsProps>,
  "render"
>;

export const PUCKEDITOR_BACKGROUND_IMAGE_FIELDS: PuckEditorBackgroundImageProps =
  {
    fields: {
      backgroundImage: {
        type: "custom",
        label: "Background Image",
        render: ({ value, onChange, field }) => (
          <PuckAccordion label={field?.label}>
            <PuckImageUpload onChange={onChange} value={value} />
            <div className="mt-5">
              <PuckSelect
                label="Position"
                options={BACKGROUND_IMAGE_POSITIONS}
                value={value}
                onChange={onChange}
                name="position"
              />
              <PuckSelect
                label="Attachment"
                options={BACKGROUND_IMAGE_ATTACHMENTS}
                value={value}
                onChange={onChange}
                name="attachment"
              />
              <PuckSelect
                label="Size"
                options={BACKGROUND_IMAGE_SIZES}
                value={value}
                onChange={onChange}
                name="size"
              />
              <PuckSelect
                label="Repeat"
                options={BACKGROUND_IMAGE_REPEATS}
                value={value}
                onChange={onChange}
                name="repeat"
              />
            </div>
          </PuckAccordion>
        ),
      },
    },
    defaultProps: {
      backgroundImage: {
        url: "",
        position: "center center",
        attachment: "scroll",
        size: "cover",
        repeat: "no-repeat",
      },
    },
  };

export type BorderFieldsProps = {
  color: string;
  width: number;
  radius: number;
};

export type PuckEditorBorderProps = Omit<
  ComponentConfig<{ border: BorderFieldsProps }>,
  "render"
>;

export const PUCKEDITOR_BORDER_FIELDS: PuckEditorBorderProps = {
  fields: {
    border: {
      type: "custom",
      label: "Border",
      render: ({ value, onChange, field }) => (
        <PuckAccordion label={field?.label}>
          <PuckColourPicker value={value} name="color" onChange={onChange} />
          <PuckSlider
            value={value}
            name="width"
            onChange={onChange}
            label={`Border Width ${value?.width ?? 0}`}
            max={100}
            defaultValue={0}
          />
          <PuckSlider
            value={value}
            name={"radius"}
            onChange={onChange}
            label={`Border Radius ${value?.radius ?? 0}`}
            max={100}
            defaultValue={0}
          />
        </PuckAccordion>
      ),
    },
  },
  defaultProps: {
    border: {
      color: "transparent",
      width: 0,
      radius: 0,
    },
  },
};

export type BorderRadiusFieldsProps = {
  borderRadius: number;
};

export type PuckEditorBorderRadiusProps = Omit<
  ComponentConfig<BorderRadiusFieldsProps>,
  "render"
>;

export const PUCKEDITOR_BORDER_RADIUS_FIELDS: PuckEditorBorderRadiusProps = {
  fields: {
    borderRadius: {
      type: "custom",
      label: "Border Radius",
      render: ({ value, name, onChange, field }) => (
        <PuckSlider
          value={value}
          name={name}
          onChange={onChange}
          label={`${field?.label} ${value ?? 0}`}
          max={100}
          defaultValue={0}
        />
      ),
    },
  },
  defaultProps: {
    borderRadius: 0,
  },
};

export type AlignFieldsProps = {
  align: "left" | "center" | "right";
};

export type PuckEditorAlignProps = Omit<
  ComponentConfig<AlignFieldsProps>,
  "render"
>;

export const PUCKEDITOR_ALIGN_FIELDS: PuckEditorAlignProps = {
  fields: {
    align: {
      type: "radio",
      label: "Align",
      options: [
        { label: "left", value: "left" },
        { label: "center", value: "center" },
        { label: "right", value: "right" },
      ],
    },
  },
  defaultProps: {
    align: "center",
  },
};

export type BoxShadowFieldsProps = {
  boxShadow: string;
};

export type PuckEditorBoxShadowProps = Omit<
  ComponentConfig<BoxShadowFieldsProps>,
  "render"
>;

export const PUCKEDITOR_BOX_SHADOW_FIELDS: PuckEditorBoxShadowProps = {
  fields: {
    boxShadow: {
      type: "custom",
      label: "Box Shadow",
      render: (props: any) => (
        <PuckAccordion label={props?.field?.label}>
          <PuckShadowPicker {...props} />
        </PuckAccordion>
      ),
    },
  },
  defaultProps: {
    boxShadow: "",
  },
};

export type WidthFieldsProps = {
  width: number;
};

export type PuckEditorWidthProps = Omit<
  ComponentConfig<WidthFieldsProps>,
  "render"
>;

export const PUCKEDITOR_WIDTH_FIELDS: PuckEditorWidthProps = {
  fields: {
    width: {
      type: "custom",
      label: "Width",
      render: ({ value, name, onChange, field }) => (
        <PuckSlider
          value={value}
          name={name}
          onChange={onChange}
          label={`${field?.label} ${value}`}
          max={100}
          defaultValue={100}
        />
      ),
    },
  },
  defaultProps: {
    width: 100,
  },
};

export type FontSizeProps = {
  fontSize: number;
};

export const PUCKEDITOR_FONT_SIZE_FIELDS: Omit<
  ComponentConfig<FontSizeProps>,
  "render"
> = {
  fields: {
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
        />
      ),
    },
  },
  defaultProps: {
    fontSize: 20,
  },
};

export type FontStyleProps = {
  fontFamily: string;
  italic: boolean;
  bold: boolean;
  underline: boolean;
};

export const PUCKEDITOR_FONT_FIELDS: Omit<
  ComponentConfig<FontStyleProps>,
  "render"
> = {
  fields: {
    fontFamily: {
      label: "Font Family",
      type: "select",
      options: FontFamilyList,
    },
    italic: {
      label: "Italic",
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    bold: {
      label: "Bold",
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    underline: {
      label: "Underline",
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
  },
  defaultProps: {
    fontFamily: "Arial",
    italic: false,
    bold: false,
    underline: false,
  },
};
