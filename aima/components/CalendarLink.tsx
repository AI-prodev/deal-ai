import React, { ReactNode, useState } from "react";
import { CalendarSVG } from "@/components/icons/SVGData";

type CalendarLinkProps = {
  component: ReactNode;
  startDate: string;
  endDate: string;
  icsStartDate: string;
  icsEndDate: string;
  title: string;
  location: string;
  description: string;
  recurGoogle: string;
  recurIcs: string;
};

const CalendarLink = ({
  component,
  startDate,
  endDate,
  icsStartDate,
  icsEndDate,
  title,
  location,
  description,
  recurGoogle,
  recurIcs,
}: CalendarLinkProps) => {
  const [showOptions, setShowOptions] = useState(false);

  const convertToLocalTimezone = (date: string) => {
    const localDate = new Date(date);
    const timezoneOffset = localDate.getTimezoneOffset() * 60000; // Convert offset to milliseconds
    const adjustedDate = new Date(localDate.getTime() - timezoneOffset);
    return adjustedDate.toISOString().replace(/[-:]/g, "").split(".")[0];
  };

  const googleCalendarUrl = () => {
    const start = convertToLocalTimezone(startDate);
    const end = convertToLocalTimezone(endDate);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}${recurGoogle}`;
  };

  const downloadICalFile = () => {
    const data = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\n${icsStartDate}\n${icsEndDate}\nSUMMARY:${title}\nDESCRIPTION:${description}\nLOCATION:${location}${recurIcs}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([data], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "event.ics";
    link.click();
  };

  return (
    <div
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
      className="relative"
    >
      <a href="#">{component}</a>
      {showOptions && (
        <div className="absolute top-5 left-12 flex flex-col w-48 z-50">
          <a
            href={googleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-white text-black rounded h-9 px-2 flex items-center hover:bg-[#eee]"
          >
            <img src="/assets/images/google_calendar.png" width={20} />
            <div className="ml-2">Google Calendar</div>
          </a>
          <a
            href="#"
            onClick={downloadICalFile}
            className="mt-1 w-full bg-white text-black rounded h-9 px-2 flex items-center hover:bg-[#eee]"
          >
            <img src="/assets/images/apple_calendar.png" width={20} />
            <div className="ml-2">Apple Calendar</div>
          </a>
          <a
            href="#"
            onClick={downloadICalFile}
            className="mt-1 w-full bg-white text-black rounded h-9 px-2 flex items-center hover:bg-[#eee]"
          >
            <img src="/assets/images/outlook_calendar.png" width={20} />
            <div className="ml-2">Outlook</div>
          </a>
          <a
            href="#"
            onClick={downloadICalFile}
            className="mt-1 w-full bg-white text-black rounded h-9 px-2 flex items-center hover:bg-[#eee]"
          >
            <div className="scale-75">
              <CalendarSVG />
            </div>
            <div className="ml-1">Download File (.ics)</div>
          </a>
        </div>
      )}
    </div>
  );
};

export default CalendarLink;
