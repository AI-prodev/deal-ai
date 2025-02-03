import { getFileIcon } from "@/components/files/files-utils";
import React from "react";
type FilePreviewProps = {
  fileType: string;
};
const FilePreview = ({ fileType }: FilePreviewProps) => {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="w-full max-w-[150px]">
        {getFileIcon(fileType, "text-red-500")}
      </div>
    </div>
  );
};

export default FilePreview;
