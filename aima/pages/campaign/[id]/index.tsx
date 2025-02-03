import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import withAuth from "@/helpers/withAuth";

import { ALL_ROLES } from "@/utils/roles";
import { useRouter } from "next/router";
import {
  BuildingSVG,
  EntityTypeSvg,
  PersonSVG,
} from "@/components/icons/SVGData";
import { campaignApi } from "@/store/features/campaignApi";
import CampaignSettings from "@/components/campaign/CampaignSettings";
import AdCampaignForm from "@/components/campaign/CampaignForm";
import AutopilotCampaign from "@/components/campaign/AutopilotCampaign";
import ManualCampaign from "@/components/campaign/ManualCampaign";
import RoundsCampaign from "@/components/campaign/RoundsCampaign";
import Head from "next/head";

type AccountSettingProps = {};

const Campaign = ({}: AccountSettingProps) => {
  const router = useRouter();
  const campaignId = router.query.id as string;
  const { data: campaign, refetch } = campaignApi.useGetCampaignQuery({
    campaignId,
  });

  const [tabs, setTabs] = useState<string>("home");

  const toggleTabs = (name: string) => {
    setTabs(name);
  };

  if (!campaign) {
    return <></>;
  }

  return (
    <>
      <Head>
        <title>{campaign ? campaign.title : "Campaign"}</title>
      </Head>
      <div>
        <ul className="flex space-x-2 rtl:space-x-reverse">
          <li>
            <Link
              href="/ai-advertising"
              className="text-primary hover:underline"
            >
              Campaigns
            </Link>
          </li>
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <span>{campaign.title}</span>
          </li>
        </ul>
        <div className="pt-5">
          <div className="mb-5 flex items-center">
            <PersonSVG />
            <h5 className="ml-3 text-lg font-semibold dark:text-white-light">
              {campaign?.businessDetails?.accountDetails?.name}
            </h5>
          </div>

          <div className="mb-5 flex items-center">
            <EntityTypeSvg />
            <h5 className="ml-3 text-lg font-semibold dark:text-white-light">
              {campaign?.businessDetails?.name}
            </h5>
          </div>

          <div className="mb-5 flex items-center">
            <BuildingSVG />
            <h5 className="ml-3 text-lg font-semibold dark:text-white-light">
              {campaign.title}
            </h5>
          </div>

          <hr className="mb-5 overflow-y-auto whitespace-nowrap border border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex" />
          <div>
            <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
              <li className="inline-block">
                <button
                  onClick={() => toggleTabs("home")}
                  className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                    tabs === "home" ? "!border-primary text-primary" : ""
                  }`}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                  >
                    <path
                      opacity="0.5"
                      d="M2 12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274C22 8.77128 22 9.91549 22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M12 15L12 18"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Home
                </button>
              </li>

              <li
                className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                  tabs === "adsets" ? "!border-primary text-primary" : ""
                }`}
              >
                <button onClick={() => toggleTabs("rounds")}>Rounds</button>
              </li>

              <li
                className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                  tabs === "autopilot" ? "!border-primary text-primary" : ""
                }`}
              >
                <button onClick={() => toggleTabs("autopilot")}>
                  Autopilot
                </button>
              </li>
              <li
                className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                  tabs === "manual" ? "!border-primary text-primary" : ""
                }`}
              >
                <button onClick={() => toggleTabs("manual")}>Manual</button>
              </li>
              <li className="inline-block">
                <button
                  onClick={() => toggleTabs("settings")}
                  className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                    tabs === "settings" ? "!border-primary text-primary" : ""
                  }`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="6"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <ellipse
                      opacity="0.5"
                      cx="12"
                      cy="17"
                      rx="7"
                      ry="4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                  Settings
                </button>
              </li>
            </ul>
          </div>

          {tabs === "home" && (
            <div className="my-3 w-full max-w-lg justify-center pt-2 ">
              <h5 className="mb-5 text-lg font-semibold dark:text-white-light">
                Following information we're collecting is for Round{" "}
                {campaign?.currentRound + 1}
              </h5>{" "}
              <AdCampaignForm campaign={campaign} refetch={refetch} />{" "}
            </div>
          )}

          {tabs === "rounds" && <RoundsCampaign campaign={campaign} />}

          {tabs === "autopilot" && <AutopilotCampaign campaign={campaign} />}
          {tabs === "manual" && <ManualCampaign campaign={campaign} />}
          {tabs === "settings" && <CampaignSettings campaign={campaign} />}
        </div>
      </div>
    </>
  );
};

export default withAuth(Campaign, ALL_ROLES);
