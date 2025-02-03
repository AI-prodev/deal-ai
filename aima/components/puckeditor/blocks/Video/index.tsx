import { ComponentConfig } from "@measured/puck";
import {
  AlignFieldsProps,
  PUCKEDITOR_ALIGN_FIELDS,
  PUCKEDITOR_SPACING_FIELDS,
  SpacingProps,
} from "@/components/puckeditor/blocks/constants";
import React, { CSSProperties } from "react";
import getClassNameFactory from "@/components/puckeditor/get-classname-factory";
import styles from "./styles.module.css";
import clsx from "clsx";
import { VideoSelect } from "@/components/puckeditor/blocks/Video/video-select";
import {
  DefaultYoutubeOptions,
  YoutubeOptionsProps,
} from "@/components/puckeditor/blocks/Video/Youtube/youtube";
import { getEmbedUrl } from "@/components/puckeditor/blocks/Video/Youtube/get-url";
import {
  DefaultVimeoOptions,
  VimeoOptionsProps,
} from "@/components/puckeditor/blocks/Video/Vimeo/vimeo";
import { getVimeoUrl } from "@/components/puckeditor/blocks/Video/Vimeo/get-vimeo-url";
import {
  CustomEmbedOptionsProps,
  DefaultCustomEmbedOptions,
} from "@/components/puckeditor/blocks/Video/Custom/custom-embed";

const getClassName = getClassNameFactory("Video", styles);

export enum VideoEnum {
  youtube = "youtube",
  vimeo = "vimeo",
  custom = "custom",
}

export type VideoProps = {
  components: {
    videoType: Record<"label" | "value", string>;
    youtubeOptions: YoutubeOptionsProps;
    vimeoOptions: VimeoOptionsProps;
    customEmbedOptions: CustomEmbedOptionsProps;
  };
  width?: string;
  height?: string;
  spacings: SpacingProps;
} & AlignFieldsProps;

const Video: ComponentConfig<VideoProps> = {
  fields: {
    components: {
      type: "custom",
      label: "Options",
      render: ({ value, onChange }) => {
        return <VideoSelect value={value} onChange={onChange} />;
      },
    },
    width: {
      type: "text",
      label: "Optional width",
    },
    height: {
      type: "text",
      label: "Optional height",
    },
    align: PUCKEDITOR_ALIGN_FIELDS.fields!.align,
    spacings: PUCKEDITOR_SPACING_FIELDS.fields!.spacings,
  },
  defaultProps: {
    components: {
      videoType: {
        label: "Youtube",
        value: VideoEnum.youtube,
      },
      youtubeOptions: DefaultYoutubeOptions,
      vimeoOptions: DefaultVimeoOptions,
      customEmbedOptions: DefaultCustomEmbedOptions,
    },
    width: "560px",
    height: "315px",
    align: PUCKEDITOR_ALIGN_FIELDS.defaultProps!.align,
    spacings: PUCKEDITOR_SPACING_FIELDS.defaultProps!.spacings,
  },
  render: ({ components, spacings, width, height, align }) => {
    const styles: CSSProperties = {
      marginTop: spacings?.marginTop,
      marginBottom: spacings?.marginBottom,
      paddingTop: spacings?.paddingTop,
      paddingBottom: spacings?.paddingBottom,
      paddingLeft: spacings?.paddingLeft,
      paddingRight: spacings?.paddingRight,
    };

    switch (components.videoType?.value) {
      case VideoEnum.youtube:
        let youtubeSrc = components?.youtubeOptions?.url;

        if (!youtubeSrc) {
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
                border: "2px solid red",
                padding: "10px 25px",
                margin: "0 auto",
              }}
            >
              Please paste a Youtube URL
            </div>
          );
        }

        youtubeSrc = getEmbedUrl(youtubeSrc);

        if (youtubeSrc === "error") {
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
                border: "2px solid red",
                padding: "10px 25px",
                margin: "0 auto",
              }}
            >
              Invalid Youtube URL
            </div>
          );
        }

        if (!components.youtubeOptions.controls) {
          youtubeSrc += "?&amp;controls=0";
        }

        return (
          <iframe
            style={styles}
            className={clsx(getClassName(), {
              [getClassName(align)]: getClassName(align),
            })}
            width={width || "100%"}
            height={height || "100%"}
            src={youtubeSrc}
            title="YouTube video player"
            allow={`accelerometer; ${
              components?.youtubeOptions?.autoplay ? "autoplay;" : ""
            } clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share`}
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen={components?.youtubeOptions?.fullScreen}
          />
        );
      case VideoEnum.vimeo:
        let vimeoSrc = components?.vimeoOptions?.url;

        if (!vimeoSrc) {
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
                border: "2px solid red",
                padding: "10px 25px",
                margin: "0 auto",
              }}
            >
              Please paste a Vimeo URL
            </div>
          );
        }

        vimeoSrc = getVimeoUrl(vimeoSrc);

        if (vimeoSrc === "error") {
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
                border: "2px solid red",
                padding: "10px 25px",
                margin: "0 auto",
              }}
            >
              Invalid Vimeo URL
            </div>
          );
        }

        if (components.vimeoOptions?.loop) {
          vimeoSrc += "?&loop=1";
        }

        if (
          components.vimeoOptions?.loop &&
          components.vimeoOptions?.autoplay
        ) {
          vimeoSrc += "&autoplay=1";
        } else if (components.vimeoOptions?.autoplay) {
          vimeoSrc += "?&autoplay=1";
        }

        return (
          <iframe
            style={styles}
            className={clsx(getClassName(), {
              [getClassName(align)]: getClassName(align),
            })}
            src={vimeoSrc}
            width={width || "100%"}
            height={height || "100%"}
            allow={`${components?.vimeoOptions?.autoplay ? "autoplay; " : ""}fullscreen; picture-in-picture`}
            allowFullScreen={components?.vimeoOptions?.fullScreen}
          />
        );
      case VideoEnum.custom:
        return (
          <div
            style={{
              ...styles,
              width: width || "100%",
              height: height || "100%",
            }}
            className={clsx(getClassName(), {
              [getClassName(align)]: getClassName(align),
            })}
            dangerouslySetInnerHTML={{
              __html: components?.customEmbedOptions?.code,
            }}
          />
        );
      default:
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
              border: "2px solid green",
              padding: "10px 25px",
              margin: "0 auto",
            }}
          >
            Choose Video Type for embedding
          </div>
        );
    }
  },
};

export default Video;
