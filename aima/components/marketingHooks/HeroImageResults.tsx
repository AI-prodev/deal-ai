import { HookData } from "@/pages/apps/magic-hooks";
import Tippy from "@tippyjs/react";
import React, { useEffect, useRef, useState } from "react";
import MarketingHookChart from "./MarketingHookChart";
import StarRating from "./StarRating";
import { useRateCreationMutation } from "@/store/features/marketingHooksApi";
import { getUniqueGenerations } from "@/utils/uniqueGeneration";
import useServerTokenTracking, {
  deleteHookById,
} from "@/hooks/useServerTokenTracking";
import { Dialog } from "@headlessui/react";
import {
  useEndImageToVideoRequestMutation,
  useQueryImageToVideoRequestMutation,
  useStartImageToVideoRequestMutation,
} from "@/store/features/imageToVideoApi ";
import { ProcessBanner } from "../ProcessBanner";
import DownloadPopup from "./DownloadPopup";
import MostRecentImage from "./MostRecentImage";
import ImageGallery from "../ImageGallery";

type HandleCopyFunc = (
  hook: any,
  isEditedImagePreviewOpen: boolean
) => Promise<void>;
type HandleRatingChangeFunc = (
  hookText: string,
  newRating: number,
  hookId: string
) => Promise<void>;
type HandleHookDeletionByIdFunc = (
  generationId: number,
  hookId: string
) => void;
type SubmitFormVideoFunc = (url: string) => Promise<void>;
type DownloadImageFunc = (
  format: "png" | "jpg" | "webp",
  quality: number,
  isEditedImagePreviewOpen: boolean
) => Promise<void>;
type HandleDownloadFunc = (hook: HookData) => void;
type HandleVideoRatingChangeFunc = (
  newRating: number,
  hookId: string
) => Promise<void>;

