import React, { useEffect, useState } from "react";
import { createFunnelApi } from "@/store/features/projectApi";
import FunnelList from "@/components/funnels/FunnelList";
import NewFunnelModal from "@/components/funnels/NewFunnelModal";
import ImportFunnelModal from "@/components/funnels/ImportFunnelModal";
import { ArchiveSVG, GlobeSVG } from "@/components/icons/SVGData";
import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";
import { FunnelType } from "@/enums/funnel-type.enum";
import { FunnelTabs } from "@/pages/funnels";
import Head from "next/head";

export type Tabs = "websites" | "archived_websites";

const Websites = () => {
  const [isNewWebsiteModalOpen, setIsNewWebsiteModalOpen] = useState(false);
  const [isImportWebsiteModalOpen, setIsImportWebsiteModalOpen] =
    useState(false);
  const [tabs, setTabs] = useState<Tabs | FunnelTabs>("websites");
  const [rerenderKey, setRerenderKey] = useState(0);

  const { data: websites, refetch: refetchWebsites } =
    createFunnelApi.useGetProjectFunnelsQuery({
      projectId: "default",
      type: FunnelType.ULTRA_FAST_WEBSITE,
      archived: tabs === "archived_websites",
    });
  const [restoreFunnel] = createFunnelApi.useRestoreFunnelMutation();

  useEffect(() => {
    refetchWebsites();
  }, [tabs, rerenderKey]);

  const toggleTabs = async (name: Tabs | FunnelTabs) => {
    setTabs(name);
  };

  const handleRestore = async (funnelId: string) => {
    await restoreFunnel({ funnelId });
    refetchWebsites();
    setRerenderKey(prevKey => prevKey + 1);
  };

  if (!websites) {
    return <></>;
  }

  return (
    <>
      <Head>
        <title>Smart Websites</title>
      </Head>
      <div className="p-3">
        <div className="my-3 flex items-center pt-2">
          <GlobeSVG />
          <h2 className="ml-3 text-2xl font-bold">Smart Websites</h2>
        </div>
        <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
          <li className="inline-block">
            <button
              onClick={() => toggleTabs("websites")}
              className={`flex gap-2 border-b border-transparent p-2 hover:border-primary hover:text-primary ${
                tabs === "websites" ? "!border-primary text-primary" : ""
              }`}
            >
              <div className="my-1 flex items-center pt-1">
                <h2 className="mx-2 text-md">All Websites</h2>
              </div>
            </button>
          </li>
          <li className="inline-block">
            <button
              onClick={() => toggleTabs("archived_websites")}
              className={`flex gap-2 border-b border-transparent p-2 hover:border-primary hover:text-primary ${
                tabs === "archived_websites"
                  ? "!border-primary text-primary"
                  : ""
              }`}
            >
              <div className="my-1 flex items-center pt-1">
                <h2 className="mx-2 text-md">Archived</h2>
              </div>
            </button>
          </li>
        </ul>
        <NewFunnelModal
          isOpen={isNewWebsiteModalOpen}
          onRequestClose={() => setIsNewWebsiteModalOpen(false)}
          onFunnelCreated={refetchWebsites}
          project={null}
          type={FunnelType.ULTRA_FAST_WEBSITE}
        />
        <ImportFunnelModal
          isOpen={isImportWebsiteModalOpen}
          onRequestClose={() => setIsImportWebsiteModalOpen(false)}
          onFunnelImported={refetchWebsites}
          project={null}
          type={FunnelType.ULTRA_FAST_WEBSITE}
        />
        <div className="mt-6 mx-auto min-h-36 max-w-[780px]">
          <FunnelList
            funnels={websites}
            project={null}
            archived={tabs === "archived_websites"}
            handleRestore={handleRestore}
            toggleTabs={toggleTabs}
            type={FunnelType.ULTRA_FAST_WEBSITE}
          />
        </div>
        {tabs === "websites" && (
          <>
            <div className="mt-6 mx-auto max-w-[780px]">
              <button
                onClick={() => setIsNewWebsiteModalOpen(true)}
                className="rounded bg-primary px-4 py-2 text-white"
              >
                + New Website
              </button>
              <div className="mt-4">
                <a
                  href=""
                  onClick={e => {
                    e.preventDefault();
                    setIsImportWebsiteModalOpen(true);
                  }}
                  className="hover:underline text-gray-400"
                >
                  Import Website Share URL
                </a>
              </div>
            </div>
          </>
        )}
        <div className="mt-12 mx-auto flex max-w-[780px] items-center justify-center">
          <div className="mb-8 text-center text-gray-300">
            <h2 className="mb-3 text-2xl  font-bold">
              Rather we built your website for you?
            </h2>

            <a
              href="https://api.leadconnectorhq.com/widget/bookings/road-map-"
              target="_blank"
              className="mt-4 block w-full rounded-md bg-gradient-to-r from-blue-500 to-purple-500 py-2 px-4 text-center text-white shadow transition duration-300 ease-in-out"
              rel="noreferrer"
            >
              Buy Done For You Website
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(Websites, USER_ROLES, "ai-platform");
