import { AcademyLiveCall } from "@/utils/data/courses";
import React from "react";
import LiveCallCard from "./LiveCallCard";

const LiveCallList = ({ liveCalls }: { liveCalls: AcademyLiveCall[] }) => {
  return (
    <div className="grid gap-4 grid-cols-1 max-w-[780px]">
      {/* cancel call on 2024-03-26 */}
      {liveCalls
        .filter(c => !c.startTime.includes("2024-03-26"))
        .map(liveCall => (
          <LiveCallCard key={liveCall.slug} liveCall={liveCall} />
        ))}
    </div>
  );
};

export default LiveCallList;
