import React, { useState } from "react";
import FunnelList from "../funnels/FunnelList";
import { IProject } from "@/interfaces/IProject";
import { createFunnelApi } from "@/store/features/projectApi";
import NewFunnelModal from "../funnels/NewFunnelModal";
import { FilterSVG } from "@/components/icons/SVGData";
import { FunnelType } from "@/enums/funnel-type.enum";

const ProjectHome = ({ project }: { project: IProject }) => {
  const [isNewFunnelModalOpen, setIsNewFunnelModalOpen] = useState(false);

  const { data: funnels, refetch: refetchFunnels } =
    createFunnelApi.useGetProjectFunnelsQuery({
      projectId: project._id,
      type: FunnelType.ULTRA_FAST_FUNNEL,
    });

  const handleNewFunnelModalClose = () => {
    setIsNewFunnelModalOpen(false);
  };

  const handleNewFunnelModalOpen = () => {
    setIsNewFunnelModalOpen(true);
  };

  if (!funnels) {
    return <></>;
  }

  return (
    <div className="p-3">
      <div className="my-3 pt-2 flex items-center">
        <FilterSVG />
        <h2 className="ml-3 text-2xl font-bold">Funnels</h2>
      </div>
      <NewFunnelModal
        isOpen={isNewFunnelModalOpen}
        onRequestClose={handleNewFunnelModalClose}
        onFunnelCreated={refetchFunnels}
        project={project}
        type={FunnelType.ULTRA_FAST_FUNNEL}
      />
      <div className="mt-6">
        <FunnelList
          funnels={funnels}
          project={project}
          type={FunnelType.ULTRA_FAST_FUNNEL}
          archived={false}
        />
      </div>
      <div className="mt-6 flex justify-start">
        <button
          onClick={handleNewFunnelModalOpen}
          className="rounded bg-primary px-4 py-2 text-white"
        >
          + New Funnel
        </button>
      </div>
    </div>
  );
};

export default ProjectHome;
