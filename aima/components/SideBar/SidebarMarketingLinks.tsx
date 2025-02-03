import React from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { useTranslation } from "react-i18next";
import { ALL_ROLES, USER_ROLES } from "@/utils/roles";
import SidebarLinkItem from "./SidebarLinkItem";

type SidebarLinksProps = {
  session: Session | null;
};

export const SidebarMarketingLinks: React.FC<SidebarLinksProps> = ({
  session,
}) => {
  const renderLinks = () => {
    const { t } = useTranslation();
    const userRoles = session?.user?.roles || [];
    // const allowedLinks = [
    //   {
    //     roles: ALL_ROLES,
    //     link: "/apps/magic-hooks",
    //     title: t("Magic Hooks"),
    //     icon: "/assets/sidebarIcons/magic_hooks.png",
    //   },
    //   {
    //     roles: ALL_ROLES,
    //     link: "/apps/benefit-stack",
    //     title: t("Benefit Stacks"),
    //     subMenu: [],
    //     icon: "/assets/sidebarIcons/benefit_stacks.png",
    //   },
    //   {
    //     roles: ALL_ROLES,
    //     link: "/apps/bonus-stack",
    //     title: t("Free Bonuses"),
    //     subMenu: [],
    //     icon: "/assets/sidebarIcons/free_bonuses.png",
    //   },

    //   {
    //     roles: ALL_ROLES,
    //     link: "/apps/faq",
    //     title: t("FAQs"),
    //     subMenu: [],
    //     icon: "/assets/sidebarIcons/faq.png",
    //   },
    //   {
    //     roles: ALL_ROLES,
    //     link: "/apps/social-ad-images",
    //     title: t("Scroll-Stopping Ads"),
    //     subMenu: [],
    //     icon: "/assets/sidebarIcons/scroll_stopping_ads.png",
    //   },
    //   {
    //     roles: ALL_ROLES,
    //     link: "/apps/magic-hero-images",
    //     title: t("Hero Images"),
    //     subMenu: [],
    //     isUnreleased: false,
    //     icon: "/assets/sidebarIcons/hero_images.png",
    //   },
    //   {
    //     roles: ALL_ROLES,
    //     link: "/apps/commerce",
    //     title: t("Ecommerce PDP"),
    //     subMenu: [],
    //     isUnreleased: false,
    //     icon: "/assets/sidebarIcons/ecommerce.png",
    //   },
    //   {
    //     roles: ALL_ROLES,
    //     link: "/apps/amazon-pdp",
    //     title: t("Amazon PDP"),
    //     subMenu: [],
    //     isUnreleased: true,
    //     icon: "/assets/sidebarIcons/amazonPDP.png",
    //   },
    //   {
    //     roles: ALL_ROLES,
    //     link: "/apps/email-sequence",
    //     title: t("Emails"),
    //     isUnreleased: false,
    //     subMenu: [],
    //     icon: "/assets/sidebarIcons/email_sequences.png",
    //   },
    //   {
    //     roles: ALL_ROLES,
    //     link: "/apps/business-description",
    //     title: t("SEO Optimized Intros"),
    //     isUnreleased: false,
    //     subMenu: [],
    //     icon: "/assets/sidebarIcons/business_description.png",
    //   },
    //   {
    //     roles: ALL_ROLES,
    //     link: "/apps/reset",
    //     title: t("Reset"),
    //     subMenu: [],
    //     icon: "/assets/sidebarIcons/reset.png",
    //   },
    // ];

    const allowedLinks = [
      {
        roles: ALL_ROLES,
        link: "/apps/ai-apps",
        title: t("AI Apps"),
        isUnreleased: false,
        subMenu: [],
        icon: "/assets/sidebarIcons/ai_apps.png",
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
          <SidebarLinkItem title={title} link={link} icon={icon} />
        </React.Fragment>
      ));
  };

  return <>{renderLinks()}</>;
};
