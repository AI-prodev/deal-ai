import React from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { useTranslation } from "react-i18next";
import SidebarLinkItem from "./SidebarLinkItem";

type SidebarLinksProps = {
  session: Session | null;
};

type AllowedLink = {
  roles: string[];
  link: string;
  title: string;
  subMenu?: { link: string; title: string }[];
  icon?: string;
};

export const SidebarAdminLinks: React.FC<SidebarLinksProps> = ({ session }) => {
  const renderLinks = () => {
    const { t } = useTranslation();
    const userRoles = session?.user?.roles || [];
    const allowedLinks: AllowedLink[] = [
      {
        roles: ["admin"],
        link: "/apps/admin/dashboard",
        title: t("Admin Dashboard"),
        icon: "/assets/sidebarIcons/admin.png",
      },
      {
        roles: ["admin"],
        link: "/apps/admin/leads",
        title: t("Lead Dashboard"),
        icon: "/assets/sidebarIcons/admin.png",
      },
    ];

    return allowedLinks
      .filter(({ roles }) => roles.some(role => userRoles.includes(role)))
      .map(({ link, title, subMenu, icon }, index) => (
        <React.Fragment key={index}>
          <SidebarLinkItem link={link} title={title} icon={icon} />
        </React.Fragment>
      ));
  };

  return <>{renderLinks()}</>;
};
