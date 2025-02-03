import React from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { useTranslation } from "react-i18next";
import { ALL_ROLES, LEAD_ROLES } from "@/utils/roles";
import { useRouter } from "next/router";
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

export const SidebarLeadLink: React.FC<SidebarLinksProps> = ({ session }) => {
  const renderLinks = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const userRoles = session?.user?.roles || [];
    const allowedLinks: AllowedLink[] = [
      {
        roles: ALL_ROLES,
        link: "/apps/leads/view",
        title: t("Lead Flow"),
        icon: "/assets/sidebarIcons/lead_flow.png",
      },
    ];
    const handleLinkClick = (url: string) => {
      router.push(url).then(() => window.location.reload());
    };

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
export default SidebarLeadLink;
