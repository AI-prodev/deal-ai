import React, { useEffect } from "react";
import Tabs from "@/components/Tabs";
import { CRMType, CRM_TABS } from "@/components/crm/constants";
import { useDispatch } from "react-redux";
import { setPageTitle } from "@/store/themeConfigSlice";
import Head from "next/head";

interface ICRMHeaderProps {
  activeTab?: string;
}

const CRMHeader = ({ activeTab = CRMType.CONTACTS }: ICRMHeaderProps) => {
  const dispatch = useDispatch();

  return (
    <>
      <Head>
        <title>Easy CRM</title>
      </Head>
      <div>
        <div>
          <h2 className="text-2xl font-bold">Easy CRM</h2>
        </div>
        <div className="mt-4">
          <Tabs items={CRM_TABS} activeTab={activeTab} />
        </div>
      </div>
    </>
  );
};

export default CRMHeader;
