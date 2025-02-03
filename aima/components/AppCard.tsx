import Link from "next/link";
import React from "react";

const AppCard = ({
  name,
  image,
  href,
  unreleased = false,
}: {
  name: string;
  image: string;
  href: string;
  unreleased?: boolean;
}) => {
  return (process.env.NEXT_PUBLIC_HIDE_UNRELEASED !== "true" && unreleased) ||
    !unreleased ? (
    <div className="w-full max-w-[250px] rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
      <Link href={href}>
        <div className="w-full max-w-[250px] rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
          <div className="py-7 px-6">
            <div className="mb-5 inline-block rounded-full bg-[#3b3f5c] p-3 text-[#f1f2f3]">
              <img src={image} className="rounded" />
            </div>
            <h5 className="mb-4 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
              {name}
            </h5>
          </div>
        </div>
      </Link>
    </div>
  ) : (
    <></>
  );
};

export default AppCard;
