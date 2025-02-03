import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";
import React, { useState } from "react";

import { CampaignSvg } from "@/components/icons/SVGData";
import NewcampaignModal from "@/components/campaign/NewCampaignModal";
import { campaignApi } from "@/store/features/campaignApi";
import CampaignsList from "@/components/campaign/CampaignList";

type Props = {};

const Campaigns = (props: Props) => {
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);

  const { data: campaigns, refetch: refetchcampaigns } =
    campaignApi.useGetCampaignsQuery();
  const handleNewProjectModalClose = () => {
    setIsNewCampaignModalOpen(false);
  };

  const handleNewProjectModalOpen = () => {
    setIsNewCampaignModalOpen(true);
  };

  return (
    <div className="p-3">
      <div className="my-3 flex items-center pt-2">
        <CampaignSvg />
        <h2 className="ml-3 text-2xl font-bold">Campaigns</h2>
      </div>
      <div className="mt-6 flex justify-start">
        <button
          onClick={handleNewProjectModalOpen}
          className="rounded bg-primary px-4 py-2 text-white"
        >
          + New campaign
        </button>
      </div>
      <NewcampaignModal
        isOpen={isNewCampaignModalOpen}
        onRequestClose={handleNewProjectModalClose}
        onCreated={refetchcampaigns}
      />
      {campaigns && <CampaignsList campaigns={campaigns} />}
    </div>
  );
};

export default withAuth(Campaigns, USER_ROLES);
