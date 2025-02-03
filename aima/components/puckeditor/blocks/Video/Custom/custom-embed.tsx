import { puckEditorDefaultStyles } from "@/components/puckeditor/utils/PuckRichTextEditor";

export interface CustomEmbedOptionsProps {
  code: string;
}

export const DefaultCustomEmbedOptions: CustomEmbedOptionsProps = {
  code: "",
};

export type CustomEmbedProps = {
  value: {
    customEmbedOptions: CustomEmbedOptionsProps;
  };
  onChange: (event: any) => void;
};

export const CustomEmbedOptions = ({ value, onChange }: CustomEmbedProps) => {
  const changeCode = (event: any) => {
    onChange({
      ...value,
      customEmbedOptions: {
        code: event.target.value,
      },
    });
  };

  return (
    <div className={"mt-4"}>
      <div className={"mb-2"}>
        <textarea
          style={puckEditorDefaultStyles}
          defaultValue={""}
          rows={5}
          value={value?.customEmbedOptions?.code || ""}
          onChange={changeCode}
          placeholder={"Custom Embed Code..."}
        />
      </div>
    </div>
  );
};
