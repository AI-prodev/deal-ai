import React, { FC } from "react";
import FunnelCard from "./FunnelCard";
import { IFunnel } from "@/interfaces/IFunnel";
import { IProject } from "@/interfaces/IProject";
import { FunnelType } from "@/enums/funnel-type.enum";
import { Tabs } from "@/pages/websites";
import Link from "next/link";
import { FunnelTabs } from "@/pages/funnels";

interface Props {
  isLightMode?: boolean;
  funnels: IFunnel[];
  project: IProject | null;
  archived: boolean;
  type: FunnelType;
  handleRestore?: (funnelId: string) => void;
  toggleTabs?: (name: Tabs | FunnelTabs) => Promise<void>;
}

const FunnelList: FC<Props> = ({
  isLightMode = false,
  funnels,
  handleRestore,
  toggleTabs,
  project,
  archived,
  type,
}) => {
  let url = "websites";

  if (type === FunnelType.ULTRA_FAST_FUNNEL) {
    url = "funnels";
  } else if (type === FunnelType.EASY_WEBSITES) {
    url = "easy-websites";
  } else if (type === FunnelType.SIMPLE_WEBSITES) {
    url = "simple-websites";
  }

  return (
    <div className="grid gap-4 grid-cols-1 max-w-[780px]">
      {funnels.map(funnel => {
        return archived ? (
          <FunnelCard
            key={funnel._id}
            isLightMode={isLightMode}
            archived={archived}
            handleRestore={handleRestore}
            toggleTabs={toggleTabs}
            project={project}
            funnel={funnel}
            type={type}
          />
        ) : (
          <Link
            href={`/projects/${project ? project._id : "default"}/${url}/${funnel._id}`}
          >
            <FunnelCard
              key={funnel._id}
              isLightMode={isLightMode}
              archived={archived}
              handleRestore={handleRestore}
              toggleTabs={toggleTabs}
              project={project}
              funnel={funnel}
              type={type}
            />
          </Link>
        );
      })}
    </div>
  );
};

export default FunnelList;
