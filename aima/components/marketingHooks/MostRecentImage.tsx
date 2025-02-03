import React, { useState } from "react";
import Tippy from "@tippyjs/react";
import StarRating from "./StarRating";
import DownloadPopup from "./DownloadPopup";
import { HookData } from "@/utils/uniqueGeneration";
import MostRecentImageItem from "./MostRecentImageItem";

interface Hook {
  id: string;
  url: string;
  aspectRatio?: string;
  input: any;
  editedUrl?: string;
}

interface Generation {
  id: number;
  hooks: Hook[];
}

interface MostRecentImageProps {
  generationName: string;
  generations: Generation[];
  hookRatings: { [key: string]: number };
  handleRatingChange: (url: string, rating: number, hookId: string) => void;
  handleCopy: (hook: Hook, isEditedImagePreviewOpen: boolean) => void;
  handleDownload: (hook: HookData) => void;
  handleHookDeletionById: (generationId: number, hookId: string) => void;
  isDownloadPopupVisible: boolean;
  selectedHookForDownload: Hook;
  downloadButtonRef: React.RefObject<HTMLButtonElement>;
  downloadImage: (
    format: "png" | "jpg" | "webp",
    quality: number,
    isEditedImagePreviewOpen: boolean
  ) => void;
  submitFormVideo: (url: string) => void;
  setIsDownloadPopupVisible: (isVisible: boolean) => void;
  loadingStates: { [key: string]: boolean };
  showGenerationId?: boolean;
  handleEdit: (hook: Hook, isEditedImagePreviewOpen: boolean) => void;
  uploadImageLoading?: boolean;
}

const MostRecentImage: React.FC<MostRecentImageProps> = ({
  generationName,
  generations,
  hookRatings,
  handleRatingChange,
  handleCopy,
  handleDownload,
  handleHookDeletionById,
  isDownloadPopupVisible,
  selectedHookForDownload,
  downloadButtonRef,
  downloadImage,
  submitFormVideo,
  setIsDownloadPopupVisible,
  loadingStates,
  showGenerationId = true,
  handleEdit,
  uploadImageLoading,
}) => {
  const [isEditedImagePreviewOpen, setIsEditedImagePreviewOpen] =
    useState(false);

  const [openedPreviews, setOpenedPreviews] = useState<{
    [hookId: string]: string | undefined;
  }>({});

  const [selectedEditedImageUrl, setSelectedEditedImageUrl] = useState("");

  const openEditedImagePreview = (
    editedImageUrl: string,
    hookId: string,
    isInitialization: boolean = false
  ) => {
    setSelectedEditedImageUrl(editedImageUrl);
    setIsEditedImagePreviewOpen(!isEditedImagePreviewOpen);

    setOpenedPreviews(prev => {
      if (isInitialization && prev[hookId]) {
        return prev;
      }

      const isCurrentlyOpen = !!prev[hookId];
      if (isCurrentlyOpen) {
        const { [hookId]: _, ...rest } = prev;
        return rest;
      } else {
        return { ...prev, [hookId]: editedImageUrl };
      }
    });
  };

  return (
    <>
      {generations.length > 0 && (
        <>
          {generations.map((generation, genIndex) => (
            <React.Fragment key={genIndex}>
              <div className="p-2">
                {showGenerationId && (
                  <h1 className="text-2xl font-bold">
                    {generationName} #{generation.id}
                  </h1>
                )}

                <div className="mt-6 flex flex-col md:mt-0">
                  {generation?.hooks?.map((hook, hookIndex) => (
                    <>
                      <div key={hookIndex}>
                        <MostRecentImageItem
                          hook={hook}
                          isEditedImagePreviewOpen={isEditedImagePreviewOpen}
                          selectedEditedImageUrl={selectedEditedImageUrl}
                          openEditedImagePreview={openEditedImagePreview}
                          handleCopy={handleCopy}
                          handleDownload={handleDownload}
                          handleHookDeletionById={handleHookDeletionById}
                          isDownloadPopupVisible={isDownloadPopupVisible}
                          selectedHookForDownload={selectedHookForDownload}
                          downloadButtonRef={downloadButtonRef}
                          downloadImage={downloadImage}
                          submitFormVideo={submitFormVideo}
                          setIsDownloadPopupVisible={setIsDownloadPopupVisible}
                          loadingStates={loadingStates}
                          uploadImageLoading={uploadImageLoading}
                          generationId={generation.id}
                          handleEdit={handleEdit}
                          handleRatingChange={handleRatingChange}
                          hookRatings={hookRatings}
                          isPreviewOpen={!!openedPreviews[hook.id]}
                          previewImageUrl={openedPreviews[hook.id]}
                        />
                      </div>
                    </>
                  ))}
                </div>
              </div>
            </React.Fragment>
          ))}
        </>
      )}
    </>
  );
};

export default MostRecentImage;
