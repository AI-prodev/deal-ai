//write react typescript component snippet
import React from "react";
import { EntityTypeSvg, LandSVG } from "@/components/icons/SVGData";

interface Props {
  count: number;
  date: string;
  type: string;
}

const StatsCard = ({ count, date, type }: Props) => {
  function formatDateWithLocale(date: string) {
    return new Date(Number(date) * 1000).toLocaleString();
  }

  const DateData = formatDateWithLocale(date);
  return (
    <>
      <div className="mb-5 flex items-center justify-center px-4">
        <div className="w-full max-w-[30rem] rounded border border-white-light bg-white p-2 shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
          <div className="flex flex-col items-center p-2 sm:flex-row">
            <div className="grid h-10 w-10 place-content-center  rounded-full bg-secondary-light text-secondary dark:bg-secondary dark:text-secondary-light">
              {/* <img
                src={
                  type === "business"
                    ? "/assets/images/business.webp"
                    : "/assets/images/land.webp"
                }
                alt="profile"
                className="h-full w-full object-cover"
              /> */}
              {type === "business" ? <EntityTypeSvg /> : <LandSVG />}
              {/* <EntityTypeSvg /> */}
            </div>
            <div className="flex-1 text-center sm:text-left ltr:sm:pl-5 rtl:sm:pr-5">
              {/* <h5 className="mb-2 text-[15px] font-semibold text-[#3b3f5c] dark:text-white-light">
                Luke Ivory
              </h5> */}

              <span className="text-lg">
                {count} {type === "business" ? "Businesses" : "CRE"}
              </span>
              <p className="mt-2 font-semibold text-white-dark ">{DateData}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatsCard;
