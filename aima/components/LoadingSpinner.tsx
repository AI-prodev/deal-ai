import { LoadingSpinnerSVG } from "@/components/icons/SVGData";
import React from "react";

interface ILoadingSpinnerProps {
  className?: string;
  svgClassName?: string;
}

const LoadingSpinner = ({ className, svgClassName }: ILoadingSpinnerProps) => (
  <div className={`animate-spin w-5 h-5 mx-auto ${className}`}>
    <LoadingSpinnerSVG className={svgClassName} />
  </div>
);

export default LoadingSpinner;
