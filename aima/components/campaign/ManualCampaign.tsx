import React, { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import uniqueId from "lodash/uniqueId";
import ManualCampaignModal from "./ManualCampaignModal";
import { ICampaign } from "@/interfaces/ICampaign";
import useServerTokenTracking from "@/hooks/useServerTokenTracking";
import {
  useStartAdSocialImageRequestMutation,
  useQueryAdSocialImageRequestMutation,
  useEndAdSocialImageRequestMutation,
} from "@/store/features/adSocialImageApi";
import {
  useCreateCampaignAssetMutation,
  useDeleteCampaignAssetMutation,
  useGetCampaignAssetsQuery,
} from "@/store/features/campaignApi";

type QueueItem = {
  id: string;
  magicHook: string;
  scrollStopper: string | null;
  isLoading: boolean;
};

const ManualCampaign = ({ campaign }: { campaign: ICampaign }) => {
  const [queue, setQueue] = useState<any[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [createCampaignAsset] = useCreateCampaignAssetMutation();
  const { data: assets, refetch } = useGetCampaignAssetsQuery({
    campaignId: campaign._id,
  });

  useEffect(() => {
    const updatedQueue =
      assets?.map(asset => ({
        id: asset._id,
        scrollStopper: asset?.scrollStopper?.url,
      })) || [];
    setQueue(updatedQueue);
  }, [assets]);

  // RTK query hooks
  const [startAdSocialImage] = useStartAdSocialImageRequestMutation();
  const [queryAdSocialImage] = useQueryAdSocialImageRequestMutation();
  const [endAdSocialImage] = useEndAdSocialImageRequestMutation();
  const [deleteCampaignAsset] = useDeleteCampaignAssetMutation();

  const { startAndTrack } = useServerTokenTracking({
    //@ts-ignore
    startRequest: startAdSocialImage,
    //@ts-ignore
    queryRequest: queryAdSocialImage,
    //@ts-ignore
    endRequest: endAdSocialImage,
    tokenKey: "adSocialRequestCampaignToken",
    isLocalOnEndResponse: true,
    onEndResponse: async response => {
      const url = response.response[0].url;

      try {
        await createCampaignAsset({
          accessToken: campaign.businessDetails.accountDetails.accessToken,
          campaign: campaign,
          scrollStopper: { url },
        }).unwrap();
      } catch (error) {
        console.error("Error creating campaign asset:", error);
      }

      setQueue(currentQueue =>
        currentQueue.map(item => ({
          ...item,
          scrollStopper: item.isLoading ? url : item.scrollStopper,
          isLoading: false,
        }))
      );
    },
  });

  const handleAddItemFromAPI = async (values: any) => {
    const uniqueIdStr = uniqueId("queue_");
    const newItem = {
      id: uniqueIdStr,
      magicHook: "This is a demo Magic Hook",
      showstopper: null,
      isLoading: true,
    };
    setQueue([...queue, newItem]);

    const submissionData = {
      ...values,
      adDescriptionText: values.businessDescription,
      adDescription: values.businessDescription,
    };

    await startAndTrack(submissionData);

    setModalIsOpen(false);
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await deleteCampaignAsset({ assetId: id }).unwrap();
      setQueue(queue.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting campaign asset:", error);
    }
  };
  return (
    <div className=" rounded-lg bg-black p-4 text-white shadow-md">
      <ReactSortable list={queue} setList={setQueue} className="w-[350px]">
        {queue.map((item, index) => (
          <div
            key={item.id}
            className={` mb-4 rounded-lg bg-gray-800 p-3 shadow-lg ${
              item.isLoading && "animate-pulse"
            }`}
          >
            <h1 className="p-2 text-2xl">Queue {index + 1}</h1>
            {item.isLoading ? (
              <div className="flex items-center justify-center">
                <div className="flex h-full items-center pr-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-white"></div>
                </div>
              </div>
            ) : item.scrollStopper ? (
              <img
                src={item.scrollStopper}
                alt="Showstopper"
                className="mb-2 rounded-lg "
              />
            ) : (
              <div className="placeholder-ui">No image available</div>
            )}
            <p className="p-2">{item.magicHook}</p>
            <button
              onClick={() => handleRemoveItem(item.id)}
              className="mt-2 self-end text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </ReactSortable>
      <button
        onClick={() => setModalIsOpen(true)}
        className="mt-4 rounded-full bg-green-600 p-2"
      >
        + Add New Post
      </button>
      <ManualCampaignModal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        onAddItem={handleAddItemFromAPI}
      />
    </div>
  );
};

export default ManualCampaign;
