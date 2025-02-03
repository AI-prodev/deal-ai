import { ICampaign } from "@/interfaces/ICampaign";

import { campaignApi } from "@/store/features/campaignApi";
import { useRouter } from "next/router";
import React, { useCallback } from "react";
import { showSuccessToast } from "@/utils/toast";

const CampaignSettings = ({ campaign }: { campaign: ICampaign }) => {
  const router = useRouter();

  const { refetch: refetchcampaigns } = campaignApi.useGetCampaignsQuery();
  const [deleteProject] = campaignApi.useDeleteCampaignMutation();

  const handleDeleteProject = useCallback(async () => {
    if (!campaign) {
      return;
    }
    const confirmation = prompt(
      `Are you sure you want to delete ${campaign.title}? Doing so will also delete your funnels. Type DELETE to confirm`
    );
    if (!confirmation) {
      return;
    }
    if (confirmation !== "DELETE") {
      alert("You must type DELETE to continue.");
      return;
    }

    await deleteProject({
      campaignId: campaign._id,
      accessToken: campaign?.businessDetails?.accountDetails?.accessToken,
      fbCampaignId: campaign?.fbCampaignId,
    });

    await refetchcampaigns();
    await showSuccessToast({
      title: "Campaign deleted successfully",
    });
    router.push("/campaign");
  }, [campaign]);

  return (
    <>
      <div className="my-3 pt-2">
        <h2 className="mt-2 text-2xl font-bold">Settings</h2>
      </div>
      <div className="mt-6 flex justify-start">
        <button
          onClick={handleDeleteProject}
          className="rounded bg-danger px-4 py-2 text-white"
        >
          Delete Project
        </button>
      </div>
    </>
  );
};

export default CampaignSettings;
