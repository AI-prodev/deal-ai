import React, { useEffect, useState } from "react";
// import { format } from 'date-fns';
import Link from "next/link";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import {
  FilterSVG,
  GlobeSVG,
  GearSmallSVG,
  ThreeBarsSVG,
  PersonSVG,
  MoneySVG,
  StatsSVG,
} from "@/components/icons/SVGData";
// import PageGeneratorForms from "@/components/pageGenerator/Forms";
// import ProjectCard from "@/components/projects/ProjectCard";
// import { PageResults } from "@/components/pageGenerator/PageResults";
// import NewProjectModal from "@/components/projects/NewProjectModal";
import FunnelContacts from "@/components/funnels/FunnelContacts";
import FunnelSteps from "@/components/funnels/FunnelSteps";
import FunnelSales from "@/components/funnels/FunnelSales";
import FunnelSettings from "@/components/funnels/FunnelSettings";
import FunnelPanelLeft from "@/components/funnels/FunnelPanelLeft";
import withAuth from "@/helpers/withAuth";
import { IPage } from "@/interfaces/IPage";
import { createFunnelApi, createProjectApi } from "@/store/features/projectApi";
import { createPageApi } from "@/store/features/pageApi";
import { setPageTitle, toggleTheme } from "@/store/themeConfigSlice";
import { USER_ROLES } from "@/utils/roles";
import FunnelStats from "@/components/funnels/FunnelStats";
import clsx from "clsx";
import Head from "next/head";
import { FunnelType } from "@/enums/funnel-type.enum";

type Props = {};

