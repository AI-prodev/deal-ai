import { createFileAPI } from "@/store/features/fileApi";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export const useShareFile = (id: string) => {
  const [share, setShare] = useState(false);
  const { data: shareTokenData } = createFileAPI.useGetFileShareTokenQuery(
    { fileId: id },
    { skip: !share }
  );
  const copyShareUrl = () => {
    if (!shareTokenData) {
      return;
    }

    try {
      const shareUrl = `${process.env.NEXT_PUBLIC_SHARE_URL || process.env.NEXT_PUBLIC_BASE_URL}/files/${id}/${shareTokenData.shareToken}`;
      navigator.clipboard.writeText(shareUrl);
      Swal.mixin({
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 3000,
      }).fire({
        icon: "success",
        title: "Copied share URL to clipboard",
        padding: "10px 20px",
      });
    } catch (err) {
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
    }
  };
  useEffect(() => {
    copyShareUrl();
  }, [shareTokenData]);
  const handleShareClick = async () => {
    if (!share) {
      setShare(true);
    } else {
      copyShareUrl();
    }
  };
  return { handleShareClick };
};
