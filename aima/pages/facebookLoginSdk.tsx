import React, { useEffect } from "react";

const FacebookLoginSDK = () => {
  useEffect(() => {
    const existingScript = document.getElementById("facebook-jssdk");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src =
        "https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v18.0&appId=1345961409359181";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.nonce = "Qubl3iLC";
      document.body.appendChild(script);
    }

    return () => {
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return <div id="fb-root"></div>;
};

export default FacebookLoginSDK;
