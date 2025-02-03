import { createFileAPI } from "@/store/features/fileApi";
import { convertMinutesToPrettyTime } from "@/utils/timeAgo";
import React, { useEffect, useState } from "react";
import {
  DownloadSVG,
  PlayCircleMiniSVG,
  PlaySVG,
  RecycleSVG,
} from "../icons/SVGData";
import { IProposal } from "@/interfaces/IProposal";
import { useDispatch } from "react-redux";
import { updateRegeneration } from "@/store/features/proposalApi";

type Props = {
  proposal: IProposal;
};

const ProposalItem = ({ proposal }: Props) => {
  const dispatch = useDispatch();
  const [downloadDoc, setDownloadDoc] = useState(false);
  const [spinRedo, setSpinRedo] = useState(false);
  const {
    data: downloadDocData,
    refetch: refetchDownloadDoc,
    isLoading: isLoadingDoc,
    isFetching: isFetchingDoc,
  } = createFileAPI.useGetFileDownloadUrlQuery(
    { fileId: proposal.docFile! },
    { skip: !downloadDoc || !proposal.docFile }
  );
  const [downloadPdf, setDownloadPdf] = useState(false);
  const {
    data: downloadPdfData,
    refetch: refetchDownloadPdf,
    isLoading: isLoadingPdf,
    isFetching: isFetchingPdf,
  } = createFileAPI.useGetFileDownloadUrlQuery(
    { fileId: proposal.pdfFile! },
    { skip: !downloadPdf || !proposal.pdfFile }
  );

  useEffect(() => {
    if (downloadDocData) {
      window.open(downloadDocData.signedUrl, "_blank");
    }
  }, [downloadDocData]);

  useEffect(() => {
    if (downloadPdfData) {
      window.open(downloadPdfData.signedUrl, "_blank");
    }
  }, [downloadPdfData]);

  const handleRedo = () => {
    setSpinRedo(true);
    dispatch(
      updateRegeneration({
        businessName: proposal.businessName,
        businessWebsite: proposal.businessWebsite,
      })
    );
    setTimeout(() => {
      setSpinRedo(false);
    }, 970);
  };

  return (
    <tr className="border-b text-black">
      <td className="px-4 py-2">{proposal.businessName}</td>
      <td className="px-4 py-2">{proposal.businessWebsite}</td>
      <td className="px-4 py-2">
        {(isLoadingDoc || isFetchingDoc) && (
          <span className="cursor-default">Loading...</span>
        )}
        {!(isLoadingDoc || isFetchingDoc) && !proposal.docFile && "—"}
        {!(isLoadingDoc || isFetchingDoc) && proposal.docFile && (
          <div
            onClick={() =>
              downloadDoc ? refetchDownloadDoc() : setDownloadDoc(true)
            }
            className="text-blue-500 hover:text-blue-800 cursor-pointer flex items-center"
          >
            <DownloadSVG className="h-5 w-5 mr-0.5" />
            DOC
          </div>
        )}
      </td>
      <td className="px-4 py-2">
        {(isLoadingPdf || isFetchingPdf) && (
          <span className="cursor-default">Loading...</span>
        )}
        {!(isLoadingPdf || isFetchingPdf) && !proposal.pdfFile && "—"}
        {!(isLoadingPdf || isFetchingPdf) && proposal.pdfFile && (
          <div
            onClick={() =>
              downloadPdf ? refetchDownloadPdf() : setDownloadPdf(true)
            }
            className="text-blue-500 hover:text-blue-800 cursor-pointer flex items-center"
          >
            <DownloadSVG className="h-5 w-5 mr-0.5" />
            PDF
          </div>
        )}
      </td>
      <td className="px-4 py-2">
        {new Date(proposal.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-2 flex items-center justify-center">
        <div className="cursor-pointer" onClick={handleRedo}>
          <RecycleSVG
            className={`w-5 h-5 text-blue-500 ${spinRedo && "animate-spin"}`}
          />
        </div>
      </td>
    </tr>
  );
};

export default ProposalItem;
