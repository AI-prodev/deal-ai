import React, { useState, useEffect } from "react";
import LoadingAnimation from "./LoadingAnimation";

interface Props {
  minutes: number;
  seconds: number;
  progressCss: string;
  title?: string;
}

const useCountdownTimer = (minutes: number, seconds: number) => {
  const totalTimeInSeconds = minutes * 60 + seconds;
  const [remainingTimeInSeconds, setRemainingTimeInSeconds] =
    useState(totalTimeInSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTimeInSeconds(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const progressPercent =
    ((totalTimeInSeconds - remainingTimeInSeconds) / totalTimeInSeconds) * 100;
  let remainingMinutes = Math.floor(remainingTimeInSeconds / 60);
  let remainingSeconds = remainingTimeInSeconds % 60;

  if (remainingTimeInSeconds <= 0) {
    remainingMinutes = 0;
    remainingSeconds = 0;
  }

  return {
    progressPercent,
    remainingMinutes,
    remainingSeconds,
    remainingTimeInSeconds,
  };
};

export const ThesisBuildingProgress: React.FC<Props> = ({
  minutes,
  seconds,
  progressCss,
  title,
}) => {
  const {
    progressPercent,
    remainingMinutes,
    remainingSeconds,
    remainingTimeInSeconds,
  } = useCountdownTimer(minutes, seconds);

  const remainingTimeText =
    remainingTimeInSeconds <= 0
      ? "Results available soon..."
      : `About ${remainingMinutes}m ${remainingSeconds}s remaining`;

  return (
    <div>
      <h5 className="mb-3 text-lg font-semibold dark:text-white-light">
        {title ? title : " Creating..."}
      </h5>
      <LoadingAnimation className="mb-5 max-w-[9rem]" />
      <p className="mb-3 text-lg font-semibold dark:text-white-light">
        {remainingTimeText}
      </p>
      <div
        className={progressCss}
        style={{
          backgroundImage:
            "linear-gradient(45deg,hsla(0,0%,100%,.15) 25%,transparent 0,transparent 50%,hsla(0,0%,100%,.15) 0,hsla(0,0%,100%,.15) 75%,transparent 0,transparent)",
          backgroundSize: "1rem 1rem",
        }}
      ></div>
    </div>
  );
};

export const MinimalBuildingProgress: React.FC<Props> = ({
  minutes,
  seconds,
  progressCss,
  title,
}) => {
  const {
    progressPercent,
    remainingMinutes,
    remainingSeconds,
    remainingTimeInSeconds,
  } = useCountdownTimer(minutes, seconds);

  const remainingTimeText =
    remainingTimeInSeconds <= 0
      ? "Results available soon..."
      : `About ${remainingMinutes}m ${remainingSeconds}s remaining`;

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-black">
        {remainingTimeText}
      </p>
      <div
        className={progressCss}
        style={{
          backgroundImage:
            "linear-gradient(45deg,hsla(0,0%,100%,.15) 25%,transparent 0,transparent 50%,hsla(0,0%,100%,.15) 0,hsla(0,0%,100%,.15) 75%,transparent 0,transparent)",
          backgroundSize: "1rem 1rem",
        }}
      ></div>
    </div>
  );
};
