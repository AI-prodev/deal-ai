import { IPhoneCall } from "@/interfaces/IPhoneCall";
import { createFileAPI } from "@/store/features/fileApi";
import { convertMinutesToPrettyTime } from "@/utils/timeAgo";
import React, { useEffect, useState } from "react";
import { PlayCircleMiniSVG, PlaySVG } from "../icons/SVGData";

type Props = {
  phoneCall: IPhoneCall;
};

const PhoneCallItemMobile = ({ phoneCall }: Props) => {
  const [listen, setListen] = useState(false);
  const {
    data: downloadUrlData,
    refetch: refetchDownload,
    isLoading,
    isFetching,
  } = createFileAPI.useGetFileDownloadUrlQuery(
    { fileId: phoneCall.recordingFile! },
    { skip: !listen || !phoneCall.recordingFile }
  );

  useEffect(() => {
    if (downloadUrlData) {
      window.open(downloadUrlData.signedUrl, "_blank");
    }
  }, [downloadUrlData]);

  return (
    <div className="text-black rounded shadow text-lg mb-4 p-3 bg-white">
      <div className="">
        {new Date(phoneCall.startTime).toLocaleDateString()}{" "}
        {new Date(phoneCall.startTime).toLocaleTimeString()}
      </div>
      <div className="mt-1">
        <b>Duration:</b> {convertMinutesToPrettyTime(phoneCall.duration)}
      </div>
      <div className="mt-1">
        <b>From:</b> {phoneCall.fromFormatted}
      </div>
      <div className="mt-1">
        <b>To:</b> {phoneCall.phoneNumber.title}
      </div>
      <div className="mt-1">
        {(isLoading || isFetching) && (
          <span className="cursor-default">Loading...</span>
        )}
        {!(isLoading || isFetching) && phoneCall.recordingFile && (
          <div
            onClick={() => (listen ? refetchDownload() : setListen(true))}
            className="text-blue-500 hover:text-blue-800 cursor-pointer flex items-center"
          >
            <PlayCircleMiniSVG className="h-5 w-5 mr-0.5" />
            Listen
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneCallItemMobile;
