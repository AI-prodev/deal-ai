import {
  BigFolderSVG,
  CopySVG,
  DotsSVG,
  DownloadSVG,
  FileAppSVG,
  FileAudioSVG,
  FileDocumentSVG,
  FileFolderSVG,
  FileImageSVG,
  FilePresentationSVG,
  FileSheetSVG,
  FileTextSVG,
  FileVideoSVG,
} from "../icons/SVGData";
import { FoldersFilesSorting } from "../vault/vault-type";
const defaultStyles = "text-red-500 h-4 w-4";
export const getFileIcon = (
  mimeType: string,
  styles = defaultStyles
): React.ReactNode => {
  if (mimeType === FoldersFilesSorting.folder) {
    return <BigFolderSVG />;
  }
  if (mimeType.endsWith("/pdf")) {
    return <FileDocumentSVG className={styles} />;
  } else if (
    mimeType.startsWith("text/") ||
    mimeType.includes("openxmlformats-officedocument.wordprocessingml") ||
    mimeType.includes("iwork-pages")
  ) {
    return <FileTextSVG className={"text-blue-500 h-4 w-4"} />;
  } else if (mimeType.startsWith("image/")) {
    return <FileImageSVG className={styles} />;
  } else if (mimeType.startsWith("video/")) {
    return <FileVideoSVG className={styles} />;
  } else if (mimeType.startsWith("audio/")) {
    return <FileAudioSVG className={styles} />;
  } else if (
    mimeType.includes("iwork-numbers") ||
    mimeType.includes("openxmlformats-officedocument.spreadsheetml")
  ) {
    return <FileSheetSVG className={"text-blue-500 h-4 w-4"} />;
  } else if (
    mimeType.includes("iwork-keynote") ||
    mimeType.includes("openxmlformats-officedocument.presentationml")
  ) {
    return <FilePresentationSVG className={"text-blue-500 h-4 w-4"} />;
  } else if (mimeType.startsWith("application/")) {
    return <FileAppSVG className={styles} />;
  }
};
