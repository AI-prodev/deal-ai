import React from "react";

interface LoadingSkeletonProps {
  containerClass?: string;
  avatarSkeletonClass?: string;
  textSkeletonClass?: string;
  barSkeletonClass?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  containerClass = "mb-5 flex items-center justify-center px-6 animate-pulse",
  avatarSkeletonClass = "mb-2 inline-block rounded-full bg-gray-500 p-3",
  textSkeletonClass = "mb-2 ml-5 h-4 bg-gray-500 w-20",
  barSkeletonClass = "h-4 bg-gray-500",
}) => {
  const bars = [
    { width: "w-full", margin: "mb-4" },
    { width: "w-3/4", margin: "mb-2" },
    { width: "w-full", margin: "mt-4 mb-2" },
    { width: "w-3/4" },
  ];

  return (
    <div className={containerClass} aria-hidden="true">
      <div className="grow rounded border border-[#1b2e4b] p-10 shadow-md">
        <div className="py-7 px-6">
          <div className="justify-left mb-2 flex items-center">
            <div className={avatarSkeletonClass}></div>
            <div className={textSkeletonClass}></div>
          </div>
          {bars.map((bar, index) => (
            <div
              key={index}
              className={`${barSkeletonClass} ${bar.width} ${bar.margin}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
