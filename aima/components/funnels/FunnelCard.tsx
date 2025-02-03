import { IFunnel } from "@/interfaces/IFunnel";
import { IProject } from "@/interfaces/IProject";
import { format } from "date-fns";
import React, { FC } from "react";
import { GlobeSVG, FilterSVG, ArchiveSVG } from "@/components/icons/SVGData";
import { FunnelType } from "@/enums/funnel-type.enum";
import { Tabs } from "@/pages/websites";
import { FunnelTabs } from "@/pages/funnels";
import clsx from "clsx";

interface Props {
  isLightMode?: boolean;
  project: IProject | null;
  archived?: boolean;
  funnel: IFunnel;
  type: FunnelType;
  handleRestore?: (funnelId: string) => void;
  toggleTabs?: (name: Tabs | FunnelTabs) => Promise<void>;
}

const FunnelCard: FC<Props> = ({
  isLightMode = false,
  project,
  archived,
  funnel,
  type,
  handleRestore,
  toggleTabs,
}) => {
  const handleRestoreWebsite = (event: any) => {
    event.preventDefault();
    event.stopPropagation();

    if (!funnel) {
      return;
    }

    if (!confirm(`Are you sure you want to restore "${funnel.title}"?`)) {
      return;
    }

    if (handleRestore) {
      handleRestore(funnel._id);
    }

    if (toggleTabs) {
      if (type === FunnelType.ULTRA_FAST_WEBSITE) {
        toggleTabs("websites");
      } else {
        toggleTabs("funnels");
      }
    }
  };

  return (
    <div
      className={clsx("w-full rounded border", {
        "border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4]":
          isLightMode,
        "border-[#1b2e4b] bg-[#191e3a] shadow-none": !isLightMode,
      })}
    >
      <div className="py-4 px-6 flex flex-col md:flex-row justify-between items-center">
        <div
          className={clsx("flex items-center", {
            "text-[#3b3f5c]": isLightMode,
            "text-white-light": !isLightMode,
          })}
        >
          {type === FunnelType.ULTRA_FAST_WEBSITE ||
          type === FunnelType.SIMPLE_WEBSITES ? (
            <GlobeSVG />
          ) : (
            <FilterSVG />
          )}
          <h5 className="ml-3 text-xl font-semibold">{funnel.title}</h5>
        </div>
        <div className="flex flex-col md:flex-row items-center w-80 justify-start md:justify-between">
          <p
            className={clsx("", {
              "text-[#3b3f5c]": isLightMode,
              "text-white-light": !isLightMode,
            })}
          >
            {funnel.numSteps
              ? funnel.numSteps === 1
                ? `1 ${type === FunnelType.ULTRA_FAST_WEBSITE ? "Page" : "Step"}`
                : `${funnel.numSteps} ${type === FunnelType.ULTRA_FAST_WEBSITE ? "Pages" : "Steps"}`
              : ""}
          </p>
          {archived ? (
            <button
              onClick={handleRestoreWebsite}
              className="flex items-center rounded px-0 text-danger m-0"
            >
              <div className="scale-75">
                <ArchiveSVG />
              </div>
              <div className="mr-1">
                Restore{" "}
                {type === FunnelType.ULTRA_FAST_WEBSITE ? "Website" : "Funnel"}
              </div>
            </button>
          ) : (
            <p
              className={clsx("", {
                "text-[#3b3f5c]": isLightMode,
                "text-white-light": !isLightMode,
              })}
            >
              Updated {format(new Date(funnel.updatedAt), "yyyy-MM-dd")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FunnelCard;
