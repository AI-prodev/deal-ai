"use client";

import React, { ReactNode } from "react";
import Tabs from "@/components/Tabs";
import {
  CRM_BROADCAST_TABS,
  CRMType,
  SendEmailErrorType,
} from "@/components/crm/constants";
import SendEmailError from "@/components/crm/broadcast/SendEmailError";
import CRMHeader from "@/components/crm/CRMHeader";

interface IBroadcastTabs {
  activeTab: string;
  children: ReactNode;
  sendGridApiKeyError?: SendEmailErrorType.SEND_GRID_API_KEY | false;
  businessDetailsError?: SendEmailErrorType.BUSINESS_DETAILS | false;
}

const BroadcastTabsWrapper = ({
  activeTab,
  children,
  sendGridApiKeyError,
  businessDetailsError,
}: IBroadcastTabs) => (
  <div className="max-w-[780px]">
    {sendGridApiKeyError && <SendEmailError type={sendGridApiKeyError} />}
    {businessDetailsError && <SendEmailError type={businessDetailsError} />}
    <CRMHeader activeTab={CRMType.BROADCAST} />
    <div className="mt-4">
      <Tabs items={CRM_BROADCAST_TABS} activeTab={activeTab} />
      <div className="p-4 rounded-b-md rounded-tr-md bg-[#1a2941]">
        {children}
      </div>
    </div>
  </div>
);

export default BroadcastTabsWrapper;
