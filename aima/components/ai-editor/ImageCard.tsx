import React, { useState } from "react";

import { HookData } from "@/utils/uniqueGeneration";
import ImageCardItem from "./ImageCardItem";

interface Hook {
  _id: string;
  originalUrl: string;
  editedUrl?: string;
}

interface Generation {
  _id: string;
  originalUrl: string;
  editedUrl?: string;
}

interface ImageCardProps {
  generationName: string;
  generations: Generation[];

  handleCopy: (hook: any, isEditedImagePreviewOpen: boolean) => void;
  handleDownload: (hook: any) => void;
  handleHookDeletionById: (id: string) => void;
  isDownloadPopupVisible: boolean;
  selectedHookForDownload: Hook;
  downloadButtonRef: React.RefObject<HTMLButtonElement>;
  downloadImage: (
    format: "png" | "jpg" | "webp",
    quality: number,
    isEditedImagePreviewOpen: boolean
  ) => void;
  submitFormVideo?: (url: string) => void;
  setIsDownloadPopupVisible: (isVisible: boolean) => void;

  showGenerationId?: boolean;
  handleEdit: (hook: Hook, isEditedImagePreviewOpen: boolean) => void;
  uploadImageLoading?: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({
  generationName,
  generations,

  handleCopy,
  handleDownload,
  handleHookDeletionById,
  isDownloadPopupVisible,
  selectedHookForDownload,
  downloadButtonRef,
  downloadImage,
  submitFormVideo,
  setIsDownloadPopupVisible,

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
      {generations?.length > 0 && (
        <>
          <div className="my-2 p-2">
            <div className="mt-6 flex flex-col md:mt-0">
              {generations.map((hook, hookIndex) => (
                <>
                  <div key={hookIndex} className="my-2">
                    <ImageCardItem
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
                      uploadImageLoading={uploadImageLoading}
                      generationId={hook._id}
                      handleEdit={handleEdit}
                      isPreviewOpen={!!openedPreviews[hook._id]}
                      previewImageUrl={openedPreviews[hook._id]}
                    />
                  </div>
                </>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ImageCard;
