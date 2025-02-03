import React, { useEffect } from "react";

const FacebookLoginButton = () => {
  useEffect(() => {
    const renderFBLoginButton = () => {
      if (window.FB && window.FB.XFBML) {
        window.FB.XFBML.parse();
      }
    };

    setTimeout(renderFBLoginButton, 1000);
  }, []);

  return (
    <div
      className="fb-login-button"
      data-width=""
      data-size="large"
      data-button-type="login_with"
      data-layout="default"
      data-auto-logout-link="false"
      data-use-continue-as="false"
      data-config-id="867430652055767"
    ></div>
  );
};

export default FacebookLoginButton;
