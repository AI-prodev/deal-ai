import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createFunnelApi } from "@/store/features/projectApi";
import FunnelList from "@/components/funnels/FunnelList";
import NewFunnelModal from "@/components/funnels/NewFunnelModal";
import NewFunnelAIModal from "@/components/funnels/NewFunnelAIModal";
import ImportFunnelModal from "@/components/funnels/ImportFunnelModal";
import { FilterSVG } from "@/components/icons/SVGData";
import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";
import { FunnelType } from "@/enums/funnel-type.enum";
import { Tabs } from "@/pages/websites";
import { FunnelTabs } from "@/pages/funnels";
import clsx from "clsx";

type NewModalType = "Manual" | "WithAI";

const EasyWebsites = () => {
  const router = useRouter();
  const [isNewWebsiteModalOpen, setIsNewWebsiteModalOpen] = useState<
    NewModalType | undefined
  >(undefined);
  const [isImportWebsiteModalOpen, setIsImportWebsiteModalOpen] =
    useState(false);
  const [tabs, setTabs] = useState<Tabs | FunnelTabs>("websites");
  const [rerenderKey, setRerenderKey] = useState(0);

  const { data: websites, refetch: refetchWebsites } =
    createFunnelApi.useGetProjectFunnelsQuery({
      projectId: "default",
      type: FunnelType.EASY_WEBSITES,
      archived: tabs === "archived_websites",
    });

  const [restoreFunnel] = createFunnelApi.useRestoreFunnelMutation();

  const handleNewWebsiteModalOpen = (type: NewModalType) => () => {
    setIsNewWebsiteModalOpen(type);
  };

  const handleNewWebsiteModalClose = () => {
    setIsNewWebsiteModalOpen(undefined);
  };

  const handleImportWebsiteModalOpen = () => {
    setIsImportWebsiteModalOpen(true);
  };

  const handleImportWebsiteModalClose = () => {
    setIsImportWebsiteModalOpen(false);
  };

  const onNewWebsiteCreated = (url: string) => {
    router.push(url);
  };

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
    <div className="p-3">
      <div className="my-3 flex items-center pt-2">
        <FilterSVG />
        <h2 className="ml-3 text-2xl font-bold">Easy Websites</h2>
      </div>
      <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
        <li className="inline-block">
          <button
            onClick={() => toggleTabs("websites")}
            className={clsx(
              "flex gap-2 border-b border-transparent p-2 hover:border-primary hover:text-primary",
              {
                "!border-primary text-primary": tabs === "websites",
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
              }
            )}
          >
            <div className="my-1 flex items-center pt-1">
              <h2 className="mx-2 text-md">Archived</h2>
            </div>
          </button>
        </li>
      </ul>
      {isNewWebsiteModalOpen === "Manual" && (
        <NewFunnelModal
          isOpen={true}
          onRequestClose={handleNewWebsiteModalClose}
          onFunnelCreated={refetchWebsites}
          project={null}
          type={FunnelType.EASY_WEBSITES}
        />
      )}
      {/*{isNewWebsiteModalOpen === 'WithAI' && (*/}
      {/*  <NewFunnelAIModal*/}
      {/*    isOpen={true}*/}
      {/*    onRequestClose={handleNewWebsiteModalClose}*/}
      {/*    onFunnelCreated={onNewWebsiteCreated}*/}
      {/*    project={null}*/}
      {/*  />*/}
      {/*)}*/}
      <ImportFunnelModal
        isOpen={isImportWebsiteModalOpen}
        onRequestClose={handleImportWebsiteModalClose}
        onFunnelImported={refetchWebsites}
        project={null}
        type={FunnelType.EASY_WEBSITES}
      />
      <div className="mt-6 mx-auto min-h-36 max-w-[780px]">
        <FunnelList
          handleRestore={handleRestore}
          toggleTabs={toggleTabs}
          archived={tabs === "archived_websites"}
          funnels={websites}
          project={null}
          type={FunnelType.EASY_WEBSITES}
        />
      </div>
      {tabs === "websites" && (
        <>
          <div className="mt-6 mx-auto justify-start max-w-[780px]">
            <div className="flex space-x-4">
              <button
                onClick={handleNewWebsiteModalOpen("Manual")}
                className="rounded bg-primary px-4 py-2 text-white"
              >
                + Create Website
              </button>
              {/*<button*/}
              {/*  onClick={handleNewWebsiteModalOpen('WithAI')}*/}
              {/*  className="rounded bg-primary px-4 py-2 text-white"*/}
              {/*>*/}
              {/*  + Create Website Using AI&nbsp;&nbsp;✨*/}
              {/*</button>*/}
            </div>

            <div className="mt-4 mx-auto">
              <a
                href=""
                onClick={e => {
                  e.preventDefault();
                  handleImportWebsiteModalOpen();
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
  );
};

export default withAuth(EasyWebsites, USER_ROLES, "ai-platform");
