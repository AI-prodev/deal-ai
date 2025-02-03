import { IApp } from "@/interfaces/IApp";
import LoadingSpinner from "@/pages/components/loadingSpinner";
import { createProfileAPI } from "@/store/features/profileApi";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InstallCircle from "../ai-apps/InstallCircle";

type Props = {
  appStoreApp: IApp;
  appChanged: () => void;
};

const AppStoreAppCard = ({ appStoreApp, appChanged }: Props) => {
  const { t } = useTranslation();
  const [addApp] = createProfileAPI.useAddAppMutation();
  const [isAdding, setIsAdding] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [isInstalled, setIsInstalled] = useState(appStoreApp.installed);

  useEffect(() => {
    setIsInstalled(appStoreApp.installed);
  }, [appStoreApp]);

  useEffect(() => {
    let interval: any = null;

    if (isInstalling && installProgress < 100) {
      interval = setInterval(() => {
        setInstallProgress(prevCount => prevCount + 1);
      }, 7);
    } else if (!isInstalling || installProgress >= 100) {
      clearInterval(interval);
    }

    if (installProgress >= 100) {
      setIsInstalling(false);
      setIsInstalled(true);
      appChanged();
    }

    return () => clearInterval(interval);
  }, [isInstalling, installProgress]);

  const handleAddApp = async (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    if (isAdding) {
      return;
    }

    try {
      setIsAdding(true);

      await addApp({ appId: appStoreApp._id });

      setIsAdding(false);
      setIsInstalling(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
      <div className="py-4 px-6 flex flex-col md:flex-row justify-between items-center">
        <div
          className={`transform p-2 transition duration-300 hover:scale-105 ${
            appStoreApp.isUnreleased ? "opacity-50" : ""
          }`}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div
              className="flex h-28 w-28 items-center justify-center rounded-2xl md:h-20 md:w-20"
              style={{
                backgroundImage: appStoreApp.isFullIcon
                  ? undefined
                  : appStoreApp.gradient,
              }}
            >
              <img
                src={appStoreApp.icon}
                alt={appStoreApp.title}
                className={
                  appStoreApp.isFullIcon
                    ? `h-20 w-20 rounded-2xl`
                    : `h-20 w-20 md:h-12 md:w-12`
                }
              />
            </div>
          </div>
        </div>
        <div className="w-8 h-4"></div>
        <div className="flex flex-col justify-center items-start flex-grow">
          <div className="text-lg font-semibold text-white">
            {t(appStoreApp.title)}
          </div>
          <div className="mt-1 text-md text-gray-400">
            {t(appStoreApp.description || "")}
          </div>
        </div>
        <div className="w-8 h-4"></div>
        <div>
          {isInstalled ? (
            <Link
              href={appStoreApp.link}
              className="rounded btn btn-primary py-1 px-3 text-sm font-semibold text-white w-16 h-8"
            >
              Open
            </Link>
          ) : (
            <Link
              href=""
              onClick={handleAddApp}
              className={`rounded btn btn-primary py-1 px-3 flex items-center justify-center relative text-sm font-semibold text-white w-16 h-8`}
            >
              {isInstalling && !isAdding && (
                <div>
                  <InstallCircle progress={installProgress} />
                </div>
              )}
              {isAdding && !isInstalling && (
                <div className="mr-1 relative" style={{ top: "-1px" }}>
                  <LoadingSpinner isLoading />
                </div>
              )}
              {!isAdding && !isInstalling && <div>Get</div>}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppStoreAppCard;
