import PerfectScrollbar from "react-perfect-scrollbar";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { toggleSidebar } from "../../store/themeConfigSlice";
import AnimateHeight from "react-animate-height";
import { IRootState } from "../../store";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { SidebarBuyerLinks } from "../SideBar/SidebarBuyerLinks";
import {
  isAcademyAuthorized,
  isAdminAuthorized,
  isBrokerAuthorized,
  isBuyerAuthorized,
  isCampaignAuthorized,
  isConsultingAuthorized,
  isLeadAuthorized,
  isSellerAuthorized,
  isUserAuthorized,
} from "@/utils/roleIsAuthorized";
import { SidebarAdminLinks } from "../SideBar/SidebarAdminLinks";
import { SidebarSellerLinks } from "../SideBar/SidebarSellerLinks";
import { SidebarBrokerLinks } from "../SideBar/SidebarBroker";
import { SidebarConsultantsLinks } from "../SideBar/SidebarConsultantsLinks";
import { DebugLinks } from "../SideBar/DebugLinks";
import { handleHome } from "@/utils/roleToRoute";
import { SidebarMarketingLinks } from "../SideBar/SidebarMarketingLinks";
import { SidebarProjectLinks } from "../SideBar/SidebarProjectLinks";
import { SidebarCampaignLinks } from "../SideBar/SidebarCampaignLinks";
import SidebarLeadLink from "../SideBar/SidebarLeadLink";
import { SidebarAcademyLinks } from "../SideBar/SidebarAcademyLinks";
import SidebarLinkItem from "../SideBar/SidebarLinkItem";
import { SidebarAiAppsLinks } from "../SideBar/SidebarAiAppsLinks";

const debug = process.env.NEXT_PUBLIC_DEBUG == "true" || false;

