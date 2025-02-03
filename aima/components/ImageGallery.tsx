import React from "react";
import { HookData } from "@/pages/apps/magic-hooks"; // Adjust the import based on your actual file structure

type ImageGalleryProps = {
  columnData: HookData[];
  openModalWithImage: (id: number) => void;
  uploadImageLoading?: boolean;
};

const ImageGallery: React.FC<ImageGalleryProps> = ({
  columnData,
  openModalWithImage,
  uploadImageLoading,
}) => {
  return (
    <div className="w-1/3 p-2">
      {columnData.map((hook, index) => (
        <img
          key={hook.id}
          src={
            hook.hooks[0].editedUrl
              ? hook.hooks[0].editedUrl
                  .replace("/upload/", "/upload/f_auto,q_auto/")
                  .replace(".png", "")
              : hook.hooks[0].url
                  .replace("/upload/", "/upload/f_auto,q_auto/")
                  .replace(".png", "")
          }
          alt={`Thumbnail ${index}`}
          className={`$ mb-4 w-full cursor-pointer rounded-lg object-cover ${
            uploadImageLoading ? "animate-pulse opacity-50" : ""
          }`}
          onClick={() => openModalWithImage(hook.id)}
        />
      ))}
    </div>
  );
};

export default ImageGallery;
