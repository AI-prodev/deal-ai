import React, { useEffect, useRef, useState } from "react";
import RangeSlider from "./RangeSlider";
import Tippy from "@tippyjs/react";
interface DownloadPopupProps {
  buttonRef: React.RefObject<HTMLButtonElement>;
  onDownload: (format: "png" | "jpg" | "webp", quality: number) => void;
  onCancel: () => void;
  isDisabled?: boolean;
}
const DownloadPopup: React.FC<DownloadPopupProps> = ({
  buttonRef,
  onDownload,
  onCancel,
  isDisabled,
}) => {
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const [quality, setQuality] = useState<number>(80);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setPopupStyle({
        position: "absolute",
        bottom: `150%`,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [buttonRef, popupRef, onCancel]);

  const formatButtonClass = (format: "png" | "jpg" | "webp") => {
    switch (format) {
      case "png":
        return "bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700";
      case "jpg":
        return "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700";
      case "webp":
        return "bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700";
      default:
        return "";
    }
  };

  const formatInfo = {
    png: "Highest quality with larger file size",
    jpg: "Widely compatible with smaller file sizes. Good for photographs and everyday use",
    webp: "Modern format balancing quality and file size. May not be supported on all platforms",
  };

  return (
    <div
      style={popupStyle}
      ref={popupRef}
      className="w-54 relative z-50 rounded-lg bg-black p-6 shadow-xl md:w-64 md:p-5"
    >
      <h2 className="text-center text-lg font-semibold text-white">
        Download Image As
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4">
        {(["png", "jpg", "webp"] as const).map(format => (
          <div key={format} className="flex items-center justify-between">
            <button
              disabled={isDisabled}
              onClick={() => onDownload(format, quality)}
              className={`${formatButtonClass(
                format
              )} flex-grow rounded px-4 py-2 font-bold text-white shadow-lg transition duration-300`}
            >
              {format.toUpperCase()}
            </button>
            <Tippy content={formatInfo[format]}>
              <span className="ml-2 cursor-pointer text-white">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 17.75C12.4142 17.75 12.75 17.4142 12.75 17V11C12.75 10.5858 12.4142 10.25 12 10.25C11.5858 10.25 11.25 10.5858 11.25 11V17C11.25 17.4142 11.5858 17.75 12 17.75Z"
                    fill="#FFFF"
                  />
                  <path
                    d="M12 7C12.5523 7 13 7.44772 13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7Z"
                    fill="#FFFF"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1.25 12C1.25 6.06294 6.06294 1.25 12 1.25C17.9371 1.25 22.75 6.06294 22.75 12C22.75 17.9371 17.9371 22.75 12 22.75C6.06294 22.75 1.25 17.9371 1.25 12ZM12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75Z"
                    fill="#FFFF"
                  />
                </svg>
              </span>
            </Tippy>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <RangeSlider
          label="Quality"
          name="quality"
          min={10}
          max={100}
          showValue={false}
          leftLabel={"10"}
          rightLabel={"100"}
          gradient={true}
          value={quality}
          tooltipContent="Higher values will retain the detail from your image, but the file size will be bigger"
          onChange={(value: any) => setQuality(parseInt(value))}
        />
      </div>
      <button
        onClick={onCancel}
        className="absolute right-2 top-2 rounded-full bg-red-500 p-1 font-bold text-white transition duration-300 hover:bg-red-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default DownloadPopup;