const Funnel = (props: Props) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const projectId = router.query.id as string;
  const funnelId = router.query.funnelId as string;
  const pageId = router.query.page as string;
  const type = router.query.type as
    | "websites"
    | "funnels"
    | "easy-websites"
    | "simple-websites";
  const { data: project } = createProjectApi.useGetProjectQuery(
    { projectId },
    { skip: !projectId }
  );
  const { data: funnel } = createFunnelApi.useGetFunnelQuery(
    { funnelId },
    { skip: !funnelId }
  );
  const { data: pages } = createPageApi.useGetFunnelPagesQuery(
    { funnelId },
    { skip: !funnelId }
  );

  const [selectedPage, setSelectedPage] = useState<IPage | null>(null);
  const [tabs, setTabs] = useState<string>("home");
  let name = "Dashboard";
  let href = "/websites";
  let IS_LIGHT_MODE = false;

  if (type === "funnels") {
    name = "Funnels";
    href = "/funnels";
  } else if (type === "easy-websites") {
    name = "Easy Websites";
    href = "/easy-websites";
  } else if (type === "simple-websites") {
    name = "Simple Websites";
    href = "/simple-websites";
    IS_LIGHT_MODE = true;
  }

  const toggleTabs = (name: string) => {
    setTabs(name);
    setSelectedPage(null);
    if (name === "home" && pages && pages.length > 0) {
      setSelectedPage(pages[0]);
    }
  };

  // will be needed inside the page editor to save the changes to the page
  useEffect(() => {
    getSession().then(session => {
      if (session?.token) {
        localStorage.setItem("sessionToken", session.token);
      }
    });
  }, []);

  useEffect(() => {
    if (type === "simple-websites") {
      dispatch(toggleTheme("dark"));
    }
  }, []);

  useEffect(() => {
    if (!pages) {
      return;
    }
    if (pageId) {
      setSelectedPage(pages.find(p => p._id === pageId) || null);
      const newQuery = { ...router.query };
      delete newQuery.page;
      router.replace({
        query: newQuery,
      });
    } else {
      setSelectedPage(pages.length > 0 ? pages[0] : null);
    }
  }, [pages]);

  const choosePage = (page: IPage) => {
    setTabs("home");
    setSelectedPage(page);
  };

  if (!funnel) {
    return <></>;
  }

  return (
    <div>
      {IS_LIGHT_MODE && (
        <Head>
          {funnel?.type === FunnelType.SIMPLE_WEBSITES ? (
            <title>Simple Websites</title>
          ) : (
            <title>{funnel ? funnel.title : type === name}</title>
          )}
          <style>
            {`
            body {
              background-color: white !important;
            }
          `}
          </style>
        </Head>
      )}
      {project ? (
        <ul className="flex space-x-2 rtl:space-x-reverse">
          <li>
            <Link href="/projects" className="text-primary hover:underline">
              Projects
            </Link>
          </li>
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <Link
              href={`/projects/${project._id}`}
              className="text-primary hover:underline"
            >
              {project.title}
            </Link>
          </li>
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <span>{funnel.title}</span>
          </li>
        </ul>
      ) : (
        <ul className="flex space-x-2 rtl:space-x-reverse">
          <li>
            <Link href={href} className="text-primary hover:underline">
              {name}
            </Link>
          </li>
          <li
            className={clsx(
              "before:content-['/'] ltr:before:mr-2 rtl:before:ml-2",
              {
                "text-black": IS_LIGHT_MODE,
              }
            )}
          >
            <span>{funnel.title}</span>
          </li>
        </ul>
      )}
      <div className="pt-5">
        <div className="flex items-center justify-between">
          <div
            className={clsx("flex items-center", {
              "text-black": IS_LIGHT_MODE,
              "text-white-light": !IS_LIGHT_MODE,
            })}
          >
            {type === "funnels" ? <FilterSVG /> : <GlobeSVG />}
            <h5 className="ml-3 text-lg font-semibold">{funnel.title}</h5>
          </div>
          <div>
            <ul className="overflow-y-auto whitespace-nowrap font-semibold sm:flex">
              <li className="inline-block">
                <button
                  onClick={() => toggleTabs("home")}
                  className={clsx(
                    "flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary",
                    {
                      "!border-primary text-primary": tabs === "home",
                      "text-black": IS_LIGHT_MODE,
                    }
                  )}
                >
                  <ThreeBarsSVG width={20} height={20} />
                  {type === "funnels" ? "Steps" : "Pages"}
                </button>
              </li>
              {type !== "simple-websites" && (
                <li className="inline-block">
                  <button
                    onClick={() => toggleTabs("stats")}
                    className={clsx(
                      "flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary",
                      {
                        "!border-primary text-primary": tabs === "stats",
                        "text-black": IS_LIGHT_MODE,
                      }
                    )}
                  >
                    <StatsSVG width={20} height={20} />
                    Stats
                  </button>
                </li>
              )}
              <li className="inline-block">
                <button
                  onClick={() => toggleTabs("contacts")}
                  className={clsx(
                    "flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary",
                    {
                      "!border-primary text-primary": tabs === "contacts",
                      "text-black": IS_LIGHT_MODE,
                    }
                  )}
                >
                  <PersonSVG />
                  Contacts
                </button>
              </li>
              {type !== "simple-websites" && (
                <li className="inline-block">
                  <button
                    onClick={() => toggleTabs("sales")}
                    className={clsx(
                      "flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary",
                      {
                        "!border-primary text-primary": tabs === "sales",
                        "text-black": IS_LIGHT_MODE,
                      }
                    )}
                  >
                    <MoneySVG />
                    Sales
                  </button>
                </li>
              )}
              <li className="inline-block">
                <button
                  onClick={() => toggleTabs("settings")}
                  className={clsx(
                    "flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary",
                    {
                      "!border-primary text-primary": tabs === "settings",
                      "text-black": IS_LIGHT_MODE,
                    }
                  )}
                >
                  <GearSmallSVG />
                  Settings
                </button>
              </li>
            </ul>
          </div>
        </div>
        <hr
          className={clsx(
            "overflow-y-auto whitespace-nowrap border-t font-semibold sm:flex",
            {
              "border-[#ebedf2]": IS_LIGHT_MODE,
              "border-[#191e3a]": !IS_LIGHT_MODE,
            }
          )}
        />

        <div
          className={clsx("grid gap-4 grid-cols-1 md:grid-cols-[auto_1fr]", {
            "md:grid-cols-[auto_324px]": type === "simple-websites",
            "md:grid-cols-[auto_1fr]": type !== "simple-websites",
          })}
        >
          {tabs !== "stats" && type !== "simple-websites" && (
            <div className="w-72">
              {pages && (
                <FunnelPanelLeft
                  isLightMode={IS_LIGHT_MODE}
                  pages={pages}
                  selectedPage={selectedPage}
                  funnel={funnel}
                  project={project}
                  setSelectedPage={choosePage}
                />
              )}
            </div>
          )}
          {tabs === "home" && (
            <FunnelSteps
              isLightMode={IS_LIGHT_MODE}
              funnel={funnel}
              project={project}
              selectedPage={selectedPage}
              setSelectedPage={choosePage}
              toggleFunnelTabs={toggleTabs}
            />
          )}
          {tabs === "contacts" && (
            <FunnelContacts funnel={funnel} isLightMode={IS_LIGHT_MODE} />
          )}
          {tabs === "sales" && <FunnelSales />}
          {tabs === "settings" && (
            <FunnelSettings
              funnel={funnel}
              project={project}
              isLightMode={IS_LIGHT_MODE}
            />
          )}
          {tabs !== "stats" && type === "simple-websites" && (
            <div className="w-72">
              {pages && (
                <FunnelPanelLeft
                  isLightMode={IS_LIGHT_MODE}
                  pages={pages}
                  selectedPage={selectedPage}
                  funnel={funnel}
                  project={project}
                  setSelectedPage={choosePage}
                />
              )}
            </div>
          )}
        </div>
        {tabs === "stats" && <FunnelStats funnel={funnel} />}
      </div>
    </div>
  );
};

export default withAuth(Funnel, USER_ROLES);
