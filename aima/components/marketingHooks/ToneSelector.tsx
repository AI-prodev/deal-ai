import Tippy from "@tippyjs/react";
import { set } from "lodash";
import React, { useEffect } from "react";

const tones = ["Inspirational", "Factual", "Fun", "Urgent", "Fear-Based"];
const DEFAULT_TONE = "Inspirational";

const ToneSelector = ({
  setFieldValue,
  values,
  tooltipContent,
  defaultAdditionalInfo,
  defaultTone,
}: any) => {
  const handleToneClick = (tone: string) => {
    setFieldValue("tone", tone);
    if (tone !== "Urgent" && tone !== "Fear-Based") {
      setFieldValue("toneAdditionalInfo", "");
    } else {
      if (defaultAdditionalInfo && tone === defaultTone) {
        setFieldValue("toneAdditionalInfo", defaultAdditionalInfo);
      } else {
        setFieldValue("toneAdditionalInfo", "");
      }
    }
  };

  useEffect(() => {
    handleToneClick(values.tone ? values.tone : DEFAULT_TONE);
  }, []);

  return (
    <div>
      <Tippy content={tooltipContent} placement="top">
        <label
          htmlFor="tone"
          className="block w-fit text-left font-semibold text-white"
        >
          Tone
        </label>
      </Tippy>
      <div className="my-4 flex flex-wrap  justify-start space-x-2">
        {tones.map(tone => (
          <button
            key={tone}
            type="button"
            className={`my-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              values.tone === tone
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-300 text-white hover:bg-gray-100 hover:text-black"
            }`}
            onClick={() => handleToneClick(tone)}
          >
            {tone}
          </button>
        ))}
      </div>

      {(values.tone === "Urgent" || values.tone === "Fear-Based") && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-white">
            {values.tone === "Urgent"
              ? "When is the deadline?"
              : "What is the main fear that the customer may have that this product resolves?"}
          </label>
          <textarea
            className="form-textarea mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            rows={3}
            name="toneAdditionalInfo"
            value={values.toneAdditionalInfo}
            onChange={e => setFieldValue("toneAdditionalInfo", e.target.value)}
          ></textarea>
        </div>
      )}
    </div>
  );
};

export default ToneSelector;
