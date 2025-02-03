import type { AppProps } from "next/app";
import { ReactElement, ReactNode, Suspense, useEffect, useState } from "react";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import DefaultLayout from "../components/Layouts/DefaultLayout";
import { Provider as ReduxProvider } from "react-redux";
import store from "../store/index";
import Head from "next/head";
import Script from "next/script";
import { appWithI18Next } from "ni18n";
import { ni18nConfig } from "ni18n.config.ts";
import { MantineProvider } from "@mantine/core";
// Perfect Scrollbar
import "react-perfect-scrollbar/dist/css/styles.css";

import "../styles/tailwind.css";
import "../styles/color.css";
import { NextPage } from "next";
import { SessionProvider, useSession } from "next-auth/react";
import { useAuthSession } from "../helpers/useAuth"; // Import the useAuth hook
import { useRouter } from "next/router";
import RateLimitPopUp from "@/components/RateLimitPopUp";
import { IntercomProvider } from "@/utils/IntercomProvider";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout =
    Component.getLayout ?? (page => <DefaultLayout>{page}</DefaultLayout>);
  const router = useRouter();

  const [pageTitle, setPageTitle] = useState(""); // Start with no title

  // Listen to changes in page title
  useEffect(() => {
    const titleObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (
          mutation.type === "childList" &&
          (mutation.target.nodeName === "TITLE" ||
            mutation.target.nodeName === "HEAD")
        ) {
          const newTitle = document.title;
          setTimeout(() => setPageTitle(newTitle), 1000);
        }
      });
    });

    titleObserver.observe(document.head, { subtree: true, childList: true });

    return () => titleObserver.disconnect();
  }, []);

  return (
    <>
      <Script id="intercom">
        {`(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/mcsz68c6';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();`}
      </Script>
      <SessionProvider session={pageProps.session}>
        <ReduxProvider store={store}>
          <Head>
            <meta charSet="UTF-8" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <meta name="description" content="deal.ai - AI Marketing" />
            <link rel="icon" href="/favicon.png" />
          </Head>
          <RateLimitPopUp />
          <MantineProvider>
            <IntercomProvider>
              {getLayout(<Component {...pageProps} />)}
            </IntercomProvider>
          </MantineProvider>
        </ReduxProvider>
      </SessionProvider>
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && pageTitle != "" && (
        <>
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        </>
      )}
    </>
  );
};

export default appWithI18Next(App, ni18nConfig);
