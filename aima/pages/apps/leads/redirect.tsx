import withAuth from "@/helpers/withAuth";
import { LEAD_ROLES } from "@/utils/roles";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

type Props = {};

const Redirect = (props: Props) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      signOut();
    }
  }, [status]);

  useEffect(() => {
    if (!session?.user) {
      router.push("/");
    }
  }, [session?.user]);
  return (
    <div>
      <h1>Redirecting...</h1>
    </div>
  );
};

export default withAuth(Redirect, LEAD_ROLES);
