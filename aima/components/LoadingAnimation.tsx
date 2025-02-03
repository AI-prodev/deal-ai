import React from "react";
import { useLottie } from "lottie-react";
import loading from "../public/assets/images/deal.ai-animation.json";

interface LoadingAnimationProps {
  className?: string;
  width?: number;
  height?: number;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  className,
  width = 200,
  height = 200,
}) => {
  const options = {
    animationData: loading,
    loop: true,
    speed: 1,
  };

  const { View } = useLottie(options);

  return (
    <div
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: "inline-block",
      }}
    >
      {View}
    </div>
  );
};

export default LoadingAnimation;
