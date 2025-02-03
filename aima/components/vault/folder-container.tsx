import React, { CSSProperties } from "react";
import { FolderSVG } from "../icons/SVGData";
import { useDrop } from "react-dnd";
import { FileMoveRequest } from "../files/file-type";
import { useFileDownload } from "./hooks/useDownloadFile";
import { IFolder } from "@/interfaces/IFolder";
type FolderContainerProps = {
  folder: IFolder;
  handleFileMove: ({ fileId, folderId }: FileMoveRequest) => void;
};

function selectBackgroundColor(isActive: boolean): CSSProperties {
  if (isActive) {
    return {
      border: "2px solid  #5190ef",
      color: "#222",
    };
  } else {
    return {
      color: "#222",
    };
  }
}
const FolderContainer = ({ folder, handleFileMove }: FolderContainerProps) => {
  const { handleDownloadItem } = useFileDownload("folder", folder, false);
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "file",
      drop: (item: { id: string }) =>
        handleFileMove({ fileId: item.id, folderId: folder._id, type: "file" }),
      collect: (monitor: any) => ({
        isOver: monitor.isOver(),
      }),
    }),
    []
  );
  const style: CSSProperties = selectBackgroundColor(isOver);
  return (
    <div
      onDoubleClick={() => handleDownloadItem()}
      ref={drop}
      style={{ ...style }}
      className={`${isOver ? "border-2 border-blue-500" : ""}flex h-[50px]  w-[20%] bg-primary-light ms-2 me-2 justify-between p-[0.5rem] items-center rounded-[9%]`}
    >
      <FolderSVG />
      <div>{folder.displayName} </div>
    </div>
  );
};

export default FolderContainer;
