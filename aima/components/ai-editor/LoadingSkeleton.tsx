import React from "react";

const LoadingSkeleton = () => {
  const columns = 4;

  const placeholdersPerColumn = 2;

  const getRandomHeight = () => {
    const minHeight = 200;
    const maxHeight = 250;

    return Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
  };

  return (
    <div className="grid animate-pulse grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: columns }, (_, columnIndex) => (
        <div key={columnIndex} className="grid gap-4">
          {Array.from(
            { length: placeholdersPerColumn },
            (_, placeholderIndex) => (
              <div
                key={placeholderIndex}
                className={`rounded-lg bg-gray-300`}
                style={{ height: `${getRandomHeight()}px` }}
              ></div>
            )
          )}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
