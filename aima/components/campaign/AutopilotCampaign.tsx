import React, { useState, useEffect } from "react";
import { ICampaign } from "@/interfaces/ICampaign";

type AutopilotCampaignProps = {
  campaign: ICampaign;
};

const AutopilotCampaign: React.FC<AutopilotCampaignProps> = ({ campaign }) => {
  const [isAutopilotActive, setIsAutopilotActive] = useState(false);
  const [controlAd, setControlAd] = useState(null);
  const [testAd, setTestAd] = useState(null);
  const [progress, setProgress] = useState(20);

  useEffect(() => {
    if (isAutopilotActive) {
    }
  }, [isAutopilotActive]);

  const handleAutopilotToggle = () => {
    setIsAutopilotActive(!isAutopilotActive);
  };

  return (
    <div className="rounded bg-black p-4 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Autopilot Mode</h2>
        <button
          className={`rounded px-4 py-2 text-white ${
            isAutopilotActive ? "bg-red-500" : "bg-green-500"
          }`}
          onClick={handleAutopilotToggle}
        >
          {isAutopilotActive ? "Stop Autopilot" : "Start Autopilot"}
        </button>
      </div>

      {isAutopilotActive && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded border border-gray-500 p-3">
              <h3 className="text-center font-semibold text-gray-200">
                Control Ad
              </h3>
              <img
                src="https://via.placeholder.com/300x200"
                alt="Control Ad"
                className="mx-auto mt-2"
              />
              <p className="mt-2 text-center text-gray-300">
                Demo of a control ad.
              </p>
            </div>

            <div className="rounded border border-gray-500 p-3">
              <h3 className="text-center font-semibold text-gray-200">
                Test Ad
              </h3>
              <img
                src="https://via.placeholder.com/300x200"
                alt="Test Ad"
                className="mx-auto mt-2"
              />
              <p className="mt-2 text-center text-gray-300">
                Demo of a test ad.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-gray-300">Campaign Progress: {progress}%</p>
            <div className="h-2.5 w-full rounded-full bg-gray-700 dark:bg-gray-700">
              <div
                className="h-2.5 rounded-full bg-green-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutopilotCampaign;
