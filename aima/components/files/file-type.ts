import { IFile } from "@/interfaces/IFile";
import { IFolder } from "@/interfaces/IFolder";

export type FileRequest = {
  item: IFile | IFolder;
  type: "folder" | "file";
};
export type FileRequestNameChange = FileRequest & { newName: string };
export type FileMoveRequest = {
  fileId: string;
  folderId: string;
  type: "folder" | "file";
};
