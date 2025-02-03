import Link from "next/link";
import { useEffect, useState } from "react";

import AmortizationCalculator from "@/components/AmortizationCalculator";
import { GetServerSideProps } from "next";
import withAuth from "@/helpers/withAuth";
import { useAuth } from "@/helpers/useAuth";
import { BUYER_ROLES } from "@/utils/roles";
import Head from "next/head";

const Wizards = () => {
  const appName = "Leverage Tool";

  const generateSessionToken = () => {
    const uuidv4 = require("uuid").v4;
    return uuidv4();
  };

  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const sessionToken = localStorage.getItem("sessionToken");
    if (sessionToken || process.env.NEXT_PUBLIC_DEBUG == "true") {
      setLoggedIn(true);
    }
  }, []);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  });

  return (
    <>
      <Head>
        <title>{appName}</title>
      </Head>
      <div>
        <ul className="flex space-x-2 rtl:space-x-reverse">
          <li>
            <Link href="#" className="text-primary hover:underline">
              Apps
            </Link>
          </li>
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <span>{appName}</span>
          </li>
        </ul>
        <div className="space-y-8 pt-5">
          {/* <h4 className="badge mb-0 inline-block bg-primary text-base hover:top-0">
          Alpha Build - deal.ai Team Use Only
        </h4> */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="panel">
              <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">
                  {appName}
                </h5>
              </div>

              <Link href="/apps/rockefeller-financing">
                <button type="button" className="btn btn-success w-full">
                  Business Financing Application Form
                </button>
              </Link>
              <Link href="/apps/rockefeller-amortization">
                <button type="button" className="btn btn-primary mt-5 w-full">
                  Amortization Calculator
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(Wizards, BUYER_ROLES);
