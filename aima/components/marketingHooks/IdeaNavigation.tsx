// IdeaNavigation.tsx
import React from "react";

interface IdeaNavigationProps {
  totalIdeas: number;
  onIdeaChange: (index: number) => void;
  currentIdeaIndex: number;
}

const IdeaNavigation: React.FC<IdeaNavigationProps> = ({
  totalIdeas,
  onIdeaChange,
  currentIdeaIndex,
}) => {
  const handleBackClick = () => {
    onIdeaChange(-1);
  };

  const handleForwardClick = () => {
    onIdeaChange(1);
  };

  return (
    <div className="flex items-center  space-x-4">
      <button
        className="p-2 disabled:cursor-not-allowed"
        onClick={handleBackClick}
        disabled={currentIdeaIndex === 0}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={currentIdeaIndex === 0 ? "gray" : "currentColor"}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.53033 3.46967C7.82322 3.76256 7.82322 4.23744 7.53033 4.53033L5.81066 6.25H15C18.1756 6.25 20.75 8.82436 20.75 12C20.75 15.1756 18.1756 17.75 15 17.75H8.00001C7.58579 17.75 7.25001 17.4142 7.25001 17C7.25001 16.5858 7.58579 16.25 8.00001 16.25H15C17.3472 16.25 19.25 14.3472 19.25 12C19.25 9.65279 17.3472 7.75 15 7.75H5.81066L7.53033 9.46967C7.82322 9.76256 7.82322 10.2374 7.53033 10.5303C7.23744 10.8232 6.76256 10.8232 6.46967 10.5303L3.46967 7.53033C3.17678 7.23744 3.17678 6.76256 3.46967 6.46967L6.46967 3.46967C6.76256 3.17678 7.23744 3.17678 7.53033 3.46967Z"
            fill={currentIdeaIndex === 0 ? "gray" : "#FFFFFF"}
          />
        </svg>
      </button>
      <span>
        {currentIdeaIndex + 1}/{totalIdeas}
      </span>
      <button
        className="p-2 text-white disabled:cursor-not-allowed disabled:text-gray-300"
        onClick={handleForwardClick}
        disabled={currentIdeaIndex === totalIdeas - 1}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={currentIdeaIndex === totalIdeas - 1 ? "gray" : "currentColor"}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.4697 3.46967C16.7626 3.17678 17.2374 3.17678 17.5303 3.46967L20.5303 6.46967C20.8232 6.76256 20.8232 7.23744 20.5303 7.53033L17.5303 10.5303C17.2374 10.8232 16.7626 10.8232 16.4697 10.5303C16.1768 10.2374 16.1768 9.76256 16.4697 9.46967L18.1893 7.75H9.00001C6.6528 7.75 4.75 9.65279 4.75 12C4.75 14.3472 6.65279 16.25 9 16.25H16C16.4142 16.25 16.75 16.5858 16.75 17C16.75 17.4142 16.4142 17.75 16 17.75H9C5.82436 17.75 3.25 15.1756 3.25 12C3.25 8.82436 5.82437 6.25 9.00001 6.25H18.1893L16.4697 4.53033C16.1768 4.23744 16.1768 3.76256 16.4697 3.46967Z"
            fill={currentIdeaIndex === totalIdeas - 1 ? "gray" : "#FFFFFF"}
          />
        </svg>
      </button>
    </div>
  );
};

export default IdeaNavigation;
