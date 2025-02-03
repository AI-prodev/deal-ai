import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

const LIGHT_MODE_ROUTES = [
  "/apps/vault",
  "/simple-websites",
  "/projects/default/simple-websites",
  "/apps/email",
  "/apps/note-owner",
  "/apps/note-collab",
  "/apps/assist",
  "/apps/phones",
  "/apps/proposals",
];

const Footer = () => {
  const IS_LIGHT_MODE = true;
  const router = useRouter();
  const [showSupportButton, setShowSupportButton] = useState(true);

  const isLightModeRoute = useMemo(() => {
    if (!IS_LIGHT_MODE) {
      return false;
    }
    for (const lightModeRoute of LIGHT_MODE_ROUTES) {
      if (router.asPath.startsWith(lightModeRoute)) {
        return true;
      }
    }
    return false;
  }, [router.asPath]);

  useEffect(() => {
    const currentPath = router.asPath;

    if (currentPath.includes("/apps/contact-us")) {
      setShowSupportButton(false);
    } else {
      setShowSupportButton(true);
    }
  }, [router.asPath]);

  return (
    <div className="p-6">
      {isLightModeRoute ? (
        <hr className="border border-[#ebedf2]" />
      ) : (
        <hr className="border border-[#ebedf2] font-semibold dark:border-[#191e3a]" />
      )}
      {showSupportButton && (
        <div className="mt-4 flex justify-start pt-2">
          <a
            href="/apps/contact-us"
            className="rounded btn btn-primary py-1 px-3 text-sm font-semibold text-white"
          >
            Support
          </a>
        </div>
      )}
      <p
        className={`pt-4 ${isLightModeRoute ? "text-black" : "dark:text-white-dark"}`}
      >
        © {new Date().getFullYear()} deal.ai All rights reserved.
      </p>
    </div>
  );
};

export default Footer;
