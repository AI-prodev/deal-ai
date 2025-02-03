import React, { useEffect } from "react";

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: {
      init: (config: object) => void;
      AppEvents: {
        logPageView: () => void;
      };
      XFBML: {
        parse: (element?: HTMLElement) => void;
      };
    };
  }
}

const FacebookSDK: React.FC<{ appId: string; version: string }> = ({
  appId,
  version,
}) => {
  useEffect(() => {
    window.fbAsyncInit = function () {
      // Initialize the Facebook SDK
      window.FB?.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: version,
      });

      window.FB?.AppEvents.logPageView();
    };

    const scriptId = "facebook-jssdk";
    if (document.getElementById(scriptId)) return;

    const js = document.createElement("script");
    js.id = scriptId;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    document.body.appendChild(js);

    return () => {
      // Cleanup the script when the component unmounts
      const fbScript = document.getElementById(scriptId);
      if (fbScript) {
        fbScript.remove();
      }
      // Reset the fbAsyncInit function
      delete window.fbAsyncInit;
    };
  }, [appId, version]);

  return null;
};

export default FacebookSDK;
