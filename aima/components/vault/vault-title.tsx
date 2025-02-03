import React, { CSSProperties, useMemo } from "react";
import Link from "next/link";
import { IFolder } from "@/interfaces/IFolder";
import VaultTitleName from "./vault-title-name";
import { useDrop } from "react-dnd";
import { FileMoveRequest } from "../files/file-type";
type VaultTitleProps = {
  IS_LIGHT_MODE: boolean;
  folder: IFolder;
  rootFolder: IFolder;
  handleMoveFile: ({ fileId, folderId }: FileMoveRequest) => void;
};
function selectBackgroundColor(isActive: boolean): CSSProperties {
  if (isActive) {
    return {
      border: "1px solid  #5190ef",
      borderRadius: "15px",
      paddingInline: "8px",
      paddingBlock: "2px",
      transition: "background-color 0.5s ease-out",
      backgroundColor: "#E1E5EA",
    };
  } else {
    return {
      border: "1px solid rgba(255,255,255,.5)",
      borderRadius: "15px",
      paddingInline: "8px",
      paddingBlock: "2px",
    };
  }
}
const VaultTitle = ({
  IS_LIGHT_MODE,
  folder,
  rootFolder,
  handleMoveFile,
}: VaultTitleProps) => {
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "file",
      drop: item =>
        handleDrop(
          rootFolder._id,
          item as { id: string; type: "file" | "folder" }
        ),
      collect: (monitor: any) => ({
        isOver: monitor.isOver(),
      }),
    }),
    []
  );
  const style: CSSProperties = selectBackgroundColor(isOver);
  const handleDrop = (
    folderId: string,
    item: { id: string; type: "folder" | "file" }
  ) => {
    handleMoveFile({ folderId, fileId: item.id, type: item.type });
  };
  const pageTitle = useMemo(() => {
    let foldersNames;
    if (
      rootFolder &&
      folder &&
      folder.parentFolder &&
      rootFolder._id === folder.parentFolder
    ) {
      foldersNames = (
        <VaultTitleName
          isSubFolders={false}
          displayName={folder.displayName}
          onDrop={item => handleDrop(folder._id, item)}
        />
      );
    } else if (
      rootFolder &&
      folder &&
      folder.parentFolder &&
      rootFolder._id !== folder.parentFolder
    ) {
      foldersNames = (
        <VaultTitleName
          isSubFolders={true}
          displayName={folder.displayName}
          onDrop={item => handleDrop(folder._id, item)}
        />
      );
    }
    return foldersNames;
  }, [rootFolder, folder]);
  return (
    <h2 className={`ml-3 text-2xl font-bold ${IS_LIGHT_MODE && "text-black"}`}>
      <Link
        style={{ ...style }}
        ref={drop}
        href="/apps/vault"
        className="hover:underline hover:bg-blue-100"
      >
        Vault
      </Link>
      {pageTitle}
    </h2>
  );
};

export default VaultTitle;
