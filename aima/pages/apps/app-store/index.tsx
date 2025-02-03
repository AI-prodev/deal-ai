import AppStoreAppCard from "@/components/appstore/AppStoreAppCard";
import { IApp } from "@/interfaces/IApp";
import { createAppApi } from "@/store/features/appApi";
import { createProfileAPI } from "@/store/features/profileApi";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

const AppStore: React.FC = () => {
  const { t } = useTranslation();
  const { data: apps } = createAppApi.useGetAvailableAppsQuery({});
  const { data: myApps, refetch: refetchMyApps } =
    createProfileAPI.useGetMyAppsQuery();

  const { data: session } = useSession();
  const userRoles = session?.user?.roles || [];

  const hydratedApps = useMemo(() => {
    const result: IApp[] = [];
    for (const app of apps || []) {
      const isInstalled = myApps?.find(a => a._id === app._id);
      result.push({
        ...app,
        installed: !!isInstalled,
      });
    }
    return result;
  }, [apps, myApps]);

  return (
    <>
      <Head>
        <title>App Store</title>
      </Head>
      <div className="relative -m-6">
        <div className="min-h-screen bg-cover bg-center p-4 md:p-6">
          <div className="flex justify-center">
            <div className="w-full max-w-[780px]">
              <ul className="mb-5 flex space-x-2 rtl:space-x-reverse">
                <li>
                  <Link
                    href="/apps/ai-apps"
                    className="text-md text-primary hover:underline"
                  >
                    &larr; Back
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex justify-center">
            <div>
              <div className="mb-6 text-2xl font-bold">
                Welcome to the AI App store
              </div>
              <div className="max-w-[780px]">
                {(hydratedApps || [])
                  .filter(({ roles }) =>
                    roles.some(role => userRoles.includes(role))
                  )
                  .filter(
                    app =>
                      (app.isUnreleased !== true ||
                        process.env.NEXT_PUBLIC_HIDE_UNRELEASED !== "true") &&
                      !app.isForced
                  )
                  .map(app => (
                    <div
                      key={app._id}
                      className="mb-2 flex flex-wrap items-center justify-center gap-3 px-2 md:mb-4 md:flex-col md:items-start md:justify-start"
                    >
                      <AppStoreAppCard
                        appStoreApp={app}
                        appChanged={refetchMyApps}
                      />
                    </div>
                  ))}
              </div>
              {(hydratedApps || []).length > 0 && (
                <div className="mt-6 max-w-3xl flex items-center justify-center text-lg">
                  More apps coming soon!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppStore;
