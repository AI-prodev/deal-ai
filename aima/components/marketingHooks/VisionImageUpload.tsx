import React, { useEffect, useRef, useState } from "react";
import ImageUploading, { ImageListType } from "react-images-uploading";

interface VisionImageUploadProps {
  startImageRequest: (formData: FormData) => Promise<any>;
  queryImageRequest: (token: any) => Promise<any>;
  endImageRequest: (token: any) => Promise<any>;
  handleEndResponse: (data: any) => void;
  images: ImageListType;
  setImages: (images: ImageListType) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  imageUrl?: string;
}

const VisionImageUpload: React.FC<VisionImageUploadProps> = ({
  startImageRequest,
  queryImageRequest,
  endImageRequest,
  handleEndResponse,
  images,
  setImages,
  isLoading,
  setIsLoading,
  imageUrl,
}) => {
  const maxNumber = 20;
  const [token, setToken] = useState<string | null>(null);
  const trackingInProgress = useRef(false);
  useEffect(() => {
    const savedToken = localStorage.getItem("imageUploadToken");
    if (savedToken) {
      setToken(savedToken);
      trackProgress(savedToken);
    }
  }, []);

  const trackProgress = async (token: string) => {
    if (trackingInProgress.current) {
      return; // Prevent multiple invocations
    }
    trackingInProgress.current = true;
    let completed = false;
    let delay = 2000;
    const maxDelay = 30000;

    const timeoutId = setTimeout(() => {
      localStorage.removeItem("imageUploadToken");
    }, 180000);

    while (!completed) {
      try {
        setIsLoading(true);
        const statusResult = await queryImageRequest({ token });

        if (statusResult.data.status === "completed") {
          completed = true;

          const endResult = await endImageRequest({ token });
          setIsLoading(false);
          handleEndResponse(endResult);
        } else if (statusResult.status === "error") {
          completed = true;
          setIsLoading(false);
          setImages([]);
          console.error("Error:", statusResult.error);
          localStorage.removeItem("imageUploadToken");
        } else {
          delay = Math.min(delay * 1.5, maxDelay);
        }
      } catch (error) {
        console.error("Error tracking progress:", error);
        localStorage.removeItem("imageUploadToken");
        completed = true;
        setIsLoading(false);
        setImages([]);
      }
      if (completed) {
        trackingInProgress.current = false;
        clearTimeout(timeoutId);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  };

  const handleStartImageRequest = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    setIsLoading(true);
    try {
      const startResponse = await startImageRequest(formData);
      if (startResponse.data.token) {
        localStorage.setItem("imageUploadToken", startResponse.data.token);
        setToken(startResponse.data.token);
        trackProgress(startResponse.data.token);
      }
    } catch (error) {
      setIsLoading(false);
      setImages([]);
      console.error("Error starting image request:", error);
    }
  };

  const onChange = (imageList: ImageListType) => {
    setImages(imageList);
    if (imageList.length > 0) {
      handleStartImageRequest(imageList[0].file as File);
    }
  };

  return (
    <div className="custom-file-container">
      <ImageUploading value={images} onChange={onChange} maxNumber={maxNumber}>
        {({ imageList, onImageUpload }) => (
          <div className="upload__image-wrapper">
            <button
              type="button"
              disabled={isLoading}
              className="custom-file-container__custom-file__custom-file-control"
              onClick={onImageUpload}
              style={{ position: "unset", width: "100%" }}
            >
              Choose File...
            </button>

            {images.length >= 0 && imageUrl && !isLoading ? (
              <div className="pt-10">
                <img
                  src={imageUrl}
                  alt="Upload Preview"
                  className={`m-auto h-auto max-h-48 max-w-full ${
                    isLoading && "animate-pulse"
                  } object-contain`}
                />
              </div>
            ) : (
              <>
                {imageList.map((image, index) => (
                  <div key={index} className="pt-5">
                    <img
                      src={image.dataURL}
                      alt="Upload Preview"
                      className={`m-auto h-auto max-h-48 max-w-full ${
                        isLoading && "animate-pulse"
                      } object-contain`}
                    />
                  </div>
                ))}
              </>
            )}
            {/* {isLoading && (
              <div className="flex items-center justify-center">
                <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
              </div>
            )} */}
          </div>
        )}
      </ImageUploading>
    </div>
  );
};

export default VisionImageUpload;
