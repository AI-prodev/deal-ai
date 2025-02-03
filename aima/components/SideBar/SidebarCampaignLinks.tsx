import React from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { useTranslation } from "react-i18next";
import { ALL_ROLES, TEST_USER_ROLES, USER_ROLES } from "@/utils/roles";
import SidebarLinkItem from "./SidebarLinkItem";

type SidebarLinksProps = {
  session: Session | null;
};
export const SidebarCampaignLinks: React.FC<SidebarLinksProps> = ({
  session,
}) => {
  const renderLinks = () => {
    const { t } = useTranslation();
    const userRoles = session?.user?.roles || [];
    const allowedLinks = [
      {
        roles: TEST_USER_ROLES,
        link: "/ai-advertising",
        title: t("AI Advertising"),
        subMenu: [],
        isUnreleased: false,
        icon: "/assets/sidebarIcons/ai_advertise.png",
      },
      {
        roles: ALL_ROLES,
        link: "/apps/ai-editor",
        title: t("AI Image Editor"),
        subMenu: [],
        isUnreleased: false,
        icon: "/assets/sidebarIcons/ai_editor.png",
      },
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
