import CustomPinturaEditorModal from "@/components/CustomPinturaEditorModal";
import AiEditorUpload from "@/components/ai-editor/AiEditorUpload";
import { Dialog } from "@headlessui/react";
import React, { useEffect, useRef, useState } from "react";
import "@pqina/pintura/pintura.css";
import {
  useDeleteUserAIEditorEntryMutation,
  useListAIEditorEntriesQuery,
  useUpdateEditedImageMutation,
} from "@/store/features/aiEditorApi";

import EditorImageGallery from "@/components/ai-editor/EditorImageGallery";
import ImageCard from "@/components/ai-editor/ImageCard";
import { showSuccessToast } from "@/utils/toast";
import LoadingSkeleton from "@/components/ai-editor/LoadingSkeleton";
import Head from "next/head";

const AiEditor: React.FC = () => {
  const [images, setImages] = useState<any[]>([]);
  const [isPinturaOpen, setIsPinturaOpen] = useState(false);
  const [editableImage, setEditableImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [genModalOpen, setGenModalOpen] = useState(false);
  const {
    data: entries,
    isLoading,
    error,
    refetch: refetchList,
  } = useListAIEditorEntriesQuery({});
  const [deleteEntry, { isLoading: isDeleting }] =
    useDeleteUserAIEditorEntryMutation();
  const [uploadEditedImage, { isLoading: isEditing }] =
    useUpdateEditedImageMutation();
  const onEditComplete = async (editedImage: any) => {
    setIsPinturaOpen(false);
    setEditableImage(null);

    const file = editedImage.dest;
    if (!(file instanceof Blob)) {
      console.error("Edited image is not a Blob");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    const currentEntryId = entries[currentIndex]?._id;
    if (!currentEntryId) {
      console.error("No current entry ID found for the edited image");
      return;
    }

    try {
      await uploadEditedImage({ id: currentEntryId, formData }).unwrap();
      refetchList().unwrap();
      showSuccessToast({ title: "Image updated successfully" });
      setGenModalOpen(true);
    } catch (error) {
      console.error("Error updating edited image:", error);
    }
  };

  const handleEditImage = (hook: any, isEditedImagePreviewOpen: boolean) => {
    setEditableImage(
      isEditedImagePreviewOpen ? hook.editedUrl : hook.originalUrl
    );
    setIsPinturaOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteEntry(id).unwrap();
    showSuccessToast({ title: "Image deleted" });
    refetchList();
    setGenModalOpen(false);
  };
  const handleCopy = async (hook: any, isEditedImagePreviewOpen: boolean) => {
    try {
      const imageUrl = isEditedImagePreviewOpen
        ? hook.editedUrl
        : hook.originalUrl;
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d") as any;

      img.crossOrigin = "anonymous";
      img.onload = async () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        const blob: Blob = await new Promise(resolve =>
          canvas.toBlob(resolve as any, (img as any).type)
        );

        await navigator.clipboard.write([
          new ClipboardItem({ [(blob as any).type]: blob } as any),
        ]);
      };

      img.onerror = error => {
        throw new Error(`Failed to load image: ${error}`);
      };

      img.src = imageUrl;
    } catch (error) {
      console.error("Error copying image to clipboard:", error);
      alert("Failed to copy image to clipboard");
    }
  };

  const [isDownloadPopupVisible, setIsDownloadPopupVisible] =
    useState<boolean>(false);
  const [selectedHookForDownload, setSelectedHookForDownload] = useState<
    any | null
  >(null);
  const downloadButtonRef = useRef<HTMLButtonElement>(null);

  const handleDownload = (hook: any) => {
    setIsDownloadPopupVisible(!isDownloadPopupVisible);
    setSelectedHookForDownload(hook);
  };
  const downloadImage = async (
    format: "png" | "jpg" | "webp",
    quality: number,
    isEditedImagePreviewOpen: boolean
  ) => {
    if (!selectedHookForDownload) return;

    setIsDownloadPopupVisible(false);

    try {
      let imageUrl = isEditedImagePreviewOpen
        ? selectedHookForDownload.editedUrl
        : selectedHookForDownload.originalUrl;
      imageUrl = imageUrl.replace("/upload/", `/upload/q_${quality}/`);
      imageUrl = imageUrl.replace(/\.(png|jpg|webp)$/, `.${format}`);

      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `download.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Error downloading the image", error);
    }
  };

  const distributeImagesInRows = (images: any[], columnCount: number) => {
    const columns: any[][] = Array.from({ length: columnCount }, () => []);

    images?.forEach((image: any, index: number) => {
      const columnIndex = index % columnCount;
      columns[columnIndex].push(image);
    });

    return columns;
  };

  const imageColumns = distributeImagesInRows(entries, 3);

  const openModalWithImage = (imageId: string) => {
    const foundIndex = entries.findIndex((entry: any) => entry._id === imageId);

    if (foundIndex >= 0) {
      setCurrentIndex(foundIndex);
      setGenModalOpen(true);
    }
  };

  const navigateImages = (direction: "prev" | "next") => {
    let newIndex = currentIndex;

    if (direction === "prev") {
      newIndex = currentIndex - 1 < 0 ? entries.length - 1 : currentIndex - 1;
    } else if (direction === "next") {
      newIndex = (currentIndex + 1) % entries.length;
    }

    setCurrentIndex(newIndex);
    const newImage = entries[newIndex];
    setEditableImage(newImage.originalUrl || newImage.editedUrl);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isPinturaOpen) {
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
  }, [navigateImages, entries, currentIndex]);
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

  return (
    <>
      <Head>
        <title>AI Image Editor</title>
      </Head>
      <div className="p-3">
        <Dialog
          open={isPinturaOpen}
          onClose={() => setIsPinturaOpen(false)}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex min-h-screen items-center justify-center">
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />

            <div
              className="relative mx-auto h-full w-full max-w-4xl rounded-lg bg-white p-6"
              style={{ height: "70vh" }}
            >
              <CustomPinturaEditorModal
                onEditComplete={onEditComplete}
                editableImage={editableImage}
                setIsPinturaOpen={setIsPinturaOpen}
              />
            </div>
          </div>
        </Dialog>

        <Dialog
          open={genModalOpen}
          onClose={() => setGenModalOpen(!genModalOpen)}
          className="fixed inset-0 z-10 overflow-y-auto"
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
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M17.488 4.43057C17.8025 4.70014 17.8389 5.17361 17.5693 5.48811L11.9877 12L17.5693 18.5119C17.8389 18.8264 17.8025 19.2999 17.488 19.5695C17.1735 19.839 16.7 19.8026 16.4305 19.4881L10.4305 12.4881C10.1897 12.2072 10.1897 11.7928 10.4305 11.5119L16.4305 4.51192C16.7 4.19743 17.1735 4.161 17.488 4.43057ZM13.4881 4.43067C13.8026 4.70024 13.839 5.17372 13.5694 5.48821L7.98781 12.0001L13.5694 18.512C13.839 18.8265 13.8026 19.3 13.4881 19.5696C13.1736 19.8391 12.7001 19.8027 12.4306 19.4882L6.43056 12.4882C6.18981 12.2073 6.18981 11.7929 6.43056 11.512L12.4306 4.51202C12.7001 4.19753 13.1736 4.16111 13.4881 4.43067Z"
                    fill="#FFF"
                  />
                </svg>
              </button>

              <div className="flex justify-center text-white">
                {entries && entries[currentIndex] && (
                  <ImageCard
                    generationName="AI "
                    generations={[entries[currentIndex]]}
                    handleCopy={handleCopy}
                    handleDownload={handleDownload}
                    handleHookDeletionById={handleDelete}
                    isDownloadPopupVisible={isDownloadPopupVisible}
                    selectedHookForDownload={selectedHookForDownload}
                    downloadButtonRef={downloadButtonRef}
                    downloadImage={downloadImage}
                    setIsDownloadPopupVisible={setIsDownloadPopupVisible}
                    // submitFormVideo={submitFormVideo}
                    showGenerationId={false}
                    handleEdit={handleEditImage}
                    uploadImageLoading={isEditing}
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
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.51192 4.43057C6.82641 4.161 7.29989 4.19743 7.56946 4.51192L13.5695 11.5119C13.8102 11.7928 13.8102 12.2072 13.5695 12.4881L7.56946 19.4881C7.29989 19.8026 6.82641 19.839 6.51192 19.5695C6.19743 19.2999 6.161 18.8264 6.43057 18.5119L12.0122 12L6.43057 5.48811C6.161 5.17361 6.19743 4.70014 6.51192 4.43057ZM10.5121 4.43068C10.8266 4.16111 11.3001 4.19753 11.5697 4.51202L17.5697 11.512C17.8104 11.7929 17.8104 12.2073 17.5697 12.4882L11.5697 19.4882C11.3001 19.8027 10.8266 19.8391 10.5121 19.5696C10.1976 19.3 10.1612 18.8265 10.4308 18.512L16.0124 12.0001L10.4308 5.48821C10.1612 5.17372 10.1976 4.70024 10.5121 4.43068Z"
                    fill="#FFF"
                  />
                </svg>
              </button>
            </div>
          </div>
        </Dialog>

        <div className="mb-4 flex justify-center">
          <AiEditorUpload images={images} setImages={setImages} />
        </div>

        {isLoading && <LoadingSkeleton />}
        <div className="hidden w-full md:block">
          {entries && entries.length === 0 ? (
            <div className="mt-20 text-center">
              <p className="text-lg text-gray-700">
                No Edited Images to display 😞
              </p>
              <p className="text-md mt-2 text-gray-500">
                Start by uploading images to see them here!
              </p>
            </div>
          ) : (
            <div className="-mx-2 flex">
              {imageColumns.map((column, columnIndex) => (
                <EditorImageGallery
                  key={columnIndex}
                  columnData={column}
                  openModalWithImage={openModalWithImage}
                  uploadImageLoading={isLoading}
                />
              ))}
            </div>
          )}
        </div>
        {!isDesktopView && (
          <div className="w-full justify-center pt-2">
            {entries && entries.length === 0 ? (
              <div className="mt-20 text-center">
                <p className="text-lg text-gray-700">
                  No Edited Images to display 😞
                </p>
                <p className="text-md mt-2 text-gray-500">
                  Start by uploading images to see them here!
                </p>
              </div>
            ) : (
              <ImageCard
                generationName="AI Editor"
                generations={entries}
                handleCopy={handleCopy}
                handleDownload={handleDownload}
                handleHookDeletionById={handleDelete}
                isDownloadPopupVisible={isDownloadPopupVisible}
                selectedHookForDownload={selectedHookForDownload}
                downloadButtonRef={downloadButtonRef}
                downloadImage={downloadImage}
                setIsDownloadPopupVisible={setIsDownloadPopupVisible}
                // submitFormVideo={submitFormVideo}
                showGenerationId={false}
                handleEdit={handleEditImage}
                uploadImageLoading={isEditing}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AiEditor;
