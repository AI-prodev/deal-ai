import { IFile } from "@/interfaces/IFile";
import { IFolder } from "@/interfaces/IFolder";
import { createFileAPI } from "@/store/features/fileApi";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export const useFileDownload = (
  type: "folder" | "file",
  item: IFolder | IFile,
  showFile: boolean
) => {
  const router = useRouter();
  const [download, setDownload] = useState(false);

  const { data: downloadUrlData, refetch: refetchDownload } =
    createFileAPI.useGetFileDownloadUrlQuery(
      { fileId: item._id },
      { skip: !download && !showFile }
    );
  const handleDownloadItem = async () => {
    if (type === "file") {
      if (!download) {
        setDownload(true);
      } else {
        refetchDownload();
      }
    } else if (type === "folder") {
      router.push(`/apps/vault/${item._id}`);
    }
  };

  const downloadUrl = (url: string) => {
    fetch(url)
      .then(res => {
        if (res.status >= 400) {
          throw new Error("There was a problem downloading this file");
        }
        return res.blob();
      })
      .then(res => {
        const blob: Blob = new Blob([res], {
          type: (item as IFile).mimeType,
        });
        const url: string = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = item.displayName;
        link.click();
      })
      .catch(err => {
        console.error(err);
        Swal.mixin({
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 3000,
        }).fire({
          icon: "error",
          title: "There was a problem downloading the file",
          padding: "10px 20px",
        });
      });
  };
  useEffect(() => {
    if (!downloadUrlData || !(item as IFile).mimeType) {
      return;
    }

    if (showFile && !download) {
      return;
    }

    downloadUrl(downloadUrlData.signedUrl);
  }, [downloadUrlData]);
  return { handleDownloadItem, downloadUrlData, downloadUrl };
};
