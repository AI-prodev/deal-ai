import React, { useState } from "react";
import NewStoreModal from "@/components/stores/NewStoreModal";
import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";
import StoreList from "@/components/stores/StoreList";
import { addStoreToUser } from "@/store/features/storeApi";
import { IStoreSave } from "@/interfaces/IStore";
import Head from "next/head";

const Stores = () => {
  const [isNewStoreModalOpen, setIsNewStoreModalOpen] = useState(false);

  const [stores, setStores] = useState([] as any[]);

  // const { data: funnels, refetch: refetchFunnels } = createFunnelApi.useGetProjectFunnelsQuery({ });

  const handleNewStoreModalOpen = () => {
    setIsNewStoreModalOpen(true);
  };

  const handleNewStoreModalClose = () => {
    setIsNewStoreModalOpen(false);
  };

  const saveStoreInfo = (data: IStoreSave) => {
    addStoreToUser(data);
  };

  // const handleShowStoreDetails = () => {
  // }

  return (
    <>
      <Head>
        <title>Stores</title>
      </Head>
      <div className="p-3">
        <div className="flex justify-center">
          <div className="w-full max-w-[780px]">
            <div className="my-3 flex items-center pt-2">
              <h2 className="text-2xl font-bold">Stores</h2>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-[780px]">
            <NewStoreModal
              isOpen={isNewStoreModalOpen}
              onRequestClose={handleNewStoreModalClose}
              onStoreCreated={data => {
                saveStoreInfo({
                  storeId: "store_id",
                  domain: data.store_name,
                });
                handleNewStoreModalClose();
                setStores(stores => [...stores, data]);
              }}
            />
            <div className="mt-6">
              <StoreList stores={stores} />
            </div>
            <div className="mt-6">
              <div className="mt-6 flex justify-start space-x-2">
                <button
                  onClick={handleNewStoreModalOpen}
                  className="rounded bg-primary px-4 py-2 text-white"
                >
                  + Add Store
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(Stores, USER_ROLES, "ai-platform");
