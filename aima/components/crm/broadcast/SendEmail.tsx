"use client";

import { useState } from "react";
import { SendEmailMode, SendEmailTabsType } from "@/components/crm/constants";
import SendEmailCreate from "@/components/crm/broadcast/SendEmailCreate";
import SendEmailSchedule from "@/components/crm/broadcast/SendEmailSchedule";
import type { ISendEmailFormValues } from "@/interfaces/IBroadcast";

interface ISendEmailProps {
  mode: SendEmailMode;
}

const SendEmail = ({ mode }: ISendEmailProps) => {
  const [sendEmailData, setSendEmailData] =
    useState<ISendEmailFormValues | null>(null);
  const [activeTab, setActiveTab] = useState(SendEmailTabsType.CREATE);

  const handleChangeTab = (tab: SendEmailTabsType): void => {
    setActiveTab(tab);
  };

  return (
    <>
      {activeTab === SendEmailTabsType.CREATE && (
        <SendEmailCreate
          handleChangeTab={handleChangeTab}
          setSendEmailData={setSendEmailData}
          mode={mode}
        />
      )}
      {activeTab === SendEmailTabsType.SCHEDULE && (
        <SendEmailSchedule sendEmailData={sendEmailData} mode={mode} />
      )}
    </>
  );
};

export default SendEmail;
