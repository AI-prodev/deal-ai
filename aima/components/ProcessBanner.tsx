import React from "react";

interface IProcessBannerProps {
  description?: string;
}

export const ProcessBanner = ({
  description = "Please wait, this may take up to a minute.",
}: IProcessBannerProps) => {
  return (
    <div className="relative my-4 flex items-center justify-between rounded-md bg-[#3b3f5c] p-4">
      <div className="flex items-center">
        <span className="mr-3 inline-block">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.07868 5.06891C8.87402 1.27893 15.0437 1.31923 18.8622 5.13778C22.6824 8.95797 22.7211 15.1313 18.9262 18.9262C15.1312 22.7211 8.95793 22.6824 5.13774 18.8622C2.87389 16.5984 1.93904 13.5099 2.34047 10.5812C2.39672 10.1708 2.775 9.88377 3.18537 9.94002C3.59575 9.99627 3.88282 10.3745 3.82658 10.7849C3.4866 13.2652 4.27782 15.881 6.1984 17.8016C9.44288 21.0461 14.6664 21.0646 17.8655 17.8655C21.0646 14.6664 21.046 9.44292 17.8015 6.19844C14.5587 2.95561 9.33889 2.93539 6.13935 6.12957L6.88705 6.13333C7.30126 6.13541 7.63535 6.47288 7.63327 6.88709C7.63119 7.3013 7.29372 7.63539 6.87951 7.63331L4.33396 7.62052C3.92269 7.61845 3.58981 7.28556 3.58774 6.8743L3.57495 4.32874C3.57286 3.91454 3.90696 3.57707 4.32117 3.57498C4.73538 3.5729 5.07285 3.907 5.07493 4.32121L5.07868 5.06891ZM11.9999 7.24992C12.4141 7.24992 12.7499 7.58571 12.7499 7.99992V11.6893L15.0302 13.9696C15.3231 14.2625 15.3231 14.7374 15.0302 15.0302C14.7373 15.3231 14.2624 15.3231 13.9696 15.0302L11.2499 12.3106V7.99992C11.2499 7.58571 11.5857 7.24992 11.9999 7.24992Z"
              fill="#FFFFFF"
            />
          </svg>
        </span>
        <div className="text-white">
          <p className="font-semibold">Processing Your Request</p>
          <p className="text-xs">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <div className="flex h-full items-center pr-3">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-white"></div>
        </div>
      </div>
    </div>
  );
};
