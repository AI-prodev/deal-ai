import HeroImageForms from "@/components/marketingHooks/HeroImageForms";
import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";
import { HeroImageResults } from "@/components/marketingHooks/HeroImageResults";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { createFunnelApi } from "@/store/features/projectApi";

import useServerTokenTracking, {
  deleteHookById,
} from "@/hooks/useServerTokenTracking";
import {
  useEndImageToVideoRequestMutation,
  useQueryImageToVideoRequestMutation,
  useStartImageToVideoRequestMutation,
} from "@/store/features/imageToVideoApi ";
import { Dialog } from "@headlessui/react";
import MostRecentImage from "@/components/marketingHooks/MostRecentImage";
import {
  useRateCreationMutation,
  useUploadEditedImageMutation,
} from "@/store/features/marketingHooksApi";
import CustomPinturaEditorModal from "@/components/CustomPinturaEditorModal";
import "@pqina/pintura/pintura.css";
import {
  useDeleteSpecificCreationMutation,
  useDeleteSpecificGenerationMutation,
  useGetSpecifcAppsPojectAppNameQuery,
  useLoadDefaultAppsProjectQuery,
} from "@/store/features/appsProjectApi";
import { DefaultProjectData } from "@/interfaces/IAppProject";
import LoadingSkeleton from "@/components/ai-editor/LoadingSkeleton";
import ProjectsDropdown from "@/components/ai-apps/ProjectsDropdown";
import Head from "next/head";

export type HookData = { id: number; hooks: any[]; language?: string };

type Props = {};

