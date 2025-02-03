import Tippy from "@tippyjs/react";
import React, { useEffect } from "react";

const aspectRatios = [
  "Portrait (Stories / Reel)",
  "Square (Feed)",
  "Landscape (YouTube cover)",
];
const DEFAULT_ASPECT_RATIO = "Portrait (Stories / Reel)";

const AspectRatioSelectorAdSocial = ({
  setFieldValue,
  values,
  tooltipContent,
}: any) => {
  const handleToneClick = (aspectRatio: string) => {
    setFieldValue("aspectRatio", aspectRatio);
  };

  useEffect(() => {
    handleToneClick(
      values.aspectRatio ? values.aspectRatio : DEFAULT_ASPECT_RATIO
    );
  }, []);

  return (
    <div>
      <Tippy content={tooltipContent} placement="top">
        <label
          htmlFor="aspectRatio"
          className="block w-fit text-left font-semibold text-white"
        >
          Aspect ratio
        </label>
      </Tippy>
      <div className="my-4 flex flex-wrap  justify-start space-x-2">
        {aspectRatios.map(aspectRatio => (
          <button
            key={aspectRatio}
            type="button"
            className={`my-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              values.aspectRatio === aspectRatio
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-300 text-white hover:bg-gray-100 hover:text-black"
            }`}
            onClick={() => handleToneClick(aspectRatio)}
          >
            {aspectRatio}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AspectRatioSelectorAdSocial;
