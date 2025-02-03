import { FormControlLabel, Switch } from "@mui/material";
import { puckEditorDefaultStyles } from "@/components/puckeditor/utils/PuckRichTextEditor";

export type YoutubeOptionsProps = {
  url: string | undefined;
  autoplay: boolean;
  fullScreen: boolean;
  controls: boolean;
};

type KeysOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];
type BooleanKeys = KeysOfType<YoutubeOptionsProps, boolean>;

export const DefaultYoutubeOptions: YoutubeOptionsProps = {
  url: "",
  autoplay: false,
  fullScreen: true,
  controls: true,
};

export type YoutubeProps = {
  value: {
    youtubeOptions: YoutubeOptionsProps;
  };
  onChange: (event: any) => void;
};

export const YoutubeOptions = ({ value, onChange }: YoutubeProps) => {
  const changeUrl = (event: any): void => {
    onChange({
      ...value,
      youtubeOptions: {
        url: event.target.value,
      },
    });
  };

  const handleChange = (checked: boolean, name: BooleanKeys): void => {
    onChange({
      ...value,
      youtubeOptions: {
        ...value.youtubeOptions,
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
          value={value?.youtubeOptions?.url || ""}
          onChange={changeUrl}
          placeholder={"Youtube URL..."}
        />
      </div>
      <div className={"mb-2"}>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Autoplay"
          labelPlacement={"end"}
          checked={
            value?.youtubeOptions?.autoplay === undefined
              ? false
              : value?.youtubeOptions?.autoplay
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
            value?.youtubeOptions?.fullScreen === undefined
              ? true
              : value?.youtubeOptions?.fullScreen
          }
          onChange={(_, checked) => handleChange(checked, "fullScreen")}
        />
      </div>
      <div className={"mb-2"}>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Controls"
          labelPlacement={"end"}
          checked={
            value?.youtubeOptions?.controls === undefined
              ? true
              : value?.youtubeOptions?.controls
          }
          onChange={(_, checked) => handleChange(checked, "controls")}
        />
      </div>
    </div>
  );
};