const HeroImage = (props: Props) => {
  const appName = "hero-img";
  const router = useRouter();
  const funnelId = router.query.funnelId as string;

  const { data: funnel } = createFunnelApi.useGetFunnelQuery(
    { funnelId },
    { skip: !funnelId }
  );
  const {
    data: defaultProjectData,
    refetch: refetchDefaultProject,
    isLoading: isDefaultProjectLoading,
  } = useLoadDefaultAppsProjectQuery("") as {
    data: DefaultProjectData;
    refetch: () => void;
    isLoading: boolean;
  };

  const [projectId, setProjectId] = useState<string>(
    localStorage.getItem("selectedProjectId") || defaultProjectData?._id
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setProjectId(
        localStorage.getItem("selectedProjectId") || defaultProjectData?._id
      );
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [defaultProjectData]);
  const {
    data: appData,
    refetch: refetchAppData,
    isLoading: isAppDataFetching,
  } = useGetSpecifcAppsPojectAppNameQuery(
    {
      projectId: projectId,

      appName: appName,
    },
    { skip: !projectId }
  );

  const [isAppDataLoading, setIsAppDataLoading] = useState(false);
  const [hooksData, setHooksData] = useState<HookData[]>([]);
  const [hookRatings, setHookRatings] = useState<{ [key: string]: number }>({});
  const [hookRatingsId, setHookRatingsId] = useState<{
    [key: string]: number;
  }>({});
  const formatHookRatingData = () => {
    return Object.entries(hookRatings)
      .map(
        ([hookText, rating]) =>
          `Hook: ${hookText}\nRating: ${rating} star${rating > 1 ? "s" : ""}`
      )
      .join("\n\n");
  };

  // Start
  const [genModalOpen, setGenModalOpen] = useState(false);
  const [copiedData, setCopiedData] = useState("");

  const [videoImageUrl, setVideoImageUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState<{ url: string; id: string }>({
    url: "",
    id: "",
  });
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);

  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [videoRatings, setVideoRatings] = useState<{ [key: string]: number }>(
    {}
  );

  const [rateCreation] = useRateCreationMutation();
  const handleCopy = async (hook: any, isEditedImagePreviewOpen: boolean) => {
    try {
      const imageUrl = isEditedImagePreviewOpen ? hook.editedUrl : hook.url;

      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
    } catch (error) {
      console.error("Error copying image to clipboard:", error);
      alert("Failed to copy image to clipboard");
    }
  };

  const handleRatingChange = async (
    hookText: string,
    newRating: number,
    hookId: string
  ) => {
    setLoadingStates({ ...loadingStates, [hookId]: true });

    setHookRatings({ ...hookRatings, [hookText]: newRating });
    setHookRatingsId({ ...hookRatingsId, [hookId]: newRating });
    try {
      const response = await rateCreation({
        creationId: hookId,
        rating: newRating,
      }).unwrap();
      refetchAppData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStates({ ...loadingStates, [hookId]: false });
    }
  };

  const tokenKey = "heroRequestToken";
  // useEffect(() => {
  //   const savedGenerations: HookData[] = JSON.parse(
  //     localStorage.getItem(`${tokenKey}Generations`) || "[]",
  //   );

  //   const newHookRatings: { [key: string]: number } = {};
  //   savedGenerations.forEach((generation) => {
  //     generation.hooks.forEach((hook) => {
  //       if (hook.rating !== undefined) {
  //         const hookKey = hook.url;
  //         newHookRatings[hookKey] = hook.rating;
  //       }
  //     });
  //   });

  //   setHookRatings(newHookRatings);
  // }, []);

  // const handleHookDeleteationById = (generationId: number, hookId: string) => {
  //   deleteHookById(generationId, hookId, tokenKey);
  //   const savedGenerations = JSON.parse(
  //     localStorage.getItem(`${tokenKey}Generations`) || "[]",
  //   ) as HookData[];

  //   const reversedGenerations = [...savedGenerations].sort(
  //     (a, b) => b.id - a.id,
  //   );

  //   setHooksData(reversedGenerations);
  // };

  const [deleteSpecificGeneration, { isLoading: isCreationDeleting }] =
    useDeleteSpecificGenerationMutation();
  const handleHookDeletionById = async (
    generationNumber: number,
    creationId: string
  ) => {
    try {
      await deleteSpecificGeneration({
        projectId,
        appName,
        generationNumber,
      }).unwrap();
      refetchAppData();
    } catch (error) {
      console.error("Failed to delete generation:", error);
    }
  };
  const tokenKeyVideo = "heroImageVideoRequestToken";
  const [startAdVideoRequest, { isLoading: isStartingVideo }] =
    useStartImageToVideoRequestMutation();
  const [queryAdVideoRequest] = useQueryImageToVideoRequestMutation();
  const [endAdVideoRequest] = useEndImageToVideoRequestMutation();

  const handleEndResponse = (data: any) => {
    setVideoUrl({ url: data.response[0].url, id: data.response[0].id });
    setIsProcessingVideo(false);
    setIsModalOpen(false);
  };

  const {
    startAndTrack: StartAndTrackVideo,
    isLoading: isLoadingVideo,
    generationCount,
    stopTracking: stopTrackingVideo,
  } = useServerTokenTracking({
    //@ts-ignore
    startRequest: startAdVideoRequest,
    //@ts-ignore
    queryRequest: queryAdVideoRequest,
    //@ts-ignore
    endRequest: endAdVideoRequest,
    tokenKey: tokenKeyVideo,
    onEndResponse: handleEndResponse,
    geneationType: false,
    isLocalOnEndResponse: true,
  });

  const submitFormVideo = async (url: string) => {
    setVideoImageUrl(url);
    setIsProcessingVideo(true);
    const submissionData = {
      url,
    };
    await StartAndTrackVideo(submissionData);
  };

  const downloadVideo = async (videoUrl: string) => {
    const response = await fetch(videoUrl);
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deal-ai-social-ad.mp4`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  useEffect(() => {
    if (isLoadingVideo) {
      setIsModalOpen(true);
      setGenModalOpen(false);
    }
    if (videoUrl.url) {
      setIsModalOpen(true);
    }
  }, [isLoadingVideo, videoUrl]);

  const handleVideoRatingChange = async (newRating: number, hookId: string) => {
    setLoadingStates({ ...loadingStates, [hookId]: true });

    setVideoRatings({ ...videoRatings, [hookId]: newRating });
    try {
      const response = await rateCreation({
        creationId: hookId,
        rating: newRating,
      }).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStates({ ...loadingStates, [hookId]: false });
    }
  };

  const [isDownloadPopupVisible, setIsDownloadPopupVisible] =
    useState<boolean>(false);
  const [selectedHookForDownload, setSelectedHookForDownload] = useState<
    any | null
  >(null);
  const downloadButtonRef = useRef<HTMLButtonElement>(null);

  const handleDownload = (hook: HookData) => {
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
      // Construct the URL with the desired format and quality
      let imageUrl = isEditedImagePreviewOpen
        ? selectedHookForDownload.editedUrl
        : selectedHookForDownload.url;
      imageUrl = imageUrl.replace("/upload/", `/upload/q_${quality}/`);
      imageUrl = imageUrl.replace(/\.(png|jpg|webp)$/, `.${format}`);

      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Download the image
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const mostRecentImage = hooksData.slice(0, 1);
  const secondImage = hooksData.slice(1, 3);
  const otherImages = hooksData.slice(3);

  const navigateImages = (direction: string) => {
    const allImages = [...mostRecentImage, ...secondImage, ...otherImages];

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

  const [isPinturaOpen, setIsPinturaOpen] = useState(false);
  const [editableImage, setEditableImage] = useState<string | null>(null);
  const [editableImageId, setEditableImageId] = useState<string | null>(null);
  const handleEditImage = (hook: any, isEditedImagePreviewOpen: boolean) => {
    setEditableImage(isEditedImagePreviewOpen ? hook.editedUrl : hook.url);
    setIsPinturaOpen(true);
    setEditableImageId(hook.id);
  };

  const [uploadEditedImage, { isLoading: uploadImageLoading }] =
    useUploadEditedImageMutation();
  const onEditComplete = async (image: any) => {
    setIsPinturaOpen(false);
    setEditableImage(null);

    const file = image.dest;
    if (!(file instanceof Blob)) {
      console.error("Edited image is not a Blob");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("creationId", editableImageId as string);
    try {
      const uploadResponse = await uploadEditedImage(formData).unwrap();
      console.error("Uploaded image URL:", uploadResponse.url);

      const updatedEditedImageUrl = uploadResponse.url;

      if (updatedEditedImageUrl) {
        refetchAppData().unwrap();
      }
      // const updatedHooksData = hooksData.map(generation => ({
      //     ...generation,
      //     hooks: generation.hooks.map(hook =>
      //         (
      //             hook.editedUrl
      //                 ? hook.editedUrl === editableImage ||
      //                   hook.url === editableImage
      //                 : hook.url === editableImage
      //         )
      //             ? { ...hook, editedUrl: updatedEditedImageUrl }
      //             : hook
      //     ),
      // }));

      // setHooksData(updatedHooksData);

      // localStorage.setItem(
      //     `${tokenKey}Generations`,
      //     JSON.stringify(updatedHooksData)
      // );
    } catch (error) {
      console.error("Error uploading edited image:", error);
    }
  };
  return (
    <>
      <Head>
        <title>Hero Images</title>
      </Head>
      <div className="p-3">
        <div
          className={`flex ${mostRecentImage.length <= 0 ? "justify-center" : "justify-start"}`}
        >
          <div className="w-full max-w-[780px]">
            {funnel && (
              <ul className="mb-5 flex space-x-2 rtl:space-x-reverse">
                <li>
                  <Link
                    href="/projects"
                    className="text-primary hover:underline"
                  >
                    Projects
                  </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                  <Link
                    href={`/projects/${funnel.project._id}`}
                    className="text-primary hover:underline"
                  >
                    {funnel.project.title}
                  </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                  <Link
                    href={`/projects/${funnel?.project._id}/funnels/${funnel._id}`}
                    className="text-primary hover:underline"
                  >
                    {funnel.title}
                  </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                  <span>Hero Images</span>
                </li>
              </ul>
            )}

            <ul className="mb-5 flex space-x-2 rtl:space-x-reverse">
              <li>
                <Link
                  href="/apps/ai-apps"
                  className="text-md text-primary hover:underline"
                >
                  &larr; Back
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Dialog
          open={isPinturaOpen}
          onClose={() => setIsPinturaOpen(false)}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className={`flex min-h-screen items-center   `}>
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

        <div className="md:flex  gap-4  justify-center ">
          <div
            className={`my-3 justify-center px-2 pt-2 md:max-w-[780px] ${mostRecentImage.length > 0 ? "md:w-1/2" : "w-full"}`}
          >
            <div className=" flex  justify-center">
              <div className="flex items-center mb-6 w-full max-w-[780px]   ">
                <h2 className=" text-2xl font-bold">Hero Images</h2>
                <div className="mx-4">
                  <ProjectsDropdown setProjectId={setProjectId} />
                </div>
              </div>
            </div>
            <HeroImageForms
              setHooksData={setHooksData}
              hooksData={hooksData}
              formatHookRatingData={formatHookRatingData}
              hookRatingsId={hookRatingsId}
              appName={appName}
              setAppDataLoading={setIsAppDataLoading}
              projectId={projectId}
            />
          </div>
          {isDesktopView && (
            <div>
              {mostRecentImage.length > 0 && (
                <>
                  <MostRecentImage
                    generationName=" Your Hero Image"
                    generations={mostRecentImage}
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
                </>
              )}
            </div>
          )}
        </div>

        {(isAppDataLoading || isDefaultProjectLoading) && <LoadingSkeleton />}
        <div className="w-full justify-center pt-2">
          <HeroImageResults
            hooksData={hooksData}
            hookRatings={hookRatings}
            setHookRatings={setHookRatings}
            hookRatingsId={hookRatingsId}
            setHookRatingsId={setHookRatingsId}
            setHooksData={setHooksData}
            handleCopy={handleCopy}
            handleRatingChange={handleRatingChange}
            handleHookDeletionById={handleHookDeletionById}
            handleDownload={handleDownload}
            handleVideoRatingChange={handleVideoRatingChange}
            submitFormVideo={submitFormVideo}
            downloadImage={downloadImage}
            videoRatings={videoRatings}
            loadingStates={loadingStates}
            videoImageUrl={videoImageUrl}
            isLoadingVideo={isLoadingVideo}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            videoUrl={videoUrl}
            downloadButtonRef={downloadButtonRef}
            setVideoUrl={setVideoUrl}
            isDownloadPopupVisible={isDownloadPopupVisible}
            setIsDownloadPopupVisible={setIsDownloadPopupVisible}
            downloadVideo={downloadVideo}
            selectedHookForDownload={selectedHookForDownload}
            setGenModalOpen={setGenModalOpen}
            genModalOpen={genModalOpen}
            handleEditImage={handleEditImage}
            uploadImageLoading={uploadImageLoading}
            stopTrackingVideo={stopTrackingVideo}
          />
        </div>
      </div>
    </>
  );
};

export default withAuth(HeroImage, USER_ROLES, "ai-platform");
