import { PropsWithChildren, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "./store";
import {
  toggleRTL,
  toggleTheme,
  toggleLocale,
  toggleMenu,
  toggleLayout,
  toggleAnimation,
  toggleNavbar,
  toggleSemidark,
} from "./store/themeConfigSlice";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { useRouter } from "next/router";
import { handleLightModeRoute } from "@/utils/theme";
import clsx from "clsx";

function App({ children }: PropsWithChildren) {
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const { asPath } = useRouter();
  const isLightModeRoute = handleLightModeRoute(asPath);

  useEffect(() => {
    dispatch(toggleTheme(localStorage.getItem("theme") || themeConfig.theme));
    dispatch(toggleMenu(localStorage.getItem("menu") || themeConfig.menu));
    dispatch(
      toggleLayout(localStorage.getItem("layout") || themeConfig.layout)
    );
    dispatch(
      toggleRTL(localStorage.getItem("rtlClass") || themeConfig.rtlClass)
    );
    dispatch(
      toggleAnimation(
        localStorage.getItem("animation") || themeConfig.animation
      )
    );
    dispatch(
      toggleNavbar(localStorage.getItem("navbar") || themeConfig.navbar)
    );
    dispatch(
      toggleSemidark(localStorage.getItem("semidark") || themeConfig.semidark)
    );
    // locale
    const locale = localStorage.getItem("i18nextLng") || themeConfig.locale;
    dispatch(toggleLocale(locale));
    i18n.changeLanguage(locale);
  }, [
    dispatch,
    themeConfig.theme,
    themeConfig.menu,
    themeConfig.layout,
    themeConfig.rtlClass,
    themeConfig.animation,
    themeConfig.navbar,
    themeConfig.locale,
    themeConfig.semidark,
  ]);

  return (
    <div
      className={clsx(
        "main-section relative font-nunito text-sm font-normal antialiased",
        {
          "toggle-sidebar": themeConfig.sidebar,
          [themeConfig.menu]: themeConfig.menu,
          [themeConfig.layout]: themeConfig.layout,
          [themeConfig.rtlClass]: themeConfig.rtlClass,
          "bg-white": isLightModeRoute,
        }
      )}
    >
      {children}
      <Analytics />
    </div>
  );
}

export default App;
