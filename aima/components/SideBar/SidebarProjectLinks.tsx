import React from "react";
import { Session } from "next-auth";
import { useTranslation } from "react-i18next";
import { ALL_ROLES } from "@/utils/roles";
import SidebarLinkItem from "./SidebarLinkItem";

type SidebarLinksProps = {
  session: Session | null;
};
export const SidebarProjectLinks: React.FC<SidebarLinksProps> = ({
  session,
}) => {
  const renderLinks = () => {
    const { t } = useTranslation();
    const userRoles = session?.user?.roles || [];
    const allowedLinks = [
      {
        roles: ALL_ROLES,
        link: "/funnels",
        title: t("Ultra-Fast Funnels"),
        subMenu: [],
        icon: "/assets/sidebarIcons/ultra_fast_funnels.png",
      },
      {
        roles: ALL_ROLES,
        link: "/stores",
        title: t("Stores"),
        subMenu: [],
        isUnreleased: true,
        icon: "/assets/sidebarIcons/store.png",
      },
      {
        roles: ALL_ROLES,
        link: "/websites",
        title: t("Smart Websites"),
        subMenu: [],
        icon: "/assets/sidebarIcons/ultra_fast_websites.png",
      },
      {
        roles: ALL_ROLES,
        link: "/crm/contacts",
        title: t("Easy CRM"),
        subMenu: [],
        icon: "/assets/sidebarIcons/quick_crm.png",
      },
      // {
      //   roles: ALL_ROLES,
      //   link: "/domains",
      //   title: t("Domains"),
      //   subMenu: [],
      // },
      // {
      //   roles: USER_ROLES,
      //   link: "/integrations",
      //   title: t("Integrations"),
      //   subMenu: [],
      // },
    ];

    return allowedLinks
      .filter(({ roles }) => roles.some(role => userRoles.includes(role)))
      .filter(
        ({ isUnreleased }) =>
          isUnreleased !== true ||
          process.env.NEXT_PUBLIC_HIDE_UNRELEASED !== "true"
      )
      .map(({ link, title, subMenu, icon }, index) => (
        <React.Fragment key={index}>
          <SidebarLinkItem link={link} title={title} icon={icon} />
        </React.Fragment>
      ));
  };

  return <>{renderLinks()}</>;
};
