import React from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { useTranslation } from "react-i18next";

type SidebarLinksProps = {
  session: Session | null;
};
export const SidebarBuyerLinks: React.FC<SidebarLinksProps> = ({ session }) => {
  const renderLinks = () => {
    const { t } = useTranslation();
    const userRoles = session?.user?.roles || [];
    const allowedLinks = [
      {
        roles: ["buyer", "admin", "seller", "onlyte", "buyerfree"],
        link: "/apps/socrates",
        title: t("Thesis"),
        subMenu: [
          {
            link: "/apps/socrates",
            title: "Businesses",
          },
          {
            link: "/apps/socrates-land",
            title: "Commercial Property",
          },
        ],
      },
      {
        roles: ["buyer", "admin", "seller", "onlyte", "buyerfree"],
        link: "/apps/apollo",
        title: t("Explore"),
        subMenu: [
          {
            link: "/apps/apollo",
            title: "Businesses",
          },
          {
            link: "/apps/apollo-land",
            title: "Commercial Property",
          },
        ],
      },
      {
        roles: ["buyer", "admin", "seller", "buyerfree"],
        link: "/apps/rockefeller-financing",
        title: t("Leverage"),
        subMenu: [
          {
            link: "/apps/rockefeller-financing",
            title: "Business Financing",
          },
          {
            link: "/apps/rockefeller-property-financing",
            title: "Commercial Property Financing",
          },
          {
            link: "/apps/rockefeller-amortization",
            title: "Amortization Calculator",
          },
        ],
      },
      {
        roles: ["buyer", "admin", "seller", "buyerfree"],
        link: "/apps/newton",
        title: t("Evaluate Business"),
        subMenu:
          process.env.NEXT_PUBLIC_FF_BUSINESS_INFORMATION === "true"
            ? [
                {
                  link: "/apps/newton",
                  title: "Evaluation",
                },

                {
                  link: "/apps/newton-bi-request",
                  title: "Information Request",
                },

                {
                  link: "/apps/newton-bi-request-dashboard",
                  title: "Dashboard",
                },
              ]
            : [
                {
                  link: "/apps/newton",
                  title: "Evaluation",
                },
              ],
      },
      {
        roles: ["buyer", "admin", "seller", "buyerfree"],
        link: "/apps/newton",
        title: t("Evaluate Commercial Property"),
        subMenu:
          process.env.NEXT_PUBLIC_FF_BUSINESS_INFORMATION === "true"
            ? [
                {
                  link: "/apps/newton-property",
                  title: "Evaluation",
                },

                {
                  link: "/apps/newton-property-bi-request",
                  title: "Information Request",
                },

                {
                  link: "/apps/newton-property-bi-request-dashboard",
                  title: "Dashboard",
                },
              ]
            : [
                {
                  link: "/apps/newton-property",
                  title: "Evaluation",
                },
              ],
      },
      // {
      //   roles: ["buyer", "admin", "seller"],
      //   link: "/apps/michelangelo",
      //   title: t("Structure"),
      // },
      // {
      //   roles: ["buyer", "admin", "seller"],
      //   link: "/apps/caesar",
      //   title: t("Close"),
      // },
      // {
      //   roles: ["buyer", "admin", "seller"],
      //   link: "/apps/zeus",
      //   title: t("Orient"),
      // },
      // {
      //   roles: ["buyer", "admin", "seller"],
      //   link: "/apps/hercules",
      //   title: t("Power Up"),
      // },
      // {
      //   roles: ["buyer", "admin", "seller"],
      //   link: "/apps/houdini",
      //   title: t("Exit / Roll-Up"),
      // },
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
