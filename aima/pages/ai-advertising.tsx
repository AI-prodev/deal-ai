import { useEffect, useState } from "react";

import withAuth from "@/helpers/withAuth";

import { ALL_ROLES } from "@/utils/roles";
import { useRouter } from "next/router";
import Accounts from "./accounts";
import Campaigns from "./campaign/index";
import { getAccounts } from "@/store/features/accountsHelper";
import Head from "next/head";

const Campaign: React.FC = () => {
  const router = useRouter();

  const [tabs, setTabs] = useState<string>("");

  const toggleTabs = (name: string) => {
    setTabs(name);
  };

  const getAllAccounts = async () => {
    const accounts = await getAccounts();

    if (accounts?.length === 0) {
      setTabs("accounts");
    } else {
      setTabs("campaigns");
    }
  };

  useEffect(() => {
    if (router.isReady) {
    }
  }, [router.events, router.isReady]);

  useEffect(() => {
    if (router.isReady) {
      const fragment = window.location.hash.substring(1);

      if (fragment) {
        setTabs("accounts");
      } else {
        getAllAccounts();
      }
    }
  }, [router.events, router.isReady]);

  return (
    <>
      <Head>
        <title>AI-Advertising</title>
      </Head>
      {tabs && (
        <>
          <div>
            <div className="pt-5">
              <div>
                <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
                  <li
                    className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                      tabs === "campaigns" ? "!border-primary text-primary" : ""
                    }`}
                  >
                    <button onClick={() => toggleTabs("campaigns")}>
                      Campaigns
                    </button>
                  </li>

                  <li className="inline-block">
                    <button
                      onClick={() => toggleTabs("accounts")}
                      className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                        tabs === "accounts"
                          ? "!border-primary text-primary"
                          : ""
                      }`}
                    >
                      Accounts
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {tabs === "accounts" && <Accounts />}
            {tabs === "campaigns" && <Campaigns />}
          </div>
        </>
      )}
    </>
  );
};

export default withAuth(Campaign, ALL_ROLES);
