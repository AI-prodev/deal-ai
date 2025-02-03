import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

interface AIApp {
  slug: string;
  url: string;
  allowedOrigins: string[];
}

const aiApps: AIApp[] = [
  {
    slug: "meetz",
    url: "https://app.meetz.ai/signup?ref=dealai",
    allowedOrigins: ["https://app.meetz.ai", "https://test.app.meetz.ai"],
  },
];

const AppStore: React.FC = () => {
  const router = useRouter();
  const appSlug = router.query.appSlug as string;
  const appTokenName = router.query.appTokenName as string;
  const appTokenValue = router.query.appTokenValue as string;

  const selectedApp = aiApps.find(a => a.slug === appSlug);

  useEffect(() => {
    if (selectedApp && appTokenName && appTokenValue) {
      localStorage.setItem(
        "__app_" + selectedApp.slug + "_" + appTokenName,
        appTokenValue
      );
      // remove query params:
      const dynamicSegments = {
        appSlug: router.query.appSlug,
      };
      router.replace(
        {
          pathname: router.pathname,
          query: dynamicSegments,
        },
        undefined,
        { shallow: true }
      );
    }

    const handleMessage = async (event: any) => {
      // eslint-disable-next-line no-console
      console.log("event=", event);
      // eslint-disable-next-line no-console
      console.log("selectedApp=", selectedApp);
      if (!selectedApp) {
        return;
      }
      // eslint-disable-next-line no-console
      console.log("selectedApp.allowedOrigins=", selectedApp.allowedOrigins);
      // eslint-disable-next-line no-console
      console.log(
        "selectedApp.allowedOrigins.includes(event.origin)=",
        selectedApp.allowedOrigins.includes(event.origin)
      );

      if (!selectedApp.allowedOrigins.includes(event.origin)) {
        return;
      }

      if (event.data.type === "REQUEST_TOKEN") {
        const token = localStorage.getItem(
          "__app_" + selectedApp.slug + "_" + event.data.tokenName
        );
        event.source.postMessage(
          { type: "TOKEN_RESPONSE", token: token },
          event.origin
        );
      }

      if (event.data.type === "REDIRECT_REQUEST") {
        window.location.href = event.data.url;
      }

      if (event.data.type === "SET_TOKEN") {
        localStorage.setItem(
          "__app_" + selectedApp.slug + "_" + event.data.tokenName,
          event.data.tokenValue
        );
      }

      if (event.data.type === "REMOVE_TOKEN") {
        localStorage.removeItem(
          "__app_" + selectedApp.slug + "_" + event.data.tokenName
        );
      }
    };

    window.addEventListener("message", handleMessage, false);

    return () => {
      window.removeEventListener("message", handleMessage, false);
    };
  }, [selectedApp]);

  if (!selectedApp) {
    return <></>;
  }

  return (
    <>
      <Head>
        <title>Meetz</title>
      </Head>
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
      <div className="h-screen w-full">
        <iframe
          allow="microphone"
          className="h-full w-full"
          src={selectedApp.url}
        />
      </div>
    </>
  );
};

export default AppStore;
