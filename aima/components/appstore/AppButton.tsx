import { IApp } from "@/interfaces/IApp";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CloseSVG } from "../icons/SVGData";
import { createProfileAPI } from "@/store/features/profileApi";

type Props = {
  app: IApp;
  isEditMode: boolean;
  appChanged: () => void;
};

const AppButton = ({ app, isEditMode, appChanged }: Props) => {
  const { t } = useTranslation();
  const [removeApp] = createProfileAPI.useRemoveAppMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRemoveApp = async (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    if (isSubmitting) {
      return;
    }

    if (!confirm(`Remove "${app.title}"?`)) {
      return;
    }

    try {
      setIsSubmitting(true);

      await removeApp({ appId: app._id });

      appChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonContent = (
    <div className="flex flex-col items-center justify-center text-center">
      <div
        className="relative flex h-20 w-20 items-center justify-center rounded-2xl md:h-20 md:w-20"
        style={{
          backgroundImage: app.isFullIcon ? undefined : app.gradient,
        }}
      >
        {isEditMode && (
          <button
            type="button"
            onClick={handleRemoveApp}
            className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gray-500 text-white"
          >
            <CloseSVG />
          </button>
        )}
        <img
          src={app.icon}
          alt={app.title}
          className={
            app.isFullIcon
              ? `h-20 w-20 rounded-2xl`
              : `h-12 w-12 md:h-12 md:w-12`
          }
        />
      </div>
      <span className="text-md mt-2 font-semibold text-white">
        {t(app.title)}
      </span>
    </div>
  );

  return (
    <div
      className={`h-36 w-36 transform p-2 transition duration-300 hover:scale-105 md:h-36 md:w-36 ${
        app.isUnreleased ? "opacity-50" : ""
      } ${isEditMode && "animate-jiggle"}`}
      style={{
        animationDelay: `${Math.round(Math.random() * 10) / 100}s`,
      }}
    >
      <Link href={app.link} className={`${isEditMode && "hidden"}`}>
        {buttonContent}
      </Link>
      <div className={`${!isEditMode && "hidden"}`}>{buttonContent}</div>
    </div>
  );
};

export default AppButton;
