import React from "react";
import { HookData } from "@/pages/apps/magic-hooks"; // Adjust the import based on your actual file structure

type ImageGalleryProps = {
  columnData: any[];
  openModalWithImage: (id: string) => void;
  uploadImageLoading?: boolean;
};

const EditorImageGallery: React.FC<ImageGalleryProps> = ({
  columnData,
  openModalWithImage,
  uploadImageLoading,
}) => {
  return (
    <div className="w-1/3 p-2">
      {columnData.map((hook, index) => (
        <img
          key={hook._id}
          src={
            hook.editedUrl
              ? hook.editedUrl
                  .replace("/upload/", "/upload/f_auto,q_auto/")
                  .replace(".png", "")
              : hook.originalUrl
                  .replace("/upload/", "/upload/f_auto,q_auto/")
                  .replace(".png", "")
          }
          alt={`Thumbnail ${index}`}
          className={`$ mb-4 w-full cursor-pointer rounded-lg object-cover ${
            uploadImageLoading ? "animate-pulse opacity-50" : ""
          }`}
          onClick={() => openModalWithImage(hook._id)}
        />
      ))}
    </div>
  );
};

export default EditorImageGallery;
