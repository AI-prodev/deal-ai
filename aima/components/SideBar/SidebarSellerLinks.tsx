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

export const SidebarSellerLinks: React.FC<SidebarLinksProps> = ({
  session,
}) => {
  const renderLinks = () => {
    const { t } = useTranslation();
    const userRoles = session?.user?.roles || [];
    const allowedLinks: AllowedLink[] =
      process.env.NEXT_PUBLIC_FF_BUSINESS_INFORMATION === "true"
        ? [
            {
              roles: ["seller", "admin", "externalseller"],
              link: "/apps/sell-businesses",
              title: t("Business"),
              subMenu: [
                {
                  link: "/apps/sell-businesses",
                  title: t("Sell Businesses"),
                },

                {
                  link: "/apps/seller/bi-requests/dashboard",
                  title: t("Business Information Requests"),
                },
              ],
            },
            {
              roles: ["seller", "admin", "externalseller"],
              link: "/apps/sell-properties",
              title: t("Commercial Properties"),
              subMenu: [
                {
                  link: "/apps/sell-properties",
                  title: t("Sell Properties"),
                },

                {
                  link: "/apps/seller/bi-property-requests/dashboard",
                  title: t("Property Information Requests"),
                },
              ],
            },
          ]
        : [
            {
              roles: ["seller", "admin", "externalseller"],
              link: "/apps/sell-businesses",
              title: t("Business"),
              subMenu: [
                {
                  link: "/apps/sell-businesses",
                  title: t("Sell Businesses"),
                },
              ],
            },
            {
              roles: ["seller", "admin", "externalseller"],
              link: "/apps/sell-properties",
              title: t("Commercial Properties"),
              subMenu: [
                {
                  link: "/apps/sell-properties",
                  title: t("Sell Properties"),
                },
              ],
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
