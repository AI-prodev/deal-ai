import { IPhoneCall } from "@/interfaces/IPhoneCall";
import { createFileAPI } from "@/store/features/fileApi";
import { convertMinutesToPrettyTime } from "@/utils/timeAgo";
import React, { useEffect, useState } from "react";
import { PlayCircleMiniSVG, PlaySVG } from "../icons/SVGData";

type Props = {
  phoneCall: IPhoneCall;
};

const PhoneCallItem = ({ phoneCall }: Props) => {
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
    <tr className="border-b text-black">
      <td className="px-4 py-2">
        {new Date(phoneCall.startTime).toLocaleDateString()}{" "}
        {new Date(phoneCall.startTime).toLocaleTimeString()}
      </td>
      <td className="px-4 py-2">
        {convertMinutesToPrettyTime(phoneCall.duration)}
      </td>
      <td className="px-4 py-2">{phoneCall.fromFormatted}</td>
      <td className="px-4 py-2">{phoneCall.phoneNumber.title}</td>
      <td className="px-4 py-2">
        {(isLoading || isFetching) && (
          <span className="cursor-default">Loading...</span>
        )}
        {!(isLoading || isFetching) && !phoneCall.recordingFile && "—"}
        {!(isLoading || isFetching) && phoneCall.recordingFile && (
          <div
            onClick={() => (listen ? refetchDownload() : setListen(true))}
            className="text-blue-500 hover:text-blue-800 cursor-pointer flex items-center"
          >
            <PlayCircleMiniSVG className="h-5 w-5 mr-0.5" />
            Listen
          </div>
        )}
      </td>
    </tr>
  );
};

export default PhoneCallItem;
