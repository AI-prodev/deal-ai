import React from "react";

type Props = {
  progress: number;
};

const InstallCircle = ({ progress }: Props) => {
  const radius = 12; // Radius of the circle
  const strokeWidth = 2; // Width of the stroke
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  // Calculate the stroke dashoffset based on the progress
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg
      height={radius * 2}
      width={radius * 2}
      viewBox={`0 0 ${radius * 2} ${radius * 2}`}
    >
      <circle
        stroke="white"
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference + " " + circumference}
        style={{ strokeDashoffset }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      {/* <text x="50%" y="50%" textAnchor="middle" stroke="#51c5cf" strokeWidth="2px" dy=".3em">
        {`${progress}%`}
      </text> */}
    </svg>
  );
};

export default InstallCircle;
