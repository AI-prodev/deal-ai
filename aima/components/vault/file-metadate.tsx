import { formatBytes } from "@/utils/bytes";
import { timeAgo } from "@/utils/timeAgo";
import React from "react";
type FileMetadata = {
  timestamp: string;
  size: number | null;
};
const FileMetadata = ({ timestamp, size }: FileMetadata) => {
  return (
    <div className="flex justify-between">
      <span>{timeAgo(timestamp)}</span>
      {size && <span>{formatBytes(size)}</span>}
    </div>
  );
};

export default FileMetadata;
