import LiveCallList from "@/components/academy/LiveCallList";
import { VideoSVG } from "@/components/icons/SVGData";
import {
  getCurrentDateFormatted,
  getNextDayOfWeek,
  getNextFirstSaturday,
  getNextThirdSaturday,
} from "@/helpers/date";
import withAuth from "@/helpers/withAuth";
import { createAcademyApi } from "@/store/features/academyApi";
import { AcademyLiveCall } from "@/utils/data/courses";
import { isMastermindAuthorized } from "@/utils/roleIsAuthorized";
import { ACADEMY_ROLES, MASTERMIND_ROLES } from "@/utils/roles";
import { useSession } from "next-auth/react";
import Head from "next/head";
import React, { useMemo } from "react";

const LiveCallsPage = () => {
  const { data: session } = useSession();
  const userRoles = session?.user?.roles || [];

  const currentDay = getCurrentDateFormatted();
  const nextFirstSaturday = getNextFirstSaturday(currentDay);
  const nextThirdSaturday = getNextThirdSaturday(currentDay);
  const nextSunday = getNextDayOfWeek(currentDay, 0);
  const nextTuesday = getNextDayOfWeek(currentDay, 2);

  const { data: isDaylightSavings } =
    createAcademyApi.useGetIsDaylightSavingsQuery({
      dates: [nextFirstSaturday, nextThirdSaturday, nextSunday, nextTuesday],
    });

  const liveCalls: AcademyLiveCall[] = useMemo(() => {
    if (!isDaylightSavings) {
      return [];
    }
    const result: AcademyLiveCall[] = [
      {
        title: "AI Marketing Agency - Free Live Training by deal.ai",
        slug: "ai-marketing-live-training",
        startTime: `${nextSunday}T14:00:00.000-${isDaylightSavings[nextSunday] ? "04" : "05"}:00`,
        endTime: `${nextSunday}T15:00:00.000-${isDaylightSavings[nextSunday] ? "04" : "05"}:00`,
        icsStartTime: `DTSTART;TZID=America/New_York:${nextSunday.split("-").join("")}T140000`,
        icsEndTime: `DTEND;TZID=America/New_York:${nextSunday.split("-").join("")}T150000`,
        meetingLink: "https://deal.ai/zoom",
        descriptionHTML: `Grow any business with AI! Free live Zoom training on leveraging AI (and particularly deal.ai software platform) to market and boost your business.<br/><br/>Zoom link:<br/><a href="https://deal.ai/zoom">https://deal.ai/zoom</a>`,
        thumbnail: "https://d20lbsuj0p173m.cloudfront.net/training_red.jpg",
        recurGoogle: "&recur=RRULE:FREQ%3DWEEKLY;BYDAY%3DTU,SU",
        recurIcs: "\nRRULE:FREQ=WEEKLY;BYDAY=TU,SU",
      },
      {
        title: "AI Software Agency - Free Live Training by deal.ai",
        slug: "ai-marketing-live-training-2",
        startTime: `${nextTuesday}T14:00:00.000-${isDaylightSavings[nextTuesday] ? "04" : "05"}:00`,
        endTime: `${nextTuesday}T15:00:00.000-${isDaylightSavings[nextTuesday] ? "04" : "05"}:00`,
        icsStartTime: `DTSTART;TZID=America/New_York:${nextTuesday.split("-").join("")}T140000`,
        icsEndTime: `DTEND;TZID=America/New_York:${nextTuesday.split("-").join("")}T150000`,
        meetingLink: "https://deal.ai/zoom",
        descriptionHTML: `Grow any business with AI! Free live Zoom training on leveraging AI (and particularly deal.ai software platform) to market and boost your business.<br/><br/>Zoom link:<br/><a href="https://deal.ai/zoom">https://deal.ai/zoom</a>`,
        thumbnail: "https://d20lbsuj0p173m.cloudfront.net/training_blue.jpg",
        recurGoogle: "&recur=RRULE:FREQ%3DWEEKLY;BYDAY%3DTU,SU",
        recurIcs: "\nRRULE:FREQ=WEEKLY;BYDAY=TU,SU",
      },
    ];
    result.sort((a, b) => (a.startTime > b.startTime ? 1 : -1));
    return result;
  }, [isDaylightSavings]);

  const mastermindCalls: AcademyLiveCall[] = useMemo(() => {
    if (!isDaylightSavings) {
      return [];
    }
    const result: AcademyLiveCall[] = [
      {
        title: "AI Mastermind - Live Call",
        slug: "ai-mastermind-live-call",
        startTime: `${nextFirstSaturday}T14:00:00.000-${isDaylightSavings[nextFirstSaturday] ? "04" : "05"}:00`,
        endTime: `${nextFirstSaturday}T15:00:00.000-${isDaylightSavings[nextFirstSaturday] ? "04" : "05"}:00`,
        icsStartTime: `DTSTART;TZID=America/New_York:${nextFirstSaturday.split("-").join("")}T140000`,
        icsEndTime: `DTEND;TZID=America/New_York:${nextFirstSaturday.split("-").join("")}T150000`,
        meetingLink: "https://us06web.zoom.us/j/82683399929",
        descriptionHTML: `Your Exclusive AI Mastermind Call`,
      },
      {
        title: "AI Mastermind - Live Call",
        slug: "ai-mastermind-live-call-1",
        startTime: `${nextThirdSaturday}T14:00:00.000-${isDaylightSavings[nextThirdSaturday] ? "04" : "05"}:00`,
        endTime: `${nextThirdSaturday}T14:00:00.000-${isDaylightSavings[nextThirdSaturday] ? "04" : "05"}:00`,
        icsStartTime: `DTSTART;TZID=America/New_York:${nextThirdSaturday.split("-").join("")}T140000`,
        icsEndTime: `DTEND;TZID=America/New_York:${nextThirdSaturday.split("-").join("")}T150000`,
        meetingLink: "https://us06web.zoom.us/j/82683399929",
        descriptionHTML: `Your Exclusive AI Mastermind Call`,
      },
    ];
    result.sort((a, b) => (a.startTime > b.startTime ? 1 : -1));
    return result;
  }, [isDaylightSavings]);

  return (
    <>
      <Head>
        <title>Live Training</title>
      </Head>
      <div className="flex justify-center">
        <div className="p-3">
          {liveCalls.length > 0 && (
            <>
              <div className="flex items-center">
                <VideoSVG />
                <h2 className="ml-3 text-2xl font-bold">
                  Upcoming Live Trainings
                </h2>
              </div>
              <div className="mt-6">
                <LiveCallList liveCalls={liveCalls} />
              </div>
            </>
          )}
          {isMastermindAuthorized(userRoles) && mastermindCalls.length > 0 && (
            <>
              <div className="flex items-center mt-10">
                <VideoSVG />
                <h2 className="ml-3 text-2xl font-bold">
                  Upcoming Mastermind Calls
                </h2>
              </div>
              <div className="mt-6">
                <LiveCallList liveCalls={mastermindCalls} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(
  LiveCallsPage,
  [...ACADEMY_ROLES, ...MASTERMIND_ROLES],
  "academy"
);
