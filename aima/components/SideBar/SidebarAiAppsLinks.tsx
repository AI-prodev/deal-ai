import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { useTranslation } from "react-i18next";
import { ALL_ROLES, USER_ROLES } from "@/utils/roles";
import SidebarLinkItem from "./SidebarLinkItem";
import { useRouter } from "next/router";

type SidebarLinksProps = {
  session: Session | null;
};

export const SidebarAiAppsLinks: React.FC<SidebarLinksProps> = ({
  session,
}): React.ReactElement => {
  const renderLinks = () => {
    const { t } = useTranslation();
    const userRoles = session?.user?.roles || [];
    const router = useRouter();
    const [recentlyUsed, setRecentlyUsed] = useState<any>([]);

    useEffect(() => {
      const storageItem = localStorage.getItem("recentlyUsedApps");
      let loadedRecentlyUsed = [];

      if (storageItem) {
        try {
          loadedRecentlyUsed = JSON.parse(storageItem);
        } catch (error) {
          console.error("Parsing error for recentlyUsedApps", error);

          localStorage.setItem("recentlyUsedApps", JSON.stringify([]));
        }
      }

      setRecentlyUsed(loadedRecentlyUsed);
    }, [router.pathname]);

    const addToRecentlyUsed = (app: any) => {
      setRecentlyUsed((prev: any[]) => {
        const filteredPrev = prev.filter(item => item.title !== app.title);
        const newRecentlyUsed = [app, ...filteredPrev].slice(0, 3);
        localStorage.setItem(
          "recentlyUsedApps",
          JSON.stringify(newRecentlyUsed)
        );
        return newRecentlyUsed;
      });
    };

    const filteredAllowedLinks = recentlyUsed
      .filter(({ roles }: { roles: string[] }) =>
        roles.some((role: string) => session?.user?.roles?.includes(role))
      )
      .filter(
        ({ isUnreleased }: { isUnreleased: boolean }) =>
          isUnreleased !== true ||
          process.env.NEXT_PUBLIC_HIDE_UNRELEASED !== "true"
      );

    return (
      <>
        <div className="">
          {filteredAllowedLinks.map(
            (
              item: {
                title: string;
                link: string;
                icon: string;
                gradient: string | undefined;
              },
              index: React.Key | null | undefined
            ) => (
              <div key={index} className="py-1">
                <SidebarLinkItem
                  key={index}
                  title={item.title}
                  link={item.link}
                  icon={item.icon}
                  imgBackground={item.gradient}
                />
              </div>
            )
          )}
        </div>
      </>
    );
  };

  return renderLinks();
};
