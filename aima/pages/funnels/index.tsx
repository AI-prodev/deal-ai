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
import Head from "next/head";

export type FunnelTabs = "funnels" | "archived_funnels";

type NewModalType = "Manual" | "WithAI";

const Funnels = () => {
  const router = useRouter();
  const [isNewFunnelModalOpen, setIsNewFunnelModalOpen] = useState<
    NewModalType | undefined
  >(undefined);
  const [isImportFunnelModalOpen, setIsImportFunnelModalOpen] = useState(false);
  const [tabs, setTabs] = useState<FunnelTabs | Tabs>("funnels");
  const [rerenderKey, setRerenderKey] = useState(0);

  const { data: funnels, refetch: refetchFunnels } =
    createFunnelApi.useGetProjectFunnelsQuery({
      projectId: "default",
      type: FunnelType.ULTRA_FAST_FUNNEL,
      archived: tabs === "archived_funnels",
    });
  const [restoreFunnel] = createFunnelApi.useRestoreFunnelMutation();

  const handleNewFunnelModalOpen = (type: NewModalType) => () => {
    setIsNewFunnelModalOpen(type);
  };

  const handleNewFunnelModalClose = () => {
    setIsNewFunnelModalOpen(undefined);
  };

  const handleImportFunnelModalOpen = () => {
    setIsImportFunnelModalOpen(true);
  };

  const handleImportFunnelModalClose = () => {
    setIsImportFunnelModalOpen(false);
  };

  const onNewFunnelCreated = (url: string) => {
    router.push(url);
  };

  useEffect(() => {
    refetchFunnels();
  }, [tabs, rerenderKey]);

  const toggleTabs = async (name: FunnelTabs | Tabs) => {
    setTabs(name);
  };

  const handleRestore = async (funnelId: string) => {
    await restoreFunnel({ funnelId });
    refetchFunnels();
    setRerenderKey(prevKey => prevKey + 1);
  };

  if (!funnels) {
    return <></>;
  }

  return (
    <>
      <Head>
        <title>Ultra-Fast Funnels</title>
      </Head>
      <div className="p-3">
        <div className="my-3 flex items-center pt-2">
          <FilterSVG />
          <h2 className="ml-3 text-2xl font-bold">Ultra-Fast Funnels</h2>
        </div>
        <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
          <li className="inline-block">
            <button
              onClick={() => toggleTabs("funnels")}
              className={`flex gap-2 border-b border-transparent p-2 hover:border-primary hover:text-primary ${
                tabs === "funnels" ? "!border-primary text-primary" : ""
              }`}
            >
              <div className="my-1 flex items-center pt-1">
                <h2 className="mx-2 text-md">All Funnels</h2>
              </div>
            </button>
          </li>
          <li className="inline-block">
            <button
              onClick={() => toggleTabs("archived_funnels")}
              className={`flex gap-2 border-b border-transparent p-2 hover:border-primary hover:text-primary ${
                tabs === "archived_funnels"
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
        {isNewFunnelModalOpen === "Manual" && (
          <NewFunnelModal
            isOpen={true}
            onRequestClose={handleNewFunnelModalClose}
            onFunnelCreated={refetchFunnels}
            project={null}
            type={FunnelType.ULTRA_FAST_FUNNEL}
          />
        )}
        {isNewFunnelModalOpen === "WithAI" && (
          <NewFunnelAIModal
            isOpen={true}
            onRequestClose={handleNewFunnelModalClose}
            onFunnelCreated={onNewFunnelCreated}
            project={null}
          />
        )}
        <ImportFunnelModal
          isOpen={isImportFunnelModalOpen}
          onRequestClose={handleImportFunnelModalClose}
          onFunnelImported={refetchFunnels}
          project={null}
          type={FunnelType.ULTRA_FAST_FUNNEL}
        />
        <div className="mt-6 mx-auto min-h-36 max-w-[780px]">
          <FunnelList
            handleRestore={handleRestore}
            toggleTabs={toggleTabs}
            archived={tabs === "archived_funnels"}
            funnels={funnels}
            project={null}
            type={FunnelType.ULTRA_FAST_FUNNEL}
          />
        </div>
        {tabs === "funnels" && (
          <>
            <div className="mt-6 mx-auto justify-start max-w-[780px]">
              <div className="flex space-x-4">
                <button
                  onClick={handleNewFunnelModalOpen("Manual")}
                  className="rounded bg-primary px-4 py-2 text-white"
                >
                  + Create Funnel Manually
                </button>
                <button
                  onClick={handleNewFunnelModalOpen("WithAI")}
                  className="rounded bg-primary px-4 py-2 text-white"
                >
                  + Create Funnel Using AI&nbsp;&nbsp;✨
                </button>
              </div>

              <div className="mt-4 mx-auto">
                <a
                  href=""
                  onClick={e => {
                    e.preventDefault();
                    handleImportFunnelModalOpen();
                  }}
                  className="hover:underline text-gray-400"
                >
                  Import Funnel Share URL
                </a>
              </div>
            </div>
          </>
        )}
        <div className="mt-12 mx-auto flex max-w-[780px] items-center justify-center">
          <div className="mb-8 text-center text-gray-300">
            <h2 className="mb-3 text-2xl  font-bold">
              Rather we built your funnel for you?
            </h2>

            <a
              href="https://api.leadconnectorhq.com/widget/bookings/road-map-"
              target="_blank"
              className="mt-4 block w-full rounded-md bg-gradient-to-r from-blue-500 to-purple-500 py-2 px-4 text-center text-white shadow transition duration-300 ease-in-out"
              rel="noreferrer"
            >
              Buy Done For You Funnels
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(Funnels, USER_ROLES, "ai-platform");
