import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { IFile } from "@/interfaces/IFile";
import { IFolder } from "@/interfaces/IFolder";
import { BigFolderSVG, CopySVG, FileSVG, FolderSVG } from "../icons/SVGData";
import FileItem from "./FileItem";
import LoadingAnimation from "../LoadingAnimation";
import {
  FileMoveRequest,
  FileRequest,
  FileRequestNameChange,
} from "./file-type";

type Props = {
  isLoaded: boolean;
  isUploading: boolean;
  folders: IFolder[];
  files: IFile[];
  onFileDropped: (file: File) => void;
  onRequestCopy: ({ item, type }: FileRequest) => void;
  onRequestDelete: ({ item, type }: FileRequest) => void;
  onNameChange: ({ item, type, newName }: FileRequestNameChange) => void;
  handleFileMove: ({ fileId, folderId }: FileMoveRequest) => void;
};

const FileDropzone: React.FC<Props> = ({
  isLoaded,
  isUploading,
  folders,
  files,
  onFileDropped,
  onRequestCopy,
  onRequestDelete,
  onNameChange,
  handleFileMove,
}: Props) => {
  const IS_LIGHT_MODE = true;
  const [isDragging, setIsDragging] = useState(false);

  const [sort, setSort] = useState("added");
  const dragElement = useRef<{ x: number; y: number }>();
  const sortedFolders = useMemo(() => {
    const newArr = [...folders];
    if (sort === "name" || sort === "-name") {
      newArr.sort(
        (a, b) =>
          (sort === "name" ? -1 : 1) *
          a.displayName.localeCompare(b.displayName)
      );
    } else if (sort === "added" || sort === "-added") {
      newArr.sort(
        (a, b) =>
          (sort === "added" ? -1 : 1) * a.createdAt.localeCompare(b.createdAt)
      );
    }
    return newArr;
  }, [sort, folders]);

  const sortedFiles = useMemo(() => {
    const newArr = [...files];
    if (sort === "name" || sort === "-name") {
      newArr.sort(
        (a, b) =>
          (sort === "name" ? -1 : 1) *
          a.displayName.localeCompare(b.displayName)
      );
    } else if (sort === "added" || sort === "-added") {
      newArr.sort(
        (a, b) =>
          (sort === "added" ? -1 : 1) * a.createdAt.localeCompare(b.createdAt)
      );
    } else if (sort === "size" || sort === "-size") {
      newArr.sort((a, b) => (sort === "size" ? -1 : 1) * (a.size - b.size));
    }
    return newArr;
  }, [sort, files]);

  const handleUpdateSort = (field: "name" | "added" | "size") => {
    if (field === "name") {
      setSort(prev =>
        prev === "name" ? "-name" : prev === "-name" ? "name" : "-" + field
      );
    } else if (field === "added") {
      setSort(prev =>
        prev === "added" ? "-added" : prev === "-added" ? "added" : "-" + field
      );
    } else if (field === "size") {
      setSort(prev =>
        prev === "size" ? "-size" : prev === "-size" ? "size" : "-" + field
      );
    }
  };

  const preventDefault = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  // prevent a missed file drop from opening the file in another tab
  useEffect(() => {
    window.addEventListener("dragover", preventDefault);
    window.addEventListener("drop", preventDefault);

    return () => {
      window.removeEventListener("dragover", preventDefault);
      window.removeEventListener("drop", preventDefault);
    };
  }, [preventDefault]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragElement.current = { x: e.screenX, y: e.screenY };
    const dragType = e.dataTransfer.items[0];
    if (dragType.kind === "string") {
      return;
    }
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (
      dragElement.current?.x !== e.screenX &&
      dragElement.current?.y !== e.screenY
    ) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    for (const file of files) {
      // eslint-disable-next-line no-console
      console.log("File dropped:", file);

      onFileDropped(file);
    }
  };

  return (
    <div
      className={`relative`}
      style={{ height: "calc(100vh - 350px)" }}
      onDragEnter={handleDragOver}
      onDragOver={event => event.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isLoaded &&
        !isUploading &&
        folders.length === 0 &&
        files.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div>
              <BigFolderSVG />
            </div>
            <p className="text-gray-500">Drop files here</p>
            <p className="text-gray-500">Or use the 'Upload Files' button</p>
          </div>
        )}
      {(folders.length > 0 || files.length > 0) && (
        <div className="flex items-center p-2 border-b border-gray-700">
          <div
            className={`${IS_LIGHT_MODE && "text-black"} w-36 md:flex-grow mt-2 md:mt-0`}
          >
            <button onClick={() => handleUpdateSort("name")}>
              Name&nbsp;&nbsp;{sort === "name" && <>&darr;</>}
              {sort === "-name" && <>&uarr;</>}
            </button>
          </div>
          <div className={`${IS_LIGHT_MODE && "text-black"} w-36 mt-2 md:mt-0`}>
            <button onClick={() => handleUpdateSort("added")}>
              Added&nbsp;&nbsp;{sort === "added" && <>&darr;</>}
              {sort === "-added" && <>&uarr;</>}
            </button>
          </div>
          <div className={`${IS_LIGHT_MODE && "text-black"} w-36 mt-2 md:mt-0`}>
            <button onClick={() => handleUpdateSort("size")}>
              Size&nbsp;&nbsp;{sort === "size" && <>&darr;</>}
              {sort === "-size" && <>&uarr;</>}
            </button>
          </div>
        </div>
      )}
      <div
        style={{ height: "calc(100vh - 350px)" }}
        className={`divide-y divide-gray-700 overflow-y-auto ${(sortedFolders.length > 0 || sortedFiles.length > 0) && "border-b border-gray-200"}`}
      >
        {sortedFolders.map(folder => (
          <FileItem
            key={folder._id}
            item={folder}
            type="folder"
            onRequestDelete={() =>
              onRequestDelete({ item: folder, type: "folder" })
            }
            onNameChange={newName =>
              onNameChange({
                item: folder,
                type: "folder",
                newName,
              })
            }
            handleFileMove={handleFileMove}
          />
        ))}
        {sortedFiles.map(file => (
          <FileItem
            key={file._id}
            item={file}
            type="file"
            onRequestCopy={() => onRequestCopy({ item: file, type: "file" })}
            onRequestDelete={() =>
              onRequestDelete({ item: file, type: "file" })
            }
            onNameChange={newName =>
              onNameChange({ item: file, type: "file", newName })
            }
            handleFileMove={handleFileMove}
          />
        ))}
      </div>
      {isUploading && (
        <div
          className="absolute flex justify-center items-center bg-[#00000066] z-50"
          style={{ inset: "0 0 -40px 0" }}
        >
          <LoadingAnimation width={100} height={100} />
        </div>
      )}
      {isDragging && (
        <div
          className="absolute flex items-center justify-center bg-blue-100 bg-opacity-50 border-2 border-blue-500"
          style={{ inset: "0 0 -40px 0" }}
        >
          <div className="bg-white rounded-3xl p-4 text-blue-500 font-semibold flex items-center">
            <CopySVG />
            <div className="ml-2">Drop files to upload</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(FileDropzone);