const Sidebar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentMenu, setCurrentMenu] = useState<string>("");
  const [errorSubMenu, setErrorSubMenu] = useState(false);
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const semidark = useSelector(
    (state: IRootState) => state.themeConfig.semidark
  );
  const toggleMenu = (value: string) => {
    setCurrentMenu(oldValue => {
      return oldValue === value ? "" : value;
    });
  };

  const userRoles = session?.user?.roles || [];

  useEffect(() => {
    const selector = document.querySelector(
      '.sidebar ul a[href="' + window.location.pathname + '"]'
    );
    if (selector) {
      selector.classList.add("active");
      const ul: any = selector.closest("ul.sub-menu");
      if (ul) {
        let ele: any =
          ul.closest("li.menu")?.querySelectorAll(".nav-link") || [];
        if (ele.length) {
          ele = ele[0];
          setTimeout(() => {
            ele.click();
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    setActiveRoute();
    if (window.innerWidth < 1024 && themeConfig.sidebar) {
      dispatch(toggleSidebar());
    }
  }, [router.pathname]);

  const setActiveRoute = () => {
    let allLinks = document.querySelectorAll(".sidebar ul a.active");
    for (let i = 0; i < allLinks.length; i++) {
      const element = allLinks[i];
      element?.classList.remove("active");
    }
    let selector = document.querySelector(
      '.sidebar ul a[href="' + window.location.pathname + '"]'
    );
    if (!selector && window.location.pathname.startsWith("/projects")) {
      selector = document.querySelector('.sidebar ul a[href="/funnels"]');
    }

    selector?.classList.add("active");
  };

  const dispatch = useDispatch();
  const { t } = useTranslation();

  return (
    <div className={semidark ? "dark" : ""}>
      <nav
        className={`sidebar fixed bottom-0 top-0  z-50 h-full min-h-screen w-[260px]   transition-all duration-300 ${
          semidark ? "text-white-dark" : ""
        }`}
      >
        <div className="h-full bg-white dark:bg-black">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => handleHome(status, session, router)}
              className="main-logo flex shrink-0 items-center"
            >
              <img
                className="ml-[5px] mr-[5px] w-8 flex-none"
                src="/assets/images/logo.svg"
                alt="logo"
              />
              <span className="align-middle text-2xl font-semibold dark:text-white-light lg:inline ltr:ml-1.5 rtl:mr-1.5">
                {t("deal.ai")}
              </span>
            </button>

            <button
              type="button"
              className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 dark:text-white-light dark:hover:bg-dark-light/10 rtl:rotate-180"
              onClick={() => dispatch(toggleSidebar())}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="m-auto h-5 w-5"
              >
                <path
                  d="M13 19L7 12L13 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  opacity="0.5"
                  d="M16.9998 19L10.9998 12L16.9998 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="h-full bg-[#242528]">
            {" "}
            <PerfectScrollbar className="relative h-[calc(100vh-80px)] ">
              <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                {/* {debug && (
                <li className="menu nav-item">
                  <button
                    type="button"
                    className={`${
                      currentMenu === "dashboard" ? "active" : ""
                    } nav-link group w-full`}
                    onClick={() => toggleMenu("dashboard")}
                  >
                    <div className="flex items-center">
                      <svg
                        className="group-hover:!text-primary"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          opacity="0.5"
                          d="M2 12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274C22 8.77128 22 9.91549 22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039Z"
                          fill="currentColor"
                        />
                        <path
                          d="M9 17.25C8.58579 17.25 8.25 17.5858 8.25 18C8.25 18.4142 8.58579 18.75 9 18.75H15C15.4142 18.75 15.75 18.4142 15.75 18C15.75 17.5858 15.4142 17.25 15 17.25H9Z"
                          fill="currentColor"
                        />
                      </svg>
                      <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                        {t("dashboard")}
                      </span>
                    </div>

                    <div
                      className={
                        currentMenu === "dashboard"
                          ? "rotate-90"
                          : "rtl:rotate-180"
                      }
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 5L15 12L9 19"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </button>

                  <AnimateHeight
                    duration={300}
                    height={currentMenu === "dashboard" ? "auto" : 0}
                  >
                    <ul className="sub-menu text-gray-500">
                      <li>
                        <Link href="/">{t("sales")}</Link>
                      </li>
                      <li>
                        <Link href="/analytics">{t("analytics")}</Link>
                      </li>
                      <li>
                        <Link href="/finance">{t("finance")}</Link>
                      </li>
                    </ul>
                  </AnimateHeight>
                </li>
              )} */}

                {isAdminAuthorized(userRoles) && (
                  <>
                    <h2 className="-mx-4 mb-1 flex items-center  px-7 py-3 font-extrabold ">
                      <svg
                        className="hidden h-5 w-4 flex-none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      {/* <span>{t("Admin Apps")}</span> */}
                    </h2>

                    <SidebarAdminLinks session={session} />
                  </>
                )}

                {isAcademyAuthorized(userRoles) && (
                  <>
                    <h2 className="-mx-4 mb-1 flex items-center  px-7 py-3 font-extrabold ">
                      <svg
                        className="hidden h-5 w-4 flex-none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      {/* <span>{t("Academy")}</span> */}
                    </h2>

                    <SidebarAcademyLinks session={session} />
                  </>
                )}

                {isUserAuthorized(userRoles) && (
                  <>
                    <h2 className="-mx-4 mb-1 flex items-center  px-7 py-3 font-extrabold ">
                      <svg
                        className="hidden h-5 w-4 flex-none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </h2>

                    <SidebarMarketingLinks session={session} />
                  </>
                )}

                {isUserAuthorized(userRoles) && (
                  <>
                    <h2>
                      <svg
                        className="hidden h-5 w-4 flex-none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      {/* <span>
                      {t("Ultra-Fast Funnels")}
                      <sup className="text-primary">&nbsp;Beta</sup>
                    </span> */}
                    </h2>

                    <SidebarProjectLinks session={session} />
                  </>
                )}

                {isCampaignAuthorized(userRoles) && (
                  <>
                    <h2>
                      <svg
                        className="hidden h-5 w-4 flex-none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      {/* <span>{t("Campaign")}</span> */}
                    </h2>
                    <SidebarCampaignLinks session={session} />
                  </>
                )}

                {isLeadAuthorized(userRoles) && (
                  <>
                    <>
                      <h2 className="-mx-4 mb-1 flex items-center  px-7 py-3 font-extrabold ">
                        <svg
                          className="hidden h-5 w-4 flex-none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        {/* <span>{t("Lead Flow")}</span> */}
                      </h2>

                      <SidebarLeadLink session={session} />
                    </>
                  </>
                )}
                {isUserAuthorized(userRoles) && (
                  <>
                    <div className="!mt-5">
                      <h2 className="-mx-4 mb-1  flex items-center  px-7 py-3 font-extrabold ">
                        <svg
                          className="hidden h-5 w-4 flex-none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>{t("Recently Used")}</span>
                      </h2>

                      <SidebarAiAppsLinks session={session} />
                    </div>
                  </>
                )}

                <h2 className="-mx-4 mb-1 flex items-center  px-7 py-3 font-extrabold ">
                  <svg
                    className="hidden h-5 w-4 flex-none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  {/* <span>Support</span> */}
                </h2>
                {/* <SidebarLinkItem
                  link="/apps/settings/manage"
                  title={t("Subscriptions")}
                  icon="/assets/sidebarIcons/subscriptions.png"
                />
                <SidebarLinkItem
                  link="/apps/contact-us"
                  title={t("Contact Us")}
                  icon="/assets/sidebarIcons/contactUs.png"
                />

                <SidebarLinkItem
                  link="https://api.leadconnectorhq.com/widget/bookings/katherine-calendar"
                  title={t("Consulting")}
                  icon="/assets/sidebarIcons/consulting.png"
                /> */}

                {/*  Components that use  in dev */}
                {/* <DebugLinks /> */}

                {/* {debug && (
                  <li className="menu nav-item">
                    <button type="button" className="nav-link group">
                      <div className="flex items-center">
                        <svg
                          className="group-hover:!text-primary"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4 4.69434V18.6943C4 20.3512 5.34315 21.6943 7 21.6943H17C18.6569 21.6943 20 20.3512 20 18.6943V8.69434C20 7.03748 18.6569 5.69434 17 5.69434H5C4.44772 5.69434 4 5.24662 4 4.69434ZM7.25 11.6943C7.25 11.2801 7.58579 10.9443 8 10.9443H16C16.4142 10.9443 16.75 11.2801 16.75 11.6943C16.75 12.1085 16.4142 12.4443 16 12.4443H8C7.58579 12.4443 7.25 12.1085 7.25 11.6943ZM7.25 15.1943C7.25 14.7801 7.58579 14.4443 8 14.4443H13.5C13.9142 14.4443 14.25 14.7801 14.25 15.1943C14.25 15.6085 13.9142 15.9443 13.5 15.9443H8C7.58579 15.9443 7.25 15.6085 7.25 15.1943Z"
                            fill="currentColor"
                          />
                          <path
                            opacity="0.5"
                            d="M18 4.00038V5.86504C17.6872 5.75449 17.3506 5.69434 17 5.69434H5C4.44772 5.69434 4 5.24662 4 4.69434V4.62329C4 4.09027 4.39193 3.63837 4.91959 3.56299L15.7172 2.02048C16.922 1.84835 18 2.78328 18 4.00038Z"
                            fill="currentColor"
                          />
                        </svg>

                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                          <Link href="/pages/release-notes">
                            {t("Release Notes")}
                          </Link>
                        </span>
                      </div>
                    </button>
                  </li>
                )} */}
              </ul>
            </PerfectScrollbar>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
