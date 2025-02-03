import Head from "next/head";
import NewFolderModal from "@/components/files/NewFolderModal";
import { CopySVG } from "@/components/icons/SVGData";
import { IFile } from "@/interfaces/IFile";
import { IFolder } from "@/interfaces/IFolder";
import { createFileAPI } from "@/store/features/fileApi";

import { useRouter } from "next/router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";
import { createProfileAPI } from "@/store/features/profileApi";
import { formatBytes } from "@/utils/bytes";
import {
  FileMoveRequest,
  FileRequest,
  FileRequestNameChange,
} from "@/components/files/file-type";
import VaultLayout from "@/components/vault/vault-layout";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import VaultTitle from "@/components/vault/vault-title";
const Files = () => {
  const IS_LIGHT_MODE = true;
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const { folderId } = router.query;
  const { data: myFileSize, refetch: refetchMyFileSize } =
    createProfileAPI.useGetMyFileSizeQuery();
  const { data: rootFolder } = createFileAPI.useGetFolderQuery({
    folderId: "root",
  });
  const { data: folder } = createFileAPI.useGetFolderQuery({
    folderId: folderId ? (folderId as string) : "root",
  });
  const { data: fetchedFolders, refetch: refetchFolders } =
    createFileAPI.useGetFoldersByFolderQuery(
      { parentFolderId: folder ? folder._id : "" },
      { skip: !folder }
    );
  const { data: fetchedFiles, refetch: refetchFiles } =
    createFileAPI.useGetFilesByFolderQuery(
      { folderId: folder ? folder._id : "" },
      { skip: !folder }
    );
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCopyingFile, setIsCopyingFile] = useState(false);
  const [folders, setFolders] = useState<IFolder[]>([]);
  const [files, setFiles] = useState<IFile[]>([]);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadFileQueue, setUploadFileQueue] = useState<File[]>([]);
  const [
    createFile,
    { data: createFileData, error: createFileError, reset: resetCreateFile },
  ] = createFileAPI.useCreateFileMutation();
  const [copyFile] = createFileAPI.useCopyFileMutation();
  const [deleteFile] = createFileAPI.useDeleteFileMutation();
  const [deleteFolder] = createFileAPI.useDeleteFolderMutation();
  const [moveFile] = createFileAPI.useMoveFileMutation();
  const [moveFolder] = createFileAPI.useMoveFolderMutation();

  useEffect(() => {
    if (!folderId || folderId === folder?._id) {
      try {
        refetchFiles();
      } catch (error) {}
    }
    setFolders([]);
    setFiles([]);
    if (fetchedFolders) {
      refetchFolders();
      setIsLoaded(false);
    }
    if (fetchedFiles) {
      refetchFiles();
      setIsLoaded(false);
    }
  }, [folderId]);

  const handleNewFolderModalClose = () => {
    setIsNewFolderModalOpen(false);
  };

  useEffect(() => {
    if (!fetchedFolders) {
      return;
    }
    setFolders(fetchedFolders);
  }, [fetchedFolders]);

  useEffect(() => {
    if (!fetchedFiles) {
      return;
    }
    setFiles(fetchedFiles);
  }, [fetchedFiles]);

  useEffect(() => {
    if (!fetchedFiles || !fetchedFolders) {
      return;
    }
    setIsLoaded(true);
    refetchMyFileSize();
  }, [fetchedFiles, fetchedFolders]);

  useEffect(() => {
    refetchMyFileSize();
  }, [files, folders]);

  const uploadFile = async (file: File) => {
    try {
      if (!folder || !file) {
        // eslint-disable-next-line no-console
        console.log("No file or folder");
        return;
      }

      setUploadingFile(file);
      createFile({
        folderId: folder._id,
        displayName: file.name,
        mimeType: file.type,
        size: file.size,
      });
    } catch (error: any) {
      console.error(error);
      Swal.mixin({
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 3000,
      }).fire({
        icon: "error",
        title: error?.data?.message || "Unknown error",
        padding: "10px 20px",
      });
    }
  };

  useEffect(() => {
    if (uploadFileQueue.length === 0) {
      return;
    }
    uploadFile(uploadFileQueue[0]);
  }, [uploadFileQueue]);

  useEffect(() => {
    if ((!createFileData && !createFileError) || !uploadingFile) {
      return;
    }

    if (createFileError) {
      console.error("createFileError=", createFileError);
      Swal.mixin({
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 3000,
      }).fire({
        icon: "error",
        title:
          (createFileError as any)?.data?.error ||
          "There was a problem uploading the file",
        padding: "10px 20px",
      });
      setUploadingFile(null);
      resetCreateFile();
      setUploadFileQueue(prev => [...prev.slice(1)]);
    } else if (createFileData) {
      fetch(createFileData.signedUrl, {
        method: "PUT",
        body: uploadingFile,
        headers: {
          "Content-Type": uploadingFile.type,
        },
      })
        .then(res => {
          if (res.status >= 400) {
            res.text().then(resText => console.error("upload error=", resText));
            throw new Error("There was a problem uploading the file");
          }

          setFiles(prev => {
            return [
              {
                _id: createFileData.fileId,
                displayName: uploadingFile.name,
                mimeType: uploadingFile.type || "application/octet-stream",
                size: uploadingFile.size,
                user: "",
                folder: folder?._id || "",
                createdAt: new Date().toISOString(),
              },
              ...prev,
            ];
          });
        })
        .catch((err: any) => {
          console.error("upload err=", err);
          deleteFile({ fileId: createFileData.fileId });
          Swal.mixin({
            toast: true,
            position: "top",
            showConfirmButton: false,
            timer: 3000,
          }).fire({
            icon: "error",
            title:
              (createFileError as any)?.data?.error ||
              "There was a problem uploading the file",
            padding: "10px 20px",
          });
        })
        .finally(() => {
          resetCreateFile();
          setUploadingFile(null);
          setUploadFileQueue(prev => [...prev.slice(1)]);
        });
    }
  }, [createFileData, createFileError, folder, uploadingFile]);

  const handleFileInputChange = (e: any) => {
    if (e?.target?.files) {
      for (const file of e.target.files) {
        setUploadFileQueue(prev => [...prev, file]);
      }
    }
  };

  const handleRequestDelete = async ({ item, type }: FileRequest) => {
    if (
      !confirm(
        `Are you sure you want to delete "${item.displayName}"? You will not be able to restore it.`
      )
    ) {
      return;
    }

    if (type === "file") {
      await deleteFile({ fileId: item._id });
      setFiles(prev => {
        const result: IFile[] = [];
        for (const file of prev) {
          if (file._id !== item._id) {
            result.push(file);
          }
        }
        return result;
      });
      refetchFiles();
    } else if (type === "folder") {
      await deleteFolder({ folderId: item._id });
      setFolders(prev => {
        const result: IFolder[] = [];
        for (const folder of prev) {
          if (folder._id !== item._id) {
            result.push(folder);
          }
        }
        return result;
      });
      refetchFolders();
    }
  };

  const handleRequestCopy = async ({ item, type }: FileRequest) => {
    // files only
    if (type === "file") {
      try {
        setIsCopyingFile(true);

        await copyFile({ fileId: item._id });
        refetchFiles();
      } catch (err) {
        console.error(err);
      } finally {
        setIsCopyingFile(false);
      }
    }
  };
  const handleFileMove = async ({
    fileId,
    folderId,
    type,
  }: FileMoveRequest) => {
    if (type === "file") {
      await moveFile({ fileId, folderId }).finally(() => {
        setIsLoaded(true);
        refetchFiles()
          .unwrap()
          .then(data => setFiles(data));
      });
    }
    if (type === "folder") {
      await moveFolder({ folderId: fileId, parentFolderId: folderId })
        .unwrap()
        .then(data => {
          if (data) {
            setFolders(data);
          }
        });
    }
  };
  const handleNameChange = async ({
    type,
    item,
    newName,
  }: FileRequestNameChange) => {
    if (type === "file") {
      setFiles(prev => {
        const result: IFile[] = [];
        for (const file of prev) {
          if (file._id === item._id) {
            result.push({ ...file, displayName: newName });
          } else {
            result.push(file);
          }
        }
        return result;
      });
    } else if (type === "folder") {
      setFolders(prev => {
        const result: IFolder[] = [];
        for (const folder of prev) {
          if (folder._id === item._id) {
            result.push({ ...folder, displayName: newName });
          } else {
            result.push(folder);
          }
        }
        return result;
      });
    }
  };

  const isRootFolder = useMemo(() => {
    if (rootFolder && folder && rootFolder._id === folder._id) {
      return true;
    }
    return false;
  }, [rootFolder, folder]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Head>
        <title>Vault</title>
      </Head>
      <div className="relative px-0 md:px-3 w-full flex justify-center">
        {IS_LIGHT_MODE && (
          <Head>
            <title>Vault</title>
            <style>
              {`
            body {
              background-color: white !important;
            }
          `}
            </style>
          </Head>
        )}
        {folder && (
          <NewFolderModal
            parentFolderId={folder._id}
            isOpen={isNewFolderModalOpen}
            onRequestClose={handleNewFolderModalClose}
            onFolderCreated={refetchFolders}
          />
        )}
        <div className="w-full max-w-3xl">
          <div className="flex flex-col md:flex-row items-center pt-2 w-full justify-between">
            <div className="flex flex-col justify-center items-center md:items-start">
              <div className="flex items-center">
                <CopySVG
                  className={`h-6 w-6 ${IS_LIGHT_MODE && "text-black"}`}
                />
                {folder && rootFolder && (
                  <VaultTitle
                    folder={folder}
                    rootFolder={rootFolder}
                    IS_LIGHT_MODE={IS_LIGHT_MODE}
                    handleMoveFile={handleFileMove}
                  />
                )}
              </div>
              <div className="mt-1 text-gray-500 text-xs">
                {formatBytes(myFileSize?.fileSize || 0)} of 5TB used (
                {Math.round(
                  ((myFileSize?.fileSize || 0) / 5_000_000_000_000) * 10
                ) / 10}
                % full)
              </div>
            </div>
            <div className="mt-2 md:mt-0 min-w-72 flex justify-center md:justify-end">
              <button
                onClick={() => fileInputRef?.current?.click()}
                className="rounded bg-primary px-4 py-2 text-white"
              >
                + Upload Files
              </button>
              <button
                onClick={e => {
                  setIsNewFolderModalOpen(true);
                  e.preventDefault();
                }}
                className="ml-2 rounded bg-primary px-4 py-2 text-white"
              >
                + New Folder
              </button>
              <input
                onChange={handleFileInputChange}
                multiple={true}
                ref={fileInputRef}
                type="file"
                hidden
              />
            </div>
          </div>
          <div className="mt-3">
            {isRootFolder &&
              !uploadingFile &&
              !isCopyingFile &&
              isLoaded &&
              folders.length === 0 &&
              files.length === 0 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 w-full border border-transparent rounded-2xl overflow-hidden">
                  <div className="p-6 py-12 flex flex-col items-start justify-center bg-gray-200">
                    <h1 className="text-black text-xl font-extrabold">
                      Enjoy 5TB of storage FREE with your deal.ai membership
                    </h1>
                    <h2 className="mt-4 text-black text-xs font-bold">
                      As compared to:
                      <br />
                      Google Drive Free (15GB) - <i>99% less storage</i>
                      <br />
                      Google Drive Business (2TB) - <i>60% less storage</i>
                      <br />
                      Dropbox Free (2GB) - <i>99% less storage</i>
                      <br />
                      Dropbox Plus (2TB) - <i>60% less storage</i>
                      <br />
                      <button
                        onClick={() => fileInputRef?.current?.click()}
                        className="mt-4 rounded bg-primary px-4 py-2 text-white font-normal"
                      >
                        + Upload Files
                      </button>
                    </h2>
                  </div>
                  <div
                    className="min-h-48"
                    style={{
                      background:
                        "url(/assets/images/vault-banner.png) center / cover no-repeat",
                    }}
                  ></div>
                </div>
              )}
            <VaultLayout
              isLoaded={isLoaded}
              uploadingFile={uploadingFile}
              isCopyingFile={isCopyingFile}
              folders={folders}
              files={files}
              setUploadFileQueue={setUploadFileQueue}
              handleRequestCopy={handleRequestCopy}
              handleRequestDelete={handleRequestDelete}
              handleNameChange={handleNameChange}
              handleFileMove={handleFileMove}
            />
          </div>
          <div>
            <div className="mt-2 md:mt-0 min-w-72 flex justify-center md:justify-end"></div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};
export default withAuth(Files, USER_ROLES, "ai-platform");
