import { IFile } from "@/interfaces/IFile";
import VaultIconView from "./vault-icon-view";
import { FoldersFilesSorting } from "./vault-type";
import { IFolder } from "@/interfaces/IFolder";
import { ReactNode } from "react";
import FolderContainer from "./folder-container";
import { FileMoveRequest } from "../files/file-type";
import LoadingAnimation from "../LoadingAnimation";
type VaultIconViewContainerProp = {
  files: IFile[];
  folders: IFolder[];
  sortingType: FoldersFilesSorting;
  handleFileMove: ({ fileId, folderId, type }: FileMoveRequest) => void;
  isUploading: boolean;
};
const VaultIconViewContainer = ({
  files,
  folders,
  sortingType,
  handleFileMove,
  isUploading,
}: VaultIconViewContainerProp) => {
  const renderFiles = () => {
    return files.map((file, index) => (
      <VaultIconView
        item={file}
        type={sortingType}
        key={`${index}files${file.displayName}`}
      />
    ));
  };
  const renderFolder = (): ReactNode[] => {
    return folders.map((folder, index) => (
      <FolderContainer
        folder={folder}
        key={`${index}${folder._id}fd`}
        handleFileMove={handleFileMove}
      />
    ));
  };
  return (
    <div className={`relative`} style={{ height: "calc(100vh - 300px)" }}>
      <div className=" flex flex-col">
        <div className=" flex flex-wrap">{renderFolder()} </div>
        <div className=" flex flex-wrap">{renderFiles()}</div>;
        {isUploading && (
          <div
            className="absolute flex justify-center items-center bg-[#00000066] z-50"
            style={{ inset: "0 0 -40px 0" }}
          >
            <LoadingAnimation width={100} height={100} />
          </div>
        )}
      </div>
    </div>
  );
};

export default VaultIconViewContainer;
