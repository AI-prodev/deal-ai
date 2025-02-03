import React, { useState, useEffect } from "react";
import { ICampaign } from "@/interfaces/ICampaign";
import { roundApi } from "@/store/features/roundApi";

type AutopilotCampaignProps = {
  campaign: ICampaign;
};

const RoundsCampaign: React.FC<AutopilotCampaignProps> = ({ campaign }) => {
  const {
    data: rounds,
    error,
    isLoading,
    refetch,
  } = roundApi.useGetRoundsQuery({
    campaignId: campaign?._id,
    accessToken: campaign?.businessDetails?.accountDetails?.accessToken,
    adAccountId: campaign.adAccountId,
  });

  useEffect(() => {
    // Trigger a refetch when the component mounts
    refetch();
  }, []); // Empty dependency array ensures this effect runs only on mount
  return (
    <div className="flex items-center justify-between">
      {isLoading && (
        <div className="w-full	 rounded bg-black p-4 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Fetching rounds ...</h2>
          </div>
        </div>
      )}

      {!isLoading && rounds?.length === 0 && (
        <div className="w-full	 rounded bg-black p-4 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              No rounds are associated with this campaign yet.
            </h2>
          </div>
        </div>
      )}

      {rounds && rounds.length > 0 && (
        <>
          {rounds?.map(round => (
            <div
              key={round?.sequence}
              className="mb-4 w-full rounded p-4 shadow-md"
            >
              <div className="flex-column items-center justify-start">
                <h2 className="text-4xl font-semibold">
                  Round: {round?.sequence}
                </h2>
                <h2 className="text-lg font-semibold">
                  Budget: {round?.budget}
                </h2>

                <h2 className="text-lg font-semibold">
                  Status: {round?.isActive ? "Active" : "Inactive"}
                </h2>

                <h2 className="text-lg font-semibold">
                  Overall Impression:{" "}
                  {+round.controlAdSets?.insights?.clicks +
                    +round.testAdSets?.insights?.clicks}
                </h2>
              </div>
              <div className="mt-4 flex w-full justify-between">
                <div className="w-2/5	 pr-2">
                  <div className="w-full  rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
                    <div className="py-7 px-6">
                      <h5 className="mb-4 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
                        {round.controlAdSets?.name}
                      </h5>
                      <p className="mt-2 mb-2 text-white-dark">
                        Budget: {round.controlAdSets?.daily_budget}
                      </p>
                      <p className="mt-2 mb-2 text-white-dark">
                        Status:{" "}
                        {round.controlAdSets?.status === "ACTIVE"
                          ? "Active"
                          : round.controlAdSets?.status}
                      </p>

                      <p className="mt-2 mb-2 text-white-dark">
                        Click Impressions:{" "}
                        {round.controlAdSets?.insights?.clicks}
                      </p>

                      {round.controlAdSets?.ads?.length === 0 && (
                        <p className="mt-2 mb-2 text-white-dark">
                          "No Ads Associated Yet"
                        </p>
                      )}
                      {round.controlAdSets?.ads?.length !== 0 && (
                        <img
                          src={round.controlAdSets?.imageUrl}
                          alt="Showstopper"
                          className="mt-2 rounded-sm"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-2/5	 pr-2">
                  <div className="w-full  rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
                    <div className="py-7 px-6">
                      <h5 className="mb-4 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
                        {round.testAdSets?.name}
                      </h5>
                      <p className="mt-2 mb-2 text-white-dark">
                        Budget: {round.testAdSets?.daily_budget}
                      </p>
                      <p className="mt-2 mb-2 text-white-dark">
                        Status:{" "}
                        {round.testAdSets?.status === "ACTIVE"
                          ? "Active"
                          : round.testAdSets?.status}
                      </p>

                      <p className="mt-2 mb-2 text-white-dark">
                        Click Impressions: {round.testAdSets?.insights?.clicks}
                      </p>
                      {round.testAdSets?.ads?.length === 0 && (
                        <p className="mt-2 mb-2 text-white-dark">
                          "No Ads Associated Yet"
                        </p>
                      )}
                      {round.testAdSets?.ads?.length !== 0 && (
                        <img
                          src={round.testAdSets?.imageUrl}
                          alt="Showstopper"
                          className="mt-2 rounded-sm"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 border-t"></div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default RoundsCampaign;
