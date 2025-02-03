import React from "react";
import { CourseVideoModalProps } from "./CourseVideoModal";

const VimeoOverlay = ({
  vimeoId,
  title,
  isOpen,
  onRequestClose,
}: CourseVideoModalProps) => {
  const handleOverlayClick = (event: any) => {
    if (event.target.id === "overlay") {
      onRequestClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      id="overlay"
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="relative p-4 w-full" style={{ aspectRatio: "16 / 9" }}>
        <div
          onClick={e => e.stopPropagation()}
          className="w-full h-full max-w-2xl max-h-2xl mx-auto"
        >
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?badge=0&autopause=0&player_id=0&app_id=58479`}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            className="w-full h-full"
            title={title}
          />
        </div>
      </div>
    </div>
  );
};

export default VimeoOverlay;