export const HeroImageResults = ({
  hooksData,
  hookRatings,
  setHookRatings,
  hookRatingsId,
  setHookRatingsId,
  setHooksData,
  handleCopy,
  handleRatingChange,
  handleHookDeletionById,
  submitFormVideo,
  downloadImage,
  handleDownload,
  handleVideoRatingChange,
  videoRatings,
  loadingStates,
  videoImageUrl,
  isModalOpen,
  setIsModalOpen,
  isLoadingVideo,
  videoUrl,
  downloadButtonRef,
  isDownloadPopupVisible,
  setIsDownloadPopupVisible,
  downloadVideo,
  selectedHookForDownload,
  genModalOpen,
  setGenModalOpen,
  handleEditImage,
  uploadImageLoading,
  stopTrackingVideo,
}: {
  hooksData: HookData[];
  hookRatings: { [key: string]: number };
  setHookRatings: React.Dispatch<
    React.SetStateAction<{ [key: string]: number }>
  >;
  hookRatingsId: { [key: string]: number };
  setHookRatingsId: React.Dispatch<
    React.SetStateAction<{ [key: string]: number }>
  >;
  setHooksData: React.Dispatch<React.SetStateAction<HookData[]>>;
  handleCopy: HandleCopyFunc;
  handleRatingChange: HandleRatingChangeFunc;
  handleHookDeletionById: HandleHookDeletionByIdFunc;
  submitFormVideo: SubmitFormVideoFunc;
  downloadImage: DownloadImageFunc;
  handleDownload: HandleDownloadFunc;
  handleVideoRatingChange: HandleVideoRatingChangeFunc;
  videoRatings: { [key: string]: number };
  loadingStates: { [key: string]: boolean };
  videoImageUrl: string;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingVideo: boolean;
  videoUrl: any;
  setVideoUrl: React.Dispatch<React.SetStateAction<any>>;
  downloadButtonRef: React.RefObject<HTMLButtonElement>;
  isDownloadPopupVisible: boolean;
  setIsDownloadPopupVisible: (isVisible: boolean) => void;
  downloadVideo: (url: string) => void;
  selectedHookForDownload: {
    id: string;
    url: string;
    aspectRatio?: string;
    input: any;
  };
  genModalOpen: boolean;
  setGenModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleEditImage: (hook: any, isEditedImagePreviewOpen: boolean) => void;
  uploadImageLoading?: boolean;
  stopTrackingVideo: () => void;
}) => {
  const [displayCount, setDisplayCount] = useState(20);

  const tokenKey = "heroRequestToken";
  useEffect(() => {
    const savedGenerations: HookData[] = JSON.parse(
      localStorage.getItem(`${tokenKey}Generations`) || "[]"
    );

    const newHookRatings: { [key: string]: number } = {};
    savedGenerations.forEach(generation => {
      generation.hooks.forEach(hook => {
        if (hook.rating !== undefined) {
          const hookKey = hook.url;
          newHookRatings[hookKey] = hook.rating;
        }
      });
    });

    setHookRatings(newHookRatings);
  }, []);

  // const handleHookDeleteationById = (generationId: number, hookId: string) => {
  //   setGenModalOpen(false);
  //   deleteHookById(generationId, hookId, tokenKey);
  //   const savedGenerations = JSON.parse(
  //     localStorage.getItem(`${tokenKey}Generations`) || "[]",
  //   ) as HookData[];

  //   const reversedGenerations = [...savedGenerations].sort(
  //     (a, b) => b.id - a.id,
  //   );

  //   setHooksData(reversedGenerations);
  // };

  const [currentIndex, setCurrentIndex] = useState(0);

  const mostRecentImage = hooksData.slice(0, 1);

  const otherImages = hooksData.slice(1);

  const distributeImagesInRows = (images: any[], columnCount: number) => {
    const columns: any[][] = Array.from({ length: columnCount }, () => []);

    images.forEach((image: any, index: number) => {
      const columnIndex = index % columnCount;
      columns[columnIndex].push(image);
    });

    return columns;
  };

  const imageColumns = distributeImagesInRows(otherImages, 3);

  const openModalWithImage = (imageId: number) => {
    const allImages = [...mostRecentImage, ...otherImages];

    const indexInAllImages = allImages.findIndex(image => image.id === imageId);

    const indexInHooksData = hooksData.findIndex(hook => hook.id === imageId);

    setCurrentIndex(indexInHooksData);

    setGenModalOpen(true);
  };

  const navigateImages = (direction: string) => {
    const allImages = [...mostRecentImage, ...otherImages];

    let currentIndexInAllImages = allImages.findIndex(
      image => image.id === hooksData[currentIndex].id
    );

    if (direction === "prev") {
      currentIndexInAllImages =
        (currentIndexInAllImages - 1 + allImages.length) % allImages.length;
    } else if (direction === "next") {
      currentIndexInAllImages =
        (currentIndexInAllImages + 1) % allImages.length;
    }

    const newImageId = allImages[currentIndexInAllImages].id;
    const newImageIndexInHooksData = hooksData.findIndex(
      hook => hook.id === newImageId
    );

    setCurrentIndex(newImageIndexInHooksData);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (genModalOpen) {
        if (event.key === "ArrowRight") {
          navigateImages("next");
        } else if (event.key === "ArrowLeft") {
          navigateImages("prev");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [genModalOpen, navigateImages]);

  const [isDesktopView, setIsDesktopView] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsDesktopView(false);
      } else {
        setIsDesktopView(true);
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleVideoClose = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsModalOpen(false);

    localStorage.removeItem("heroImageVideoRequestToken");
    stopTrackingVideo();
  };

  return (
    <>
      <Dialog
        open={isModalOpen}
        onClose={() => !isLoadingVideo && setIsModalOpen(!isModalOpen)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center">
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />

          <div className="relative mx-auto w-full max-w-4xl rounded-lg bg-black bg-opacity-70 p-6 backdrop-blur-sm">
            {isLoadingVideo ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <button
                  onClick={handleVideoClose}
                  className="absolute right-0 top-0 mr-2 mt-2 p-2 text-white hover:text-gray-200 focus:outline-none"
                  aria-label="Close"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 18L18 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <ProcessBanner description="Please wait, this may take up to three minutes." />
              </div>
            ) : (
              <>
                <div className="flex items-end justify-end pb-2">
                  <StarRating
                    rating={videoRatings[videoUrl.id] || 0}
                    setRating={rating =>
                      handleVideoRatingChange(rating, videoUrl.id)
                    }
                    isLoading={loadingStates[videoUrl.id] || false}
                  />
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <video
                    className="rounded-lg shadow-sm"
                    width="100% "
                    height="auto"
                    controls
                    autoPlay
                    loop
                  >
                    <source src={videoUrl?.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className=" flex ">
                    <button
                      onClick={() => downloadVideo(videoUrl.url)}
                      className="mx-4 rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 3V16M12 16L16 11.625M12 16L8 11.625"
                          stroke="#FFFFFF"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M15 21H9C6.17157 21 4.75736 21 3.87868 20.1213C3 19.2426 3 17.8284 3 15M21 15C21 17.8284 21 19.2426 20.1213 20.1213C19.8215 20.4211 19.4594 20.6186 19 20.7487"
                          stroke="#FFFFFF"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        submitFormVideo(videoImageUrl);
                      }}
                      className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M2.93077 11.2003C3.00244 6.23968 7.07619 2.25 12.0789 2.25C15.3873 2.25 18.287 3.99427 19.8934 6.60721C20.1103 6.96007 20.0001 7.42199 19.6473 7.63892C19.2944 7.85585 18.8325 7.74565 18.6156 7.39279C17.2727 5.20845 14.8484 3.75 12.0789 3.75C7.8945 3.75 4.50372 7.0777 4.431 11.1982L4.83138 10.8009C5.12542 10.5092 5.60029 10.511 5.89203 10.8051C6.18377 11.0991 6.18191 11.574 5.88787 11.8657L4.20805 13.5324C3.91565 13.8225 3.44398 13.8225 3.15157 13.5324L1.47176 11.8657C1.17772 11.574 1.17585 11.0991 1.46759 10.8051C1.75933 10.5111 2.2342 10.5092 2.52824 10.8009L2.93077 11.2003ZM19.7864 10.4666C20.0786 10.1778 20.5487 10.1778 20.8409 10.4666L22.5271 12.1333C22.8217 12.4244 22.8245 12.8993 22.5333 13.1939C22.2421 13.4885 21.7673 13.4913 21.4727 13.2001L21.0628 12.7949C20.9934 17.7604 16.9017 21.75 11.8825 21.75C8.56379 21.75 5.65381 20.007 4.0412 17.3939C3.82366 17.0414 3.93307 16.5793 4.28557 16.3618C4.63806 16.1442 5.10016 16.2536 5.31769 16.6061C6.6656 18.7903 9.09999 20.25 11.8825 20.25C16.0887 20.25 19.4922 16.9171 19.5625 12.7969L19.1546 13.2001C18.86 13.4913 18.3852 13.4885 18.094 13.1939C17.8028 12.8993 17.8056 12.4244 18.1002 12.1333L19.7864 10.4666Z"
                            fill="#FFFFFF"
                          />
                        </svg>
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Dialog>
      <Dialog
        open={genModalOpen}
        onClose={() => setGenModalOpen(!genModalOpen)}
        className="0 fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center p-2">
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />

          <div className="relative mx-auto flex w-full max-w-4xl items-center justify-center rounded-lg bg-black bg-opacity-100 p-6">
            <button
              onClick={() => setGenModalOpen(false)}
              className="absolute right-0 top-0 mr-2 mt-2 p-2 text-white hover:text-gray-200 focus:outline-none"
              aria-label="Close"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 18L18 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={() => navigateImages("prev")}
              className="absolute left-0 z-10 m-4 rounded-full bg-black bg-opacity-80"
            >
              <svg
                width="44"
                height="44"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M17.488 4.43057C17.8025 4.70014 17.8389 5.17361 17.5693 5.48811L11.9877 12L17.5693 18.5119C17.8389 18.8264 17.8025 19.2999 17.488 19.5695C17.1735 19.839 16.7 19.8026 16.4305 19.4881L10.4305 12.4881C10.1897 12.2072 10.1897 11.7928 10.4305 11.5119L16.4305 4.51192C16.7 4.19743 17.1735 4.161 17.488 4.43057ZM13.4881 4.43067C13.8026 4.70024 13.839 5.17372 13.5694 5.48821L7.98781 12.0001L13.5694 18.512C13.839 18.8265 13.8026 19.3 13.4881 19.5696C13.1736 19.8391 12.7001 19.8027 12.4306 19.4882L6.43056 12.4882C6.18981 12.2073 6.18981 11.7929 6.43056 11.512L12.4306 4.51202C12.7001 4.19753 13.1736 4.16111 13.4881 4.43067Z"
                  fill="#FFF"
                />
              </svg>
            </button>

            <div className="flex justify-center text-white">
              {hooksData[currentIndex] && (
                <MostRecentImage
                  generationName="Your Hero Image"
                  generations={[hooksData[currentIndex]]}
                  handleCopy={handleCopy}
                  handleDownload={handleDownload}
                  hookRatings={hookRatings}
                  handleRatingChange={handleRatingChange}
                  handleHookDeletionById={handleHookDeletionById}
                  isDownloadPopupVisible={isDownloadPopupVisible}
                  selectedHookForDownload={selectedHookForDownload}
                  downloadButtonRef={downloadButtonRef}
                  downloadImage={downloadImage}
                  setIsDownloadPopupVisible={setIsDownloadPopupVisible}
                  submitFormVideo={submitFormVideo}
                  loadingStates={loadingStates}
                  showGenerationId={false}
                  handleEdit={handleEditImage}
                  uploadImageLoading={uploadImageLoading}
                />
              )}
            </div>

            <button
              onClick={() => navigateImages("next")}
              className="absolute right-0 z-10 m-4 rounded-full bg-black bg-opacity-80"
            >
              <svg
                width="44"
                height="44"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.51192 4.43057C6.82641 4.161 7.29989 4.19743 7.56946 4.51192L13.5695 11.5119C13.8102 11.7928 13.8102 12.2072 13.5695 12.4881L7.56946 19.4881C7.29989 19.8026 6.82641 19.839 6.51192 19.5695C6.19743 19.2999 6.161 18.8264 6.43057 18.5119L12.0122 12L6.43057 5.48811C6.161 5.17361 6.19743 4.70014 6.51192 4.43057ZM10.5121 4.43068C10.8266 4.16111 11.3001 4.19753 11.5697 4.51202L17.5697 11.512C17.8104 11.7929 17.8104 12.2073 17.5697 12.4882L11.5697 19.4882C11.3001 19.8027 10.8266 19.8391 10.5121 19.5696C10.1976 19.3 10.1612 18.8265 10.4308 18.512L16.0124 12.0001L10.4308 5.48821C10.1612 5.17372 10.1976 4.70024 10.5121 4.43068Z"
                  fill="#FFF"
                />
              </svg>
            </button>
          </div>
        </div>
      </Dialog>
      {isDesktopView && (
        <div className="hidden w-full md:block ">
          <div className="-mx-2 flex">
            {imageColumns.map((column, columnIndex) => (
              <ImageGallery
                key={columnIndex}
                columnData={column}
                openModalWithImage={openModalWithImage}
                uploadImageLoading={uploadImageLoading}
              />
            ))}
          </div>
        </div>
      )}
      {!isDesktopView && (
        <div className="md:hidden">
          {hooksData.length > 0 && (
            <MostRecentImage
              generationName=" Your Hero Image"
              generations={hooksData}
              handleCopy={handleCopy}
              handleDownload={handleDownload}
              hookRatings={hookRatings}
              handleRatingChange={handleRatingChange}
              handleHookDeletionById={handleHookDeletionById}
              isDownloadPopupVisible={isDownloadPopupVisible}
              selectedHookForDownload={selectedHookForDownload}
              downloadButtonRef={downloadButtonRef}
              downloadImage={downloadImage}
              setIsDownloadPopupVisible={setIsDownloadPopupVisible}
              submitFormVideo={submitFormVideo}
              loadingStates={loadingStates}
              handleEdit={handleEditImage}
              uploadImageLoading={uploadImageLoading}
            />
          )}
        </div>
      )}
    </>
  );
};
