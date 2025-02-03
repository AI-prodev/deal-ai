import React, { useState } from "react";
import FileTitle from "./file-title";
import FilePreview from "./file-preview";
import FileMetadata from "./file-metadate";
import { IFile } from "@/interfaces/IFile";
import { IFolder } from "@/interfaces/IFolder";
import { FoldersFilesSorting } from "./vault-type";
import { useFileDownload } from "./hooks/useDownloadFile";
export type VaultIconViewProps = {
  item: IFile | IFolder;
  type: FoldersFilesSorting;
};
const VaultIconView = ({ item, type }: VaultIconViewProps) => {
  const [showFile, setShowFile] = useState(false);
  const { handleDownloadItem, downloadUrlData, downloadUrl } = useFileDownload(
    type,
    item,
    showFile
  );

  return (
    <div
      onDoubleClick={() =>
        type === FoldersFilesSorting.folder && handleDownloadItem()
      }
      className="flex flex-col bg-primary-light p-4 m-2 w-[30%]"
    >
      <FileTitle
        fileId={item._id}
        title={item.displayName}
        fileType={
          type === FoldersFilesSorting.file
            ? (item as IFile)?.mimeType
            : FoldersFilesSorting.folder
        }
      />
      <FilePreview
        fileType={
          type === FoldersFilesSorting.file
            ? (item as IFile)?.mimeType
            : FoldersFilesSorting.folder
        }
      />
      <FileMetadata
        timestamp={item.createdAt}
        size={type === FoldersFilesSorting.file ? (item as IFile)?.size : null}
      />
    </div>
  );
};

export default VaultIconView;
