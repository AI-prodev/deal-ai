import { FieldLabel } from "@measured/puck";
import Select from "react-select";
import { VideoEnum } from "@/components/puckeditor/blocks/Video/index";
import {
  DefaultYoutubeOptions,
  YoutubeOptions,
} from "@/components/puckeditor/blocks/Video/Youtube/youtube";
import {
  DefaultVimeoOptions,
  VimeoOptions,
} from "@/components/puckeditor/blocks/Video/Vimeo/vimeo";
import {
  CustomEmbedOptions,
  DefaultCustomEmbedOptions,
} from "@/components/puckeditor/blocks/Video/Custom/custom-embed";

interface VideoSelectProps {
  value: any;
  onChange: (value: any) => void;
}

export const VideoSelect = ({ value, onChange }: VideoSelectProps) => {
  const changeVideoType = (event: any): void => {
    onChange({
      ...value,
      videoType: event,
    });
  };

  if (!value) {
    onChange({
      videoType: VideoEnum.youtube,
      youtubeOptions: DefaultYoutubeOptions,
      vimeoOptions: DefaultVimeoOptions,
      customEmbedOptions: DefaultCustomEmbedOptions,
    });
  }

  return (
    <FieldLabel label={"Choose embed type"}>
      <Select
        value={value?.videoType}
        onChange={changeVideoType}
        options={[
          { label: "Youtube", value: "youtube" },
          { label: "Vimeo", value: "vimeo" },
          { label: "Custom", value: "custom" },
        ]}
      />
      {value?.videoType?.value === VideoEnum.youtube && (
        <YoutubeOptions value={value} onChange={onChange} />
      )}
      {value?.videoType?.value === VideoEnum.vimeo && (
        <VimeoOptions value={value} onChange={onChange} />
      )}
      {value?.videoType?.value === VideoEnum.custom && (
        <CustomEmbedOptions value={value} onChange={onChange} />
      )}
    </FieldLabel>
  );
};
