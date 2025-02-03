import React, { useEffect } from "react";
import Tippy from "@tippyjs/react";
import { HookData } from "@/utils/uniqueGeneration";
import DownloadPopup from "../marketingHooks/DownloadPopup";
import "tippy.js/dist/tippy.css";
interface Hook {
  _id: string;
  originalUrl: string;
  editedUrl?: string;
}

interface Generation {
  id: number;
  hooks: Hook[];
}

interface ImageCardItemProps {
  hook: any;
  isEditedImagePreviewOpen: boolean;
  selectedEditedImageUrl: string;
  openEditedImagePreview: (
    url: string,
    hookId: string,
    isInitialization?: boolean
  ) => void;
  handleCopy: (hook: Hook, isEditedImagePreviewOpen: boolean) => void;
  handleDownload: (hook: HookData) => void;
  handleHookDeletionById: (id: string) => void;
  isDownloadPopupVisible: boolean;
  selectedHookForDownload: Hook;
  downloadButtonRef: React.RefObject<HTMLButtonElement>;
  downloadImage: (
    format: "png" | "jpg" | "webp",
    quality: number,
    isEditedImagePreviewOpen: boolean
  ) => void;
  handleEdit: (hook: Hook, isEdited: boolean) => void;

  uploadImageLoading?: boolean;
  submitFormVideo?: (url: string) => void;
  setIsDownloadPopupVisible: (isVisible: boolean) => void;

  generationId: string;

  isPreviewOpen: boolean;
  previewImageUrl?: string;
}

