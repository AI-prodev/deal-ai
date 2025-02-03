import React from "react";
import { IProject } from "@/interfaces/IProject";

import CampaignCard from "./CampaignCard";
import { ICampaign } from "@/interfaces/ICampaign";

const CampaignsList = ({ campaigns }: { campaigns: ICampaign[] }) => {
  return (
    <div className="mb-5 mt-6 grid max-w-[780px] grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {campaigns &&
        campaigns.map(campaign => (
          <CampaignCard key={campaign._id} campaign={campaign} />
        ))}
    </div>
  );
};

export default CampaignsList;
