import React from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { useTranslation } from "react-i18next";

type SidebarLinksProps = {
  session: Session | null;
};
export const SidebarLinks: React.FC<SidebarLinksProps> = ({ session }) => {
  const renderLinks = () => {
    const { t } = useTranslation();
    const userRoles = session?.user?.roles || [];
    const allowedLinks = [
      {
        roles: ["admin"],
        link: "/apps/admin/dashboard",
        title: t("Admin Dashboard"),
      },
      {
        roles: ["buyer", "admin", "seller", "onlyte"],
        link: "/apps/socrates",
        title: t("Thesis"),
        subMenu:
          process.env.NEXT_PUBLIC_FF_COMMERCIAL_PROPERTIES !== "true"
            ? [
                {
                  link: "/apps/socrates",
                  title: "Businesses",
                },
                {
                  link: "/apps/socrates-land",
                  title: "Commercial Property",
                },
              ]
            : [
                {
                  link: "/apps/socrates",
                  title: "Businesses",
                },
              ],
      },
      {
        roles: ["buyer", "admin", "seller", "onlyte"],
        link: "/apps/apollo",
        title: t("Explore"),
        subMenu:
          process.env.NEXT_PUBLIC_FF_COMMERCIAL_PROPERTIES !== "true"
            ? [
                {
                  link: "/apps/apollo",
                  title: "Businesses",
                },
                {
                  link: "/apps/apollo-land",
                  title: "Commercial Property",
                },
              ]
            : [
                {
                  link: "/apps/apollo",
                  title: "Businesses",
                },
              ],
      },
      {
        roles: ["buyer", "admin", "seller"],
        link: "/apps/rockefeller-financing",
        title: t("Leverage"),
        subMenu: [
          {
            link: "/apps/rockefeller-financing",
            title: "Financing",
          },
          {
            link: "/apps/rockefeller-amortization",
            title: "Amortization Calculator",
          },
        ],
      },
      {
        roles: ["buyer", "admin", "seller"],
        link: "/apps/newton",
        title: t("Evaluate"),
        subMenu:
          process.env.NEXT_PUBLIC_FF_BUSINESS_INFORMATION !== "true"
            ? [
                {
                  link: "/apps/newton-bi-request",
                  title: "Business Information Request",
                },
              ]
            : null,
      },
      {
        roles: ["buyer", "admin", "seller"],
        link: "/apps/michelangelo",
        title: t("Structure"),
      },
      {
        roles: ["buyer", "admin", "seller"],
        link: "/apps/caesar",
        title: t("Close"),
      },
      {
        roles: ["buyer", "admin", "seller"],
        link: "/apps/zeus",
        title: t("Orient"),
      },
      {
        roles: ["buyer", "admin", "seller"],
        link: "/apps/hercules",
        title: t("Power Up"),
      },
      {
        roles: ["buyer", "admin", "seller"],
        link: "/apps/houdini",
        title: t("Exit / Roll-Up"),
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
              {subMenu.map(({ link, title }, subIndex) => (
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
