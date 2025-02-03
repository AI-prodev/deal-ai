import React, { FC, useState } from "react";
import FileDropzone from "@/components/files/FileDropzone";
import { IFolder } from "@/interfaces/IFolder";
import { IFile } from "@/interfaces/IFile";
import { FileImageSVG, ThreeBarsSVG } from "@/components/icons/SVGData";
import VaultButtons, { ButtonItem } from "./vault-buttons";
import VaultIconViewContainer from "./vault-icon-view-continer";
import {
  FileMoveRequest,
  FileRequest,
  FileRequestNameChange,
} from "@/components/files/file-type";
import { FoldersFilesSorting, ValueLayoutType } from "./vault-type";

type VaultLayoutProps = {
  isLoaded: boolean;
  uploadingFile: File | null;
  isCopyingFile: boolean;
  folders: IFolder[];
  files: IFile[];
  setUploadFileQueue: React.Dispatch<React.SetStateAction<File[]>>;
  handleRequestCopy: ({ item, type }: FileRequest) => void;
  handleRequestDelete: ({ item, type }: FileRequest) => void;
  handleNameChange: ({ item, type, newName }: FileRequestNameChange) => void;
  handleFileMove: ({ fileId, folderId }: FileMoveRequest) => void;
};
const VaultLayout = ({
  isLoaded,
  uploadingFile,
  isCopyingFile,
  folders,
  files,
  setUploadFileQueue,
  handleRequestCopy,
  handleRequestDelete,
  handleNameChange,
  handleFileMove,
}: VaultLayoutProps) => {
  const [vaultLayoutSetting, setVaultLayoutSetting] = useState<ValueLayoutType>(
    ValueLayoutType.list
  );
  const [folderFilesSorting, setFolderFilesSorting] =
    useState<FoldersFilesSorting>(FoldersFilesSorting.file);

  const handelLayoutChange = (layout: ValueLayoutType) => {
    setVaultLayoutSetting(layout);
  };
  const handelSortChange = (sortBy: FoldersFilesSorting) => {
    setFolderFilesSorting(sortBy);
  };
  const buttons: ButtonItem<ValueLayoutType>[] = [
    { name: ValueLayoutType.list, Icon: ThreeBarsSVG },
    { name: ValueLayoutType.icon, Icon: FileImageSVG },
  ];
  // const folderFilesButtons: ButtonItem<FoldersFilesSorting>[] = [
  //   {
  //     name: FoldersFilesSorting.file,
  //     Icon: FileImageSVG,
  //   },
  //   {
  //     name: FoldersFilesSorting.folder,
  //     Icon: FolderSVG as FC<SvgIconProps>,
  //   },
  // ];
  return (
    <div>
      <div className="flex flex-row-reverse">
        {/* <VaultButtons<ValueLayoutType>
          width={24}
          buttons={buttons}
          onClick={handelLayoutChange}
        /> */}
        {/* <div className="grow">
                    <div className="w-[20%]">
                        <VaultButtons<FoldersFilesSorting>
                            width={30}
                            buttons={folderFilesButtons}
                            onClick={handelSortChange}
                        />
                    </div>
                </div> */}
      </div>
      {vaultLayoutSetting === ValueLayoutType.list ? (
        <FileDropzone
          isLoaded={isLoaded}
          isUploading={!!uploadingFile || isCopyingFile}
          folders={folders}
          files={files}
          onFileDropped={(file: File) =>
            setUploadFileQueue((prev: File[]) => [...prev, file])
          }
          onRequestCopy={handleRequestCopy}
          onRequestDelete={handleRequestDelete}
          onNameChange={handleNameChange}
          handleFileMove={handleFileMove}
        />
      ) : (
        <VaultIconViewContainer
          files={files}
          folders={folders}
          sortingType={folderFilesSorting}
          handleFileMove={handleFileMove}
          isUploading={!!uploadingFile || isCopyingFile}
        />
      )}
    </div>
  );
};

export default VaultLayout;