const ImageCardItem: React.FC<ImageCardItemProps> = ({
  hook,
  isEditedImagePreviewOpen,
  selectedEditedImageUrl,
  openEditedImagePreview,
  handleCopy,
  handleDownload,
  handleHookDeletionById,
  isDownloadPopupVisible,
  selectedHookForDownload,
  downloadButtonRef,
  downloadImage,
  handleEdit,

  uploadImageLoading,
  submitFormVideo,
  setIsDownloadPopupVisible,

  generationId,
  isPreviewOpen,
  previewImageUrl,
}) => {
  useEffect(() => {
    if (hook?.editedUrl) {
      openEditedImagePreview(hook.editedUrl, hook._id, true);
    }
  }, [hook]);

  return (
    <div
      key={hook._id}
      className="bg-dark-600 relative max-w-fit rounded-lg p-0 md:flex-row"
    >
      {hook?.editedUrl && (
        <button
          className="absolute right-3 top-3 z-10 rounded-full bg-orange-500 p-2  px-4 py-2 text-xs font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:bg-orange-600 hover:shadow-md focus:outline-none"
          disabled={uploadImageLoading}
          onClick={() =>
            openEditedImagePreview(hook?.editedUrl ?? "", hook._id)
          }
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 9.5L8 9.5M8 9.5L10.75 7M8 9.5L10.75 12"
              stroke="#ffffff"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M8 14.5L16 14.5M16 14.5L13.25 12M16 14.5L13.25 17"
              stroke="#ffffff"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
              stroke="#ffffff"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      )}

      <img
        src={
          isPreviewOpen && previewImageUrl
            ? hook.editedUrl
                .replace("/upload/", "/upload/f_auto,q_auto/")
                .replace(".png", "")
            : hook.originalUrl
                .replace("/upload/", "/upload/f_auto,q_auto/")
                .replace(".png", "")
        }
        key={hook.url}
        className={`rounded-lg ${uploadImageLoading && "animate-pulse"}`}
        style={{ maxHeight: "80vh" }}
      />

      <div className="absolute bottom-3 right-3 space-x-2">
        {isDownloadPopupVisible && selectedHookForDownload._id === hook._id && (
          <DownloadPopup
            buttonRef={downloadButtonRef}
            onDownload={(format, quality) =>
              downloadImage(format, quality, isEditedImagePreviewOpen)
            }
            isDisabled={uploadImageLoading}
            onCancel={() => setIsDownloadPopupVisible(false)}
          />
        )}
        <Tippy content="Copy" placement="top">
          <button
            className="invisible  rounded bg-blue-500 px-4 py-2 text-xs font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-md focus:outline-none lg:visible"
            onClick={() => handleCopy(hook, isEditedImagePreviewOpen)}
            disabled={uploadImageLoading}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.9983 10C20.9862 7.82497 20.8897 6.64706 20.1213 5.87868C19.2426 5 17.8284 5 15 5H12C9.17157 5 7.75736 5 6.87868 5.87868C6 6.75736 6 8.17157 6 11V16C6 18.8284 6 20.2426 6.87868 21.1213C7.75736 22 9.17157 22 12 22H15C17.8284 22 19.2426 22 20.1213 21.1213C21 20.2426 21 18.8284 21 16V15"
                stroke="#FFFFFF"
                stroke-width="1.5"
                stroke-linecap="round"
              />

              <path
                d="M3 10V16C3 17.6569 4.34315 19 6 19M18 5C18 3.34315 16.6569 2 15 2H11C7.22876 2 5.34315 2 4.17157 3.17157C3.51839 3.82475 3.22937 4.69989 3.10149 6"
                stroke="#FFFFFF"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </Tippy>
        <Tippy content="Edit" placement="top">
          <button
            className="rounded bg-yellow-500 px-4 py-2 text-xs font-bold uppercase  shadow outline-none transition-all duration-150 ease-linear hover:shadow-md focus:outline-none"
            onClick={() => handleEdit(hook, isEditedImagePreviewOpen)}
            disabled={uploadImageLoading}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.3601 4.07866L15.2869 3.15178C16.8226 1.61607 19.3125 1.61607 20.8482 3.15178C22.3839 4.68748 22.3839 7.17735 20.8482 8.71306L19.9213 9.63993M14.3601 4.07866C14.3601 4.07866 14.4759 6.04828 16.2138 7.78618C17.9517 9.52407 19.9213 9.63993 19.9213 9.63993M14.3601 4.07866L12 6.43872M19.9213 9.63993L14.6607 14.9006L11.5613 18L11.4001 18.1612C10.8229 18.7383 10.5344 19.0269 10.2162 19.2751C9.84082 19.5679 9.43469 19.8189 9.00498 20.0237C8.6407 20.1973 8.25352 20.3263 7.47918 20.5844L4.19792 21.6782M4.19792 21.6782L3.39584 21.9456C3.01478 22.0726 2.59466 21.9734 2.31063 21.6894C2.0266 21.4053 1.92743 20.9852 2.05445 20.6042L2.32181 19.8021M4.19792 21.6782L2.32181 19.8021M2.32181 19.8021L3.41556 16.5208C3.67368 15.7465 3.80273 15.3593 3.97634 14.995C4.18114 14.5653 4.43213 14.1592 4.7249 13.7838C4.97308 13.4656 5.26166 13.1771 5.83882 12.5999L8.5 9.93872"
                stroke="#FFFFFF"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </Tippy>
        <Tippy content="Download" placement="top">
          <button
            ref={downloadButtonRef}
            className="rounded bg-green-500 px-4 py-2 text-xs font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-md focus:outline-none"
            onClick={() => handleDownload(hook as any)}
            disabled={uploadImageLoading}
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
        </Tippy>

        {/* {hook.input?.aspectRatio?.toLowerCase().includes("landscape") && (
          <Tippy content="Image to Video (super experimental!)" placement="top">
            <button
              className="mb-5 rounded bg-indigo-500 px-4 py-2 text-xs font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-md focus:outline-none active:bg-blue-600 md:mb-0 md:ml-4"
              type="button"
              onClick={() => {
                submitFormVideo(
                  isEditedImagePreviewOpen ? selectedEditedImageUrl : hook.url,
                );
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21.5 17L2.5 17"
                  stroke="#FFFFFF"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M21.5 7L2.5 7"
                  stroke="#FFFFFF"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M12 2L12 7M12 22L12 17"
                  stroke="#FFFFFF"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M17 2.5L17 7M17 21.5L17 17"
                  stroke="#FFFFFF"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M7 2.5L7 7M7 21.5L7 17"
                  stroke="#FFFFFF"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M14 12C14 11.4722 13.4704 11.1162 12.4112 10.4043C11.3375 9.68271 10.8006 9.3219 10.4003 9.58682C10 9.85174 10 10.5678 10 12C10 13.4322 10 14.1483 10.4003 14.4132C10.8006 14.6781 11.3375 14.3173 12.4112 13.5957C13.4704 12.8838 14 12.5278 14 12Z"
                  stroke="#FFFFFF"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.352 4.28094 21.7133 5.37486 21.8731 7M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2.64799 19.7191 2.28672 18.6251 2.12687 17"
                  stroke="#FFFFFF"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </Tippy>
        )} */}

        <Tippy content="Delete" placement="top">
          <button
            className="mb-5 rounded bg-red-500 px-4 py-2 text-xs font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-md focus:outline-none active:bg-blue-600 md:mb-0 md:ml-4"
            onClick={() => handleHookDeletionById(hook._id)}
            disabled={uploadImageLoading}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.03365 8.89004C2.55311 5.68645 2.31285 4.08466 3.21049 3.04233C4.10813 2 5.72784 2 8.96727 2H15.033C18.2724 2 19.8922 2 20.7898 3.04233C21.6874 4.08466 21.4472 5.68646 20.9666 8.89004L19.7666 16.89C19.401 19.3276 19.2182 20.5464 18.3743 21.2732C17.5303 22 16.2979 22 13.833 22H10.1673C7.7024 22 6.46997 22 5.62604 21.2732C4.78211 20.5464 4.59929 19.3276 4.23365 16.89L3.03365 8.89004Z"
                stroke="#FFFFFF"
                stroke-width="1.5"
              />
              <path
                d="M8 6L3.5 11L11 19M14 6L4 16M20 6L7 19M13 19L20.5 11L16 6M10 6L20 16M4 6L17 19"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M21 6H3"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M19 19H5"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </Tippy>
      </div>
    </div>
  );
};

export default ImageCardItem;
