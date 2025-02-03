import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type SidebarLinkItemProps = {
  link: string;
  title: string;
  icon?: string;
  imgBackground?: string;
};

const SidebarLinkItem: React.FC<SidebarLinkItemProps> = ({
  link,
  title,
  icon,
  imgBackground,
}: SidebarLinkItemProps) => {
  const router = useRouter();
  let isActive = false;

  if (router.pathname.includes("/[type]")) {
    const type = router.query.type as string;

    isActive = link === `/${type}`;
  } else {
    isActive = router.pathname.includes(link);
  }

  return (
    <li>
      <Link
        href={link}
        className={`flex items-center space-x-3 rounded-lg p-1 text-base font-normal text-gray-700 ${
          isActive && "bg-blue-700"
        } transition-colors duration-200 hover:bg-blue-700 hover:text-white`}
      >
        {icon && (
          <img
            src={icon}
            alt={title}
            className={`h-5 w-5 ${imgBackground ? " rounded-md p-1" : ""}`}
            style={{ background: imgBackground }}
          />
        )}
        {!icon && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-400">
            <span className="text-sm text-white">?</span>
          </div>
        )}
        <span className="text-[16px] text-white">{title}</span>
      </Link>
    </li>
  );
};

export default SidebarLinkItem;
