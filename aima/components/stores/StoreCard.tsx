import React from "react";
// import { GlobeSVG, FilterSVG } from "../apollo/Svg/SvgData";
// import { format } from "date-fns";
import Link from "next/link";
import { baseStoreUrl } from "@/utils/baseUrl";
// import { IStore } from "@/interfaces/IStore";
// import { StoreType } from '@/enums/store-type.enum';

interface Props {
  store: any;
}
const StoreCard = ({ store }: Props) => {
  return (
    <div className="w-full rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
      <div className="flex flex-col items-center justify-between px-6 py-4 md:flex-row">
        <div className="flex items-center">
          <h5 className="ml-3 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
            {store.store_name}
          </h5>
        </div>
        {/* <Link href={`https://${store.store.domain}`} passHref={true}> */}
        <Link
          href={`${baseStoreUrl}/app/admin`}
          passHref={true}
          target="_blank"
        >
          <div className="flex items-center justify-center ">
            <img
              src="/assets/images/external-link.png"
              className="h-5 w-5 invert filter"
            />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default StoreCard;
