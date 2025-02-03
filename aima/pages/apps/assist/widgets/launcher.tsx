import { useGetAssistSettingsQuery } from "@/store/features/assistApi";
import Head from "next/head";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";

interface LauncherProps {}

const Launcher = ({}: LauncherProps) => {
  const assistKey = useSearchParams().get("key")!;

  const { data } = useGetAssistSettingsQuery(
    { assistKey },
    { skip: !assistKey }
  );

  const [launcherOpen, setLauncherOpen] = useState<boolean>(false);

  const handleClick = () => {
    window.parent.postMessage(
      { eventName: "launcher", open: !launcherOpen },
      "*"
    );
    setLauncherOpen(prev => !prev);
  };

  return (
    <>
      <Head>
        <title>Support Chat Launcher</title>
        <style>{`
              body { 
                background-color: white !important;
              }
              
              @keyframes chat-app-launcher {
                from {
                  opacity: 0;
                  transform: scale(0.5);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }

              .chat-app-launcher {
                z-index: 2147483003;
                padding: 0 !important;
                margin: 0 !important;
                border: none;
                max-width: 48px;
                width: 48px;
                max-height: 48px;
                height: 48px;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.06), 0 2px 32px 0 rgba(0, 0, 0, 0.16);
                transition: transform 167ms cubic-bezier(0.33, 0.00, 0.00, 1.00);
                box-sizing: content-box;
              }
              
              .chat-app-launcher:focus {
                outline: none;
              }
              
              .chat-app-launcher-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                position: absolute;
                top: 0;
                left: 0;
                width: 48px;
                height: 48px;
                transition: transform 100ms linear, opacity 80ms linear;
              }
              
              .chat-app-launcher-icon-open {
                opacity: 1;
                transform: rotate(0deg) scale(1);
              }
              
              .chat-app-launcher-icon-open svg {
                width: 24px;
                height: 24px;
              }
              
              .chat-app-launcher-icon-open svg path {
                fill: rgb(255, 255, 255);
              }
              
              .chat-app-launcher-icon-minimize {
                opacity: 0;
                transform: rotate(-60deg) scale(0);   
              }

              .chat-app-launcher-icon-minimize svg path {
                fill: rgb(255, 255, 255);
              }
              
              `}</style>
      </Head>
      {data?.color && (
        <div
          className="chat-app-launcher"
          style={{
            backgroundColor: data.color,
          }}
          onClick={handleClick}
        >
          <div
            id="chat-app-logo-svg"
            className={`chat-app-launcher-icon ${!launcherOpen ? "chat-app-launcher-icon-open" : "chat-app-launcher-icon-minimize"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
              />
            </svg>
          </div>
          <div
            id="chat-app-chevron-svg"
            className={`chat-app-launcher-icon ${launcherOpen ? "chat-app-launcher-icon-open" : "chat-app-launcher-icon-minimize"}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18.601 8.39897C18.269 8.06702 17.7309 8.06702 17.3989 8.39897L12 13.7979L6.60099 8.39897C6.26904 8.06702 5.73086 8.06702 5.39891 8.39897C5.06696 8.73091 5.06696 9.2691 5.39891 9.60105L11.3989 15.601C11.7309 15.933 12.269 15.933 12.601 15.601L18.601 9.60105C18.9329 9.2691 18.9329 8.73091 18.601 8.39897Z"
                fill="white"
              ></path>
            </svg>
          </div>
        </div>
      )}
    </>
  );
};

Launcher.getLayout = (page: JSX.Element) => {
  return <>{page}</>;
};
export default Launcher;
