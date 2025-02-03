import { AcademyLiveCall } from "@/utils/data/courses";
import React from "react";
import { ColorCalendarSVG } from "@/components/icons/SVGData";
import { formatLiveCallDate } from "@/helpers/date";
import Link from "next/link";
import CalendarLink from "../CalendarLink";

const LiveCallCard = ({ liveCall }: { liveCall: AcademyLiveCall }) => {
  return (
    <>
      <div className="w-full rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {liveCall.thumbnail && (
            <div className="flex items-center mb-2 md:mb-0">
              <div
                style={{
                  width: 126,
                  height: 126,
                  backgroundImage: `url(${liveCall.thumbnail})`,
                  backgroundSize: "cover",
                  borderRadius: "2px",
                  backgroundPosition: "center center",
                }}
              />
            </div>
          )}
          <div className="flex flex-col items-start justify-center w-full py-4 px-4 md:pl-4">
            <p className="text-white-dark">
              {formatLiveCallDate(liveCall.startTime)}
            </p>
            <h1 className="text-white text-lg font-bold mt-1">
              {liveCall.title}
            </h1>
            <div className="text-white-dark mt-1 flex">
              <Link
                href={liveCall.meetingLink || "#"}
                target="_blank"
                rel="noreferrer noopener nofollow"
                className="flex items-center hover:underline"
              >
                <img
                  alt="zoom"
                  src={`/assets/images/zoom.png`}
                  className="h-4 w-4 mr-2"
                />
                Zoom Meeting
              </Link>
              <CalendarLink
                component={
                  <div className="ml-6 flex items-center">
                    <div className="scale-75">
                      <ColorCalendarSVG />
                    </div>
                    <div className="ml-1">Add to calendar</div>
                  </div>
                }
                description={liveCall.descriptionHTML}
                title={liveCall.title}
                startDate={liveCall.startTime}
                endDate={liveCall.endTime}
                icsStartDate={liveCall.icsStartTime}
                icsEndDate={liveCall.icsEndTime}
                location={liveCall.meetingLink || ""}
                recurGoogle={liveCall.recurGoogle || ""}
                recurIcs={liveCall.recurIcs || ""}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LiveCallCard;
