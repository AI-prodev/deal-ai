import { useState, useEffect } from "react";

import { getSession, useSession } from "next-auth/react";
import { GetServerSidePropsContext, NextPageContext } from "next";

import withAuth from "@/helpers/withAuth";
import { LEAD_ROLES } from "@/utils/roles";
import { useListLeadsQuery } from "@/store/features/leadsApi";
import LeadsDashborad from "@/components/leads/Dashboard";
import Head from "next/head";

type DashBoardProps = {
  jwtToken: string;
};

type StatsType = {
  businessesVectorCount: number;
  landVectorCount: number;
  businessesLastUpdated: number;
  landLastUpdated: number;
};

const DashBoard = ({ jwtToken: initialJwtToken }: DashBoardProps) => {
  const { data: sessionData } = useSession();

  return (
    <>
      <Head>
        <title>AI Marketing Lead Flow</title>
      </Head>
      <div className=" custom-select space-y-8 overflow-auto pt-5 ">
        {" "}
        <LeadsDashborad />
      </div>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context);

  const jwtToken = session?.token || "";
  return { props: { jwtToken } };
};

export default withAuth(DashBoard, LEAD_ROLES, "leads");
