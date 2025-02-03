import React, { useState } from "react";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { useUploadOriginalImagesMutation } from "@/store/features/aiEditorApi";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

interface AiEditorUploadProps {
  images: any[];
  setImages: React.Dispatch<React.SetStateAction<any[]>>;
  maxNumber?: number;
}

const AiEditorUpload: React.FC<AiEditorUploadProps> = ({
  images,
  setImages,
  maxNumber = 5,
}) => {
  const [uploadOriginalImages, { isLoading }] =
    useUploadOriginalImagesMutation();
  const [uploading, setUploading] = useState(false);

  const onChange = (
    imageList: ImageListType,
    addUpdateIndex: number[] | undefined
  ) => {
    setImages(imageList as never[]);
  };

  const handleUpload = async () => {
    setUploading(true);
    const formData = new FormData();
    images.forEach(image => {
      formData.append("images", image.file);
    });

    try {
      await uploadOriginalImages(formData).unwrap();
      showSuccessToast({ title: "Images uploaded successfully!" });
      setImages([]);
    } catch (error: any) {
      showErrorToast(
        error.data.message ? error.data.message : "Error uploading images"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full rounded-lg bg-black p-5 shadow-md md:w-1/2 ">
      <div className="flex flex-col items-center justify-center">
        <ImageUploading
          multiple
          value={images}
          onChange={onChange}
          maxNumber={maxNumber}
          //max file size 10MB
          maxFileSize={10000000}
        >
          {({
            imageList,
            onImageUpload,
            onImageRemove,
            dragProps,
            isDragging,
          }) => (
            <div className="upload__image-wrapper w-full text-center">
              <div
                {...dragProps}
                className={`flex w-full flex-col items-center justify-center border-2 border-dashed py-10 ${
                  isDragging
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-600 bg-black"
                } cursor-pointer rounded-lg`}
                onClick={onImageUpload}
              >
                <p className="text-gray-400">Click or Drag and Drop here</p>
                <p className="text-xs text-gray-400">
                  (Up to five images at a time)
                </p>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                {imageList.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.dataURL}
                      alt=""
                      className="mx-auto max-h-60 rounded-lg"
                    />
                    <button
                      className="custom-file-container__image-clear absolute left-0 top-0 block w-fit rounded-full bg-dark-light p-0.5 dark:bg-dark dark:text-white-dark"
                      onClick={() => onImageRemove(index)}
                      title="Remove"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              {uploading && (
                <div className="mt-4">
                  <span className="inline-block h-3 w-3 animate-ping rounded-full bg-white ltr:mr-4 rtl:ml-4"></span>
                  Uploading images...
                </div>
              )}
              <button
                onClick={handleUpload}
                disabled={isLoading || uploading || !images.length}
                className="mt-4 rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:bg-blue-300"
              >
                Upload Images
              </button>
            </div>
          )}
        </ImageUploading>
      </div>
    </div>
  );
};

export default AiEditorUpload;
