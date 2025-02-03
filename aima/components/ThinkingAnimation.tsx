import React from "react";
import { useLottie } from "lottie-react";
import thinking from "../public/assets/images/processing.json";

interface ThinkingAnimationProps {
  className?: string;
  width?: number;
  height?: number;
}

const ThinkingAnimation: React.FC<ThinkingAnimationProps> = ({
  className,
  width = 200,
  height = 200,
}) => {
  const options = {
    animationData: thinking,
    loop: true,
    speed: 0.2,
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

export default ThinkingAnimation;
