import Link from "next/link";
import { Button } from "@mui/material";
import { ArrowTopRightSVG, GlobeSVG } from "@/components/icons/SVGData";
import { Data, usePuck } from "@measured/puck";
import React from "react";
import clsx from "clsx";
import LoadingSpinner from "@/components/LoadingSpinner";

interface IHeaderActionsProps {
  isPublish: boolean;
  isPublishLoading: boolean;
  isPreview: boolean;
  funnelId: string;
  pagePath: string;
  onPublish: (data: Data) => void;
}

const HeaderActions = ({
  isPreview,
  isPublish,
  isPublishLoading,
  funnelId,
  pagePath,
  onPublish,
}: IHeaderActionsProps) => {
  const { appState } = usePuck();

  return (
    <>
      <Link
        href={`/projects/default/simple-websites/${funnelId}`}
        className="flex items-center border border-[#dcdcdc] text-black h-[32px] px-5 rounded text-sm hover:opacity-70"
      >
        Back
      </Link>
      <Button
        href={`${process.env.NEXT_PUBLIC_PREVIEW_URL}/p/${funnelId}/${pagePath}`}
        target="_blank"
        variant="contained"
        startIcon={<ArrowTopRightSVG className="w-[14px] h-[14px]" />}
        className={clsx(
          "!normal-case !bg-[#90caf9] !text-black h-[32px] !text-sm",
          {
            "opacity-60": !isPreview,
          }
        )}
        disabled={!isPreview}
      >
        Preview
      </Button>
      <Button
        variant="contained"
        startIcon={
          !isPublishLoading && <GlobeSVG className="w-[14px] h-[14px]" />
        }
        className="!normal-case !bg-[#90caf9] !text-black h-[32px] !text-sm w-28 disabled:opacity-60"
        onClick={() => onPublish(appState.data)}
        disabled={!isPublish || isPublishLoading}
      >
        {isPublishLoading ? (
          <LoadingSpinner
            className="!w-4 !h-4"
            svgClassName="text-black w-4 h-4"
          />
        ) : (
          "Publish"
        )}
      </Button>
    </>
  );
};

export default HeaderActions;
