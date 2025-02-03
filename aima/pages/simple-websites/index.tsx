import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createFunnelApi } from "@/store/features/projectApi";
import FunnelList from "@/components/funnels/FunnelList";
import NewFunnelModal from "@/components/funnels/NewFunnelModal";
import ImportFunnelModal from "@/components/funnels/ImportFunnelModal";
import { GlobeSVG } from "@/components/icons/SVGData";
import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";
import { FunnelType } from "@/enums/funnel-type.enum";
import { FunnelTabs } from "@/pages/funnels";
import clsx from "clsx";
import Head from "next/head";
import { useDispatch } from "react-redux";
import { toggleTheme } from "@/store/themeConfigSlice";
import NewAIWebsiteModal from "@/components/funnels/NewAIWebsiteModal";

export type Tabs = "websites" | "archived_websites";

const SmartWebsites = () => {
  const IS_LIGHT_MODE = true;
  const [isNewWebsiteModalOpen, setIsNewWebsiteModalOpen] = useState(false);
  const [isNewWebsiteWithAIModalOpen, setIsNewWebsiteWithAIModalOpen] =
    useState(false);
  const [isImportWebsiteModalOpen, setIsImportWebsiteModalOpen] =
    useState(false);
  const [tabs, setTabs] = useState<Tabs | FunnelTabs>("websites");
  const [rerenderKey, setRerenderKey] = useState(0);
  const dispatch = useDispatch();
  const router = useRouter();

  const { data: websites, refetch: refetchWebsites } =
    createFunnelApi.useGetProjectFunnelsQuery({
      projectId: "default",
      type: FunnelType.SIMPLE_WEBSITES,
      archived: tabs === "archived_websites",
    });
  const [restoreFunnel] = createFunnelApi.useRestoreFunnelMutation();

  useEffect(() => {
    refetchWebsites();
  }, [tabs, rerenderKey]);

  useEffect(() => {
    dispatch(toggleTheme("dark"));
  }, []);
  const toggleTabs = async (name: Tabs | FunnelTabs) => {
    setTabs(name);
  };

  const handleRestore = async (funnelId: string) => {
    await restoreFunnel({ funnelId });
    refetchWebsites();
    setRerenderKey(prevKey => prevKey + 1);
  };

  const onNewFunnelCreated = (url: string) => {
    router.push(url);
  };

  if (!websites) {
    return <></>;
  }

  return (
    <div className="p-3">
      {IS_LIGHT_MODE && (
        <Head>
          <title>Simple Websites</title>
          <style>
            {`
            body {
              background-color: white !important;
            }
          `}
          </style>
        </Head>
      )}
      <div
        className={clsx("my-3 flex items-center pt-2", {
          "text-black": IS_LIGHT_MODE,
        })}
      >
        <GlobeSVG />
        <h2
          className={clsx("ml-3 text-2xl font-bold", {
            "text-black": IS_LIGHT_MODE,
          })}
        >
          Simple Websites
        </h2>
      </div>
      <ul
        className={clsx(
          "mb-5 overflow-y-auto whitespace-nowrap border-b font-semibold sm:flex",
          {
            "border-[#ebedf2]": IS_LIGHT_MODE,
            "border-[#191e3a]": !IS_LIGHT_MODE,
          }
        )}
      >
        <li className="inline-block">
          <button
            onClick={() => toggleTabs("websites")}
            className={clsx(
              "flex gap-2 border-b border-transparent p-2 hover:border-primary hover:text-primary",
              {
                "!border-primary text-primary": tabs === "websites",
                "text-black": IS_LIGHT_MODE,
              }
            )}
          >
            <div className="my-1 flex items-center pt-1">
              <h2 className="mx-2 text-md">All Websites</h2>
            </div>
          </button>
        </li>
        <li className="inline-block">
          <button
            onClick={() => toggleTabs("archived_websites")}
            className={clsx(
              "flex gap-2 border-b border-transparent p-2 hover:border-primary hover:text-primary",
              {
                "!border-primary text-primary": tabs === "archived_websites",
                "text-black": IS_LIGHT_MODE,
              }
            )}
          >
            <div className="my-1 flex items-center pt-1">
              <h2 className="mx-2 text-md">Archived</h2>
            </div>
          </button>
        </li>
      </ul>
      <NewFunnelModal
        isLightMode={IS_LIGHT_MODE}
        isOpen={isNewWebsiteModalOpen}
        onRequestClose={() => setIsNewWebsiteModalOpen(false)}
        onFunnelCreated={refetchWebsites}
        project={null}
        type={FunnelType.SIMPLE_WEBSITES}
      />
      <NewAIWebsiteModal
        isLightMode={IS_LIGHT_MODE}
        isOpen={isNewWebsiteWithAIModalOpen}
        onRequestClose={() => setIsNewWebsiteWithAIModalOpen(false)}
        onFunnelCreated={onNewFunnelCreated}
        project={null}
        type={FunnelType.SIMPLE_WEBSITES}
      />
      <ImportFunnelModal
        isLightMode={IS_LIGHT_MODE}
        isOpen={isImportWebsiteModalOpen}
        onRequestClose={() => setIsImportWebsiteModalOpen(false)}
        onFunnelImported={refetchWebsites}
        project={null}
        type={FunnelType.SIMPLE_WEBSITES}
      />
      <div className="mt-6 min-h-36 max-w-[780px]">
        <FunnelList
          isLightMode={IS_LIGHT_MODE}
          funnels={websites}
          project={null}
          archived={tabs === "archived_websites"}
          handleRestore={handleRestore}
          toggleTabs={toggleTabs}
          type={FunnelType.SIMPLE_WEBSITES}
        />
      </div>
      {tabs === "websites" && (
        <>
          <div className="mt-6 max-w-[780px]">
            <div className="flex space-x-4">
              <button
                onClick={() => setIsNewWebsiteModalOpen(true)}
                className="rounded bg-primary px-4 py-2 text-white"
              >
                + New Website
              </button>
              <button
                onClick={() => setIsNewWebsiteWithAIModalOpen(true)}
                className="rounded bg-primary px-4 py-2 text-white"
              >
                + New Website Using AI&nbsp;&nbsp;✨
              </button>
            </div>
            <div className="mt-4">
              <a
                href=""
                onClick={e => {
                  e.preventDefault();
                  setIsImportWebsiteModalOpen(true);
                }}
                className={clsx("hover:underline ", {
                  "text-black": IS_LIGHT_MODE,
                  "text-gray-400": !IS_LIGHT_MODE,
                })}
              >
                Import Website Share URL
              </a>
            </div>
          </div>
        </>
      )}
      <div className="mt-12 flex max-w-[780px] items-center justify-start">
        <div className="mb-8 text-center text-gray-300">
          <h2
            className={clsx("mb-3 text-2xl font-bold", {
              "text-black": IS_LIGHT_MODE,
            })}
          >
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
  );
};

export default withAuth(SmartWebsites, USER_ROLES, "ai-platform");
