import Tippy from "@tippyjs/react";
import React, { useEffect } from "react";

const imageStyles = [
  "Modern",
  "Realistic",
  "Futuristic",
  "Minimalist",
  "Retro",
  "Vintage",
  "8-bit",
  "Classical",
  "Avant-garde",
  "Abstract",
];
const DEFAULT_IMAGE_STYLE = "Realistic";

const ImageStyleSelector = ({ setFieldValue, values, tooltipContent }: any) => {
  const handleToneClick = (imageStyle: string) => {
    setFieldValue("imageStyle", imageStyle);
  };

  useEffect(() => {
    handleToneClick(
      values.imageStyle ? values.imageStyle : DEFAULT_IMAGE_STYLE
    );
  }, []);

  return (
    <div>
      <Tippy content={tooltipContent} placement="top">
        <label
          htmlFor="imageStyle"
          className="block w-fit text-left font-semibold text-white"
        >
          Image style
        </label>
      </Tippy>
      <div className="my-4 flex flex-wrap  justify-start space-x-2">
        {imageStyles.map(imageStyle => (
          <button
            key={imageStyle}
            type="button"
            className={`my-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              values.imageStyle === imageStyle
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-300 text-white hover:bg-gray-100 hover:text-black"
            }`}
            onClick={() => handleToneClick(imageStyle)}
          >
            {imageStyle}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageStyleSelector;
