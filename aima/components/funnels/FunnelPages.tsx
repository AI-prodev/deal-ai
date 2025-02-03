import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IFunnel } from "@/interfaces/IFunnel";
import { IProject } from "@/interfaces/IProject";
import { IPage } from "@/interfaces/IPage";
import FunnelPanelLeft from "./FunnelPanelLeft";
import FunnelPanelRight from "./FunnelPanelRight";
import { getSession } from "next-auth/react";

const FunnelPages = ({
  pages,
  funnel,
  project,
  onUpdate,
  toggleFunnelTabs,
}: {
  pages: IPage[];
  funnel: IFunnel;
  project: IProject | undefined;
  onUpdate: () => void;
  toggleFunnelTabs: Dispatch<SetStateAction<any>>;
}) => {
  const [selectedPage, setSelectedPage] = useState<IPage | null>(
    pages?.length > 0 ? pages[0] : null
  );

  // will be needed inside the page editor to save the changes to the page
  useEffect(() => {
    getSession().then(session => {
      if (session?.token) {
        localStorage.setItem("sessionToken", session.token);
      }
    });
  }, []);

  return (
    <div className="flex">
      <div className="w-72">
        <FunnelPanelLeft
          pages={pages}
          selectedPage={selectedPage}
          funnel={funnel}
          project={project}
          setSelectedPage={setSelectedPage}
        />
      </div>
      <div className="flex-1 pl-8 pt-1 max-w-2xl">
        <FunnelPanelRight
          page={selectedPage}
          funnel={funnel}
          project={project}
          setSelectedPage={setSelectedPage}
          toggleFunnelTabs={toggleFunnelTabs}
        />
      </div>
    </div>
  );
};

export default FunnelPages;
