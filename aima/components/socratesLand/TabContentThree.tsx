import React from "react";
import Theses from "@/components/Theses";
import { ThesisData } from "@/interfaces/ThesisData";
import LoadingAnimation from "@/components/LoadingAnimation";
import { ThesisBuildingProgress } from "../ThesisBuildingProgress";

interface TabContentThreeProps {
  thesisDone: boolean;
  thesis: ThesisData[];
  progressCss: string;
  minutes: number;
  seconds: number;
}

const TabContentThree: React.FC<TabContentThreeProps> = ({
  thesisDone,
  thesis,
  progressCss,
  minutes,
  seconds,
}) => {
  // ... (Content of Tab 3 goes here)
  if (thesisDone) {
    return (
      <div className="mb-5 flex w-full flex-wrap justify-center">
        <div className="relative mt-8 rounded-md border border-gray-500/20 p-6 pt-12 shadow-[rgb(31_45_61_/_10%)_0px_2px_10px_1px] dark:shadow-[0_2px_11px_0_rgb(6_8_24_/_39%)]">
          <div className="absolute -top-8 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-md bg-primary text-white-light ltr:left-6 rtl:right-6">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.5 19.5H9.5M14.5 19.5C14.5 18.7865 14.5 18.4297 14.5381 18.193C14.6609 17.4296 14.6824 17.3815 15.1692 16.7807C15.3201 16.5945 15.8805 16.0927 17.0012 15.0892C18.5349 13.7159 19.5 11.7206 19.5 9.5C19.5 8.62341 19.3496 7.78195 19.0732 7M14.5 19.5C14.5 20.4346 14.5 20.9019 14.299 21.25C14.1674 21.478 13.978 21.6674 13.75 21.799C13.4019 22 12.9346 22 12 22C11.0654 22 10.5981 22 10.25 21.799C10.022 21.6674 9.83261 21.478 9.70096 21.25C9.5 20.9019 9.5 20.4346 9.5 19.5M9.5 19.5C9.5 18.7865 9.5 18.4297 9.46192 18.193C9.3391 17.4296 9.31762 17.3815 8.83082 16.7807C8.67987 16.5945 8.11945 16.0927 6.99876 15.0892C5.4651 13.7159 4.5 11.7206 4.5 9.5C4.5 5.35786 7.85786 2 12 2C13.3637 2 14.6423 2.36394 15.7442 3"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M12.7857 8.5L10.6428 11.5H13.6428L11.5 14.5"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h5 className="mb-3.5 text-lg font-semibold text-dark dark:text-white-light">
            Your Theses are Ready
          </h5>
          {thesis && <Theses theses={thesis} land />}
        </div>
      </div>
    );
  } else {
    return (
      <ThesisBuildingProgress
        minutes={minutes}
        seconds={seconds}
        progressCss={progressCss}
      />
      // <div>
      //   <h5 className="mb-3 text-lg font-semibold dark:text-white-light">
      //     Building thesis...
      //   </h5>
      //   <LoadingAnimation className="mb-5 max-w-[9rem]" />
      //   <p className="mb-3 text-lg font-semibold dark:text-white-light">{`About ${minutes}m ${seconds}s remaining`}</p>
      //   <div
      //     className={progressCss}
      //     style={{
      //       backgroundImage:
      //         "linear-gradient(45deg,hsla(0,0%,100%,.15) 25%,transparent 0,transparent 50%,hsla(0,0%,100%,.15) 0,hsla(0,0%,100%,.15) 75%,transparent 0,transparent)",
      //       backgroundSize: "1rem 1rem",
      //     }}
      //   ></div>
      // </div>
    );
  }
};

export default TabContentThree;
