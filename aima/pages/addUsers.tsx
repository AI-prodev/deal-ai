import PageGeneratorForms from "@/components/pageGenerator/Forms";
import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";
import React, { useEffect, useState } from "react";
import { PageResults } from "@/components/pageGenerator/PageResults";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/router";
import { GlobeSVG } from "@/components/icons/SVGData";
import DomainList from "@/components/domains/DomainList";
import { createDomainApi } from "@/store/features/domainApi";
import NewDomainModal from "@/components/domains/NewDomainModal";
import { signIn, useSession } from "next-auth/react";
import FacebookSDK from "./facebookSdk";
import FacebookLoginSDK from "./facebookLoginSdk";
import FacebookLoginButton from "./facebookLoginButton";

type Props = {};

const AddUsers = (props: Props) => {
  const router = useRouter();

  const { data: session } = useSession();

  const handleFacebookLogin = () => {
    signIn("facebook");
  };

  return (
    <>
      <FacebookSDK appId="1345961409359181" version="v18.0" />
      <div className="p-3">
        <div className="my-3 pt-2 flex items-center">
          <GlobeSVG />
          <h2 className="ml-3 text-2xl font-bold">Add Business Accounts</h2>
        </div>

        {/* <DomainList domains={domains} onChange={refetchDomains} /> */}
        <div className="mt-6 flex justify-start">
          <FacebookLoginSDK />
          <FacebookLoginButton />
        </div>
      </div>
    </>
  );
};

export default withAuth(AddUsers, USER_ROLES);
