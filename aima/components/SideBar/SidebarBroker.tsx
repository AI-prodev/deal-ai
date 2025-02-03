import React from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { useTranslation } from "react-i18next";

type SidebarLinksProps = {
  session: Session | null;
};

type AllowedLink = {
  roles: string[];
  link: string;
  title: string;
  subMenu?: { link: string; title: string }[];
};

export const SidebarBrokerLinks: React.FC<SidebarLinksProps> = ({
  session,
}) => {
  const renderLinks = () => {
    const { t } = useTranslation();
    const userRoles = session?.user?.roles || [];
    const allowedLinks: AllowedLink[] = [
      {
        roles: ["broker"],
        link: "/apps/broker-business",
        title: t("Business Details"),
      },
      {
        roles: ["broker"],
        link: "/apps/broker-property",
        title: t("Commercial Property Details"),
      },
    ];

    return allowedLinks
      .filter(({ roles }) => roles.some(role => userRoles.includes(role)))
      .map(({ link, title, subMenu }, index) => (
        <li key={index} className="nav-item">
          <Link href={link} className="group">
            <div className="flex items-center">
              <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                {title}
              </span>
            </div>
          </Link>
          {subMenu && (
            <ul className="sub-menu text-gray-500">
              {subMenu?.map(({ link, title }, subIndex) => (
                <li key={subIndex}>
                  <Link href={link}>{title}</Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      ));
  };

  return <>{renderLinks()}</>;
};
