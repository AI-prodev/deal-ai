import { puckEditorDefaultStyles } from "@/components/puckeditor/utils/PuckRichTextEditor";
import { FormControlLabel, Switch } from "@mui/material";

export type VimeoOptionsProps = {
  url: string | undefined;
  autoplay: boolean;
  fullScreen: boolean;
  loop: boolean;
};

type KeysOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];
type BooleanKeys = KeysOfType<VimeoOptionsProps, boolean>;

export const DefaultVimeoOptions: VimeoOptionsProps = {
  url: "",
  autoplay: false,
  fullScreen: true,
  loop: false,
};

export type VimeoProps = {
  value: {
    vimeoOptions: VimeoOptionsProps;
  };
  onChange: (event: any) => void;
};

export const VimeoOptions = ({ value, onChange }: VimeoProps) => {
  const changeUrl = (event: any): void => {
    onChange({
      ...value,
      vimeoOptions: {
        url: event.target.value,
      },
    });
  };

  const handleChange = (checked: boolean, name: BooleanKeys): void => {
    onChange({
      ...value,
      vimeoOptions: {
        ...value.vimeoOptions,
        [name]: checked,
      },
    });
  };

  return (
    <div className={"mt-4"}>
      <div className={"mb-2"}>
        <input
          style={puckEditorDefaultStyles}
          defaultValue={""}
          value={value?.vimeoOptions?.url || ""}
          onChange={changeUrl}
          placeholder={"Vimeo URL..."}
        />
      </div>
      <div className={"mb-2"}>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Autoplay"
          labelPlacement={"end"}
          checked={
            value?.vimeoOptions?.autoplay === undefined
              ? false
              : value?.vimeoOptions?.autoplay
          }
          onChange={(_, checked) => handleChange(checked, "autoplay")}
        />
      </div>
      <div className={"mb-2"}>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Allow Fullscreen"
          labelPlacement={"end"}
          checked={
            value?.vimeoOptions?.fullScreen === undefined
              ? true
              : value?.vimeoOptions?.fullScreen
          }
          onChange={(_, checked) => handleChange(checked, "fullScreen")}
        />
      </div>
      <div className={"mb-2"}>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Loop Video"
          labelPlacement={"end"}
          checked={
            value?.vimeoOptions?.loop === undefined
              ? false
              : value?.vimeoOptions?.loop
          }
          onChange={(_, checked) => handleChange(checked, "loop")}
        />
      </div>
    </div>
  );
};
