import React from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { useTranslation } from "react-i18next";
import { ALL_ROLES } from "@/utils/roles";
import SidebarLinkItem from "./SidebarLinkItem";

type SidebarLinksProps = {
  session: Session | null;
};
export const SidebarAcademyLinks: React.FC<SidebarLinksProps> = ({
  session,
}) => {
  const renderLinks = () => {
    const { t } = useTranslation();
    const userRoles = session?.user?.roles || [];
    const allowedLinks = [
      {
        roles: ALL_ROLES,
        link: "/academy/lessons",
        title: t("Academy"),
        subMenu: [],
        icon: "/assets/sidebarIcons/lessons.png",
      },
      {
        roles: ALL_ROLES,
        link: "/academy/upcoming-live-trainings",
        title: t("Live Training"),
        subMenu: [],
        icon: "/assets/sidebarIcons/upcoming_live_trainings.png",
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
