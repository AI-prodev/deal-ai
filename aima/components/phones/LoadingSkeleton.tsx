interface LoadingSkeletonProps {
  skeletonCount?: number;
  skeletonHeight?: number;
  skeletonWidth?: string | number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  skeletonCount = 3,
  skeletonHeight = 4,
  skeletonWidth = 24,
}) => {
  return (
    <div>
      {Array(skeletonCount)
        .fill(null)
        .map((_, idx) => (
          <div key={idx} className="animate-pulse">
            <div
              className={`mb-2 block text-sm font-bold text-white h-${skeletonHeight} w-${skeletonWidth} rounded bg-gray-200`}
            />
          </div>
        ))}
    </div>
  );
};

export default LoadingSkeleton;
