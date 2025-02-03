import Tippy from "@tippyjs/react";
import React, { useEffect } from "react";

const imageTypes = [
  "Photograph",
  "Illustration",
  "Digital Artwork",
  "Cartoon",
  "Drawing",
  "Painting",
  "Sculpture",
];
const DEFAULT_IMAGE_TYPE = "Photograph";

const ImageTypeSelectorAdSocial = ({
  setFieldValue,
  values,
  tooltipContent,
}: any) => {
  const handleToneClick = (imageType: string) => {
    setFieldValue("imageType", imageType);
  };

  useEffect(() => {
    handleToneClick(values.imageType ? values.imageType : DEFAULT_IMAGE_TYPE);
  }, []);

  return (
    <div>
      <Tippy content={tooltipContent} placement="top">
        <label
          htmlFor="imageType"
          className="block w-fit text-left font-semibold text-white"
        >
          Image type
        </label>
      </Tippy>
      <div className="my-4 flex flex-wrap  justify-start space-x-2">
        {imageTypes.map(imageType => (
          <button
            key={imageType}
            type="button"
            className={`my-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              values.imageType === imageType
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-300 text-white hover:bg-gray-100 hover:text-black"
            }`}
            onClick={() => handleToneClick(imageType)}
          >
            {imageType}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageTypeSelectorAdSocial;
