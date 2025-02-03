import {
  FileRequest,
  FileRequestNameChange,
} from "@/components/files/file-type";
import FilesDropdown from "@/components/files/files-drop-down";
import { getFileIcon } from "@/components/files/files-utils";
import React from "react";
import { FoldersFilesSorting } from "./vault-type";
import { useDrag } from "react-dnd";
type FileTitleProps = {
  title: string;
  fileType: string;
  fileId: string;
};
const FileTitle = ({ title, fileType, fileId }: FileTitleProps) => {
  const [collected, drag, dragPreview] = useDrag(() => ({
    type: "file",
    item: { id: fileId },
  }));
  return (
    <div ref={drag} className="flex justify-between">
      <div className="flex items-center">
        {FoldersFilesSorting.folder !== fileType && getFileIcon(fileType)}
        <div className="text-black flex-grow ml-2 mt-3 md:mt-0"> {title}</div>
      </div>
      <FilesDropdown
        isLightMode={true}
        handleDownloadItem={function (): void {
          throw new Error("Function not implemented.");
        }}
        setIsNewNameModalOpen={function (isName: boolean): void {
          throw new Error("Function not implemented.");
        }}
        onRequestCopy={undefined}
        handleShareClick={function (...{ item, type }: FileRequest): void {
          throw new Error("Function not implemented.");
        }}
        onRequestDelete={function (
          ...{ item, type, newName }: FileRequestNameChange
        ): void {
          throw new Error("Function not implemented.");
        }}
        type={""}
      />
    </div>
  );
};

export default FileTitle;
