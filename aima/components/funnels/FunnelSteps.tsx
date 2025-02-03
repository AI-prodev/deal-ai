import React, { Dispatch, SetStateAction } from "react";
import { IFunnel } from "@/interfaces/IFunnel";
import { IProject } from "@/interfaces/IProject";
import { IPage } from "@/interfaces/IPage";
import FunnelPanelRight from "./FunnelPanelRight";

const FunnelSteps = ({
  isLightMode = false,
  funnel,
  project,
  selectedPage,
  setSelectedPage,
  toggleFunnelTabs,
}: {
  isLightMode?: boolean;
  funnel: IFunnel;
  project: IProject | undefined;
  selectedPage: IPage | null;
  setSelectedPage: Dispatch<SetStateAction<any>>;
  toggleFunnelTabs: Dispatch<SetStateAction<any>>;
}) => {
  return (
    <div className="flex-1 pl-8 pt-1">
      <FunnelPanelRight
        isLightMode={isLightMode}
        page={selectedPage}
        funnel={funnel}
        project={project}
        setSelectedPage={setSelectedPage}
        toggleFunnelTabs={toggleFunnelTabs}
      />
    </div>
  );
};

export default FunnelSteps;
