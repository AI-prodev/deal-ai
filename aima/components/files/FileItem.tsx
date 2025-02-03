import { timeAgo } from "@/utils/timeAgo";
import { CSSProperties, useEffect, useMemo, useState } from "react";

import {
  DownloadSVG,
  FileAppSVG,
  FileFolderSVG,
  ShareSVG,
} from "../icons/SVGData";
import { IFile } from "@/interfaces/IFile";
import { IFolder } from "@/interfaces/IFolder";
import { formatBytes } from "@/utils/bytes";
import NewNameModal from "./NewNameModal";
import { createPortal } from "react-dom";
import { getFileIcon } from "./files-utils";
import FilesDropdown from "./files-drop-down";
import { FileMoveRequest, FileRequest } from "./file-type";
import { useShareFile } from "../vault/hooks/useShareFile";
import { useFileDownload } from "../vault/hooks/useDownloadFile";
import { useDrag, useDrop } from "react-dnd";

type Props = {
  type: "folder" | "file";
  item: IFile | IFolder;
  onRequestCopy?: ({ item, type }: FileRequest) => void;
  onRequestDelete: ({ item, type }: FileRequest) => void;
  onNameChange: (newName: string) => void;
  handleFileMove: ({ fileId, folderId, type }: FileMoveRequest) => void;
};
function selectBackgroundColor(isActive: boolean): CSSProperties {
  if (isActive) {
    return {
      transition: "background-color 0.5s ease-out",
      backgroundColor: "#bad8f4",
    };
  } else {
    return {};
  }
}
const FileItem: React.FC<Props> = ({
  type,
  item,
  onRequestCopy,
  onRequestDelete,
  onNameChange,
  handleFileMove,
}) => {
  const IS_LIGHT_MODE = true;
  const [showFile, setShowFile] = useState(false);
  const [dragStyle, setDragStyle] = useState<CSSProperties>({});
  const { handleShareClick } = useShareFile(item._id);
  const [isNewNameModalOpen, setIsNewNameModalOpen] = useState(false);
  const { handleDownloadItem, downloadUrlData, downloadUrl } = useFileDownload(
    type,
    item,
    showFile
  );

  const [collected, drag, dragPreview] = useDrag(() => ({
    type: "file",
    item: { id: item._id, type },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult) {
        setDragStyle({
          transition: "background-color 2s ease-out",
          background: "#bad8f4",
        });
      }
    },
  }));
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "file",
      drop: (dargItem: { id: string; type: "folder" | "file" }) => {
        handleFileMove({
          fileId: dargItem.id,
          folderId: item._id,
          type: dargItem.type,
        });
      },
      collect: (monitor: any) => ({
        isOver: monitor.isOver(),
      }),
    }),
    []
  );
  const style: CSSProperties = selectBackgroundColor(isOver);
  useEffect(() => {
    const handleKeyPress = (event: any) => {
      if (event.key === "Escape" && showFile) {
        setShowFile(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [showFile]);

  const handleNewNameModalClose = () => {
    setIsNewNameModalOpen(false);
  };

  const handleShowFile = () => {
    setShowFile(true);
  };

  const icon = useMemo(() => {
    if (!item || !type) {
      return null;
    }

    if (type === "folder") {
      return <FileFolderSVG className={`text-yellow-500 h-4 w-4`} />;
    } else if (type === "file") {
      return getFileIcon((item as IFile).mimeType);
    }

    return (
      <FileAppSVG className={`${IS_LIGHT_MODE && `text-black`} h-4 w-4`} />
    );
  }, [item, type]);

  const iframeAllowed = useMemo(() => {
    if (!item || !type) {
      return null;
    }

    if (type === "folder") {
      return false;
    } else if (type === "file") {
      if ((item as IFile).mimeType.endsWith("/pdf")) {
        return true;
      } else if (
        (item as IFile).mimeType !== "text/csv" &&
        (item as IFile).mimeType.startsWith("text/")
      ) {
        return true;
      } else if (
        (item as IFile).mimeType.includes(
          "openxmlformats-officedocument.wordprocessingml"
        ) ||
        (item as IFile).mimeType.includes("iwork-pages")
      ) {
        return false;
      } else if ((item as IFile).mimeType.startsWith("image/")) {
        return true;
      } else if ((item as IFile).mimeType.startsWith("video/")) {
        return true;
      } else if ((item as IFile).mimeType.startsWith("audio/")) {
        return true;
      } else if (
        (item as IFile).mimeType.includes("iwork-numbers") ||
        (item as IFile).mimeType.includes(
          "openxmlformats-officedocument.spreadsheetml"
        )
      ) {
        return false;
      } else if (
        (item as IFile).mimeType.includes("iwork-keynote") ||
        (item as IFile).mimeType.includes(
          "openxmlformats-officedocument.presentationml"
        )
      ) {
        return false;
      } else if ((item as IFile).mimeType.startsWith("application/")) {
        return false;
      }
    }

    return false;
  }, [item, type]);
  const handelRequestCopy = () => {
    if (onRequestCopy) {
      onRequestCopy({ item, type });
    }
  };
  const handelRequestDelete = () => {
    onRequestDelete({ item, type });
  };
  return (
    <>
      <div
        ref={type === "folder" ? drop : null}
        style={type === "folder" ? { ...style } : { ...dragStyle }}
        onDoubleClick={type === "folder" ? handleDownloadItem : handleShowFile}
        className={`flex flex-col md:flex-row items-center p-2 ${IS_LIGHT_MODE ? "hover:bg-gray-200" : "hover:bg-gray-700"} select-none cursor-pointer`}
      >
        <span>{icon}</span>
        <span ref={drag} className="text-black flex-grow ml-2 mt-3 md:mt-0">
          {item.displayName}
        </span>
        <div className="flex justify-between mt-3 md:mt-0 w-full md:w-72 max-w-full">
          <div className="text-gray-500 text-sm w-32">
            {timeAgo(item.createdAt)}
          </div>
          <div className="text-gray-500 text-sm flex w-24">
            {type === "file" ? formatBytes((item as IFile).size) : "—"}
          </div>
          <div className="dropdown mr-3 flex justify-end">
            <FilesDropdown
              isLightMode={IS_LIGHT_MODE}
              handleDownloadItem={handleDownloadItem}
              setIsNewNameModalOpen={setIsNewNameModalOpen}
              onRequestCopy={handelRequestCopy}
              handleShareClick={handleShareClick}
              onRequestDelete={handelRequestDelete}
              type={type}
            />
          </div>
        </div>{" "}
        .
      </div>
      <NewNameModal
        itemId={item._id}
        type={type}
        currentName={item.displayName}
        isOpen={isNewNameModalOpen}
        onRequestClose={handleNewNameModalClose}
        onNameChanged={newName => onNameChange(newName)}
      />
      {showFile &&
        downloadUrlData &&
        createPortal(
          <div
            className="absolute inset-0 bg-[#000000CC] flex items-center justify-center"
            onClick={() => setShowFile(false)}
          >
            <div className="absolute top-4 left-4 text-white flex items-center">
              <div>
                <button
                  className="rounded-full hover:bg-[#FFFFFF22] flex items-center justify-center w-10 h-10"
                  onClick={() => setShowFile(false)}
                >
                  &larr;
                </button>
              </div>
              <div className="ml-2 scale-125">{icon}</div>
              <div className="ml-3">{item.displayName}</div>
            </div>
            <div className="absolute top-4 right-4 text-white flex items-center">
              <div>
                <button
                  className="rounded-full hover:bg-[#FFFFFF22] flex items-center justify-center w-10 h-10"
                  title="Download"
                  onClick={e => {
                    downloadUrl(downloadUrlData.signedUrl);
                    e.stopPropagation();
                  }}
                >
                  <DownloadSVG className="text-white w-6 h-6" />
                </button>
              </div>
              <div>
                <button
                  className="ml-2 rounded-full hover:bg-[#FFFFFF22] flex items-center justify-center w-10 h-10"
                  title="Share"
                  onClick={e => {
                    handleShareClick();
                    e.stopPropagation();
                  }}
                >
                  <ShareSVG className="text-white w-6 h-6" />
                </button>
              </div>
            </div>
            {iframeAllowed && (
              <iframe
                src={downloadUrlData.signedUrl}
                className="w-9/12 h-4/6 xl:w-[50%]"
              />
            )}
            {!iframeAllowed && (
              <div>
                <div className="bg-[#666666EE] rounded-lg shadow-lg p-8 m-4 max-w-xs max-h-64 flex flex-col items-center justify-center">
                  <div className="text-white">No preview available</div>
                  <button
                    className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex"
                    onClick={e => {
                      downloadUrl(downloadUrlData.signedUrl);
                      e.stopPropagation();
                    }}
                  >
                    <DownloadSVG className="text-white w-6 h-6" />
                    <span className="ml-2">Download</span>
                  </button>
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
};

export default FileItem;
