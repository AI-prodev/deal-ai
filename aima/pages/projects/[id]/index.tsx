import Link from "next/link";
import { useState } from "react";

import withAuth from "@/helpers/withAuth";

import { ALL_ROLES } from "@/utils/roles";
import { useRouter } from "next/router";
import ProjectHome from "@/components/projects/ProjectHome";
import ProjectSettings from "@/components/projects/ProjectSettings";
import { createProjectApi } from "@/store/features/projectApi";
import { BuildingSVG } from "@/components/icons/SVGData";
import Head from "next/head";

type AccountSettingProps = {};

const Project = ({}: AccountSettingProps) => {
  const router = useRouter();
  const projectId = router.query.id as string;
  const { data: project } = createProjectApi.useGetProjectQuery(
    { projectId },
    { skip: !projectId }
  );

  const [tabs, setTabs] = useState<string>("home");
  const toggleTabs = (name: string) => {
    setTabs(name);
  };

  if (!project) {
    return <></>;
  }

  return (
    <>
      <Head>
        <title>{project ? project.title : "Project"}</title>
      </Head>
      <div>
        <ul className="flex space-x-2 rtl:space-x-reverse">
          <li>
            <Link href="/projects" className="text-primary hover:underline">
              Projects
            </Link>
          </li>
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <span>{project.title}</span>
          </li>
        </ul>
        <div className="pt-5">
          <div className="mb-5 flex items-center">
            <BuildingSVG />
            <h5 className="ml-3 text-lg font-semibold dark:text-white-light">
              {project.title}
            </h5>
          </div>
          <hr className="mb-5 overflow-y-auto whitespace-nowrap border border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex" />
          <div>
            <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
              <li className="inline-block">
                <button
                  onClick={() => toggleTabs("home")}
                  className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                    tabs === "home" ? "!border-primary text-primary" : ""
                  }`}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                  >
                    <path
                      opacity="0.5"
                      d="M2 12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274C22 8.77128 22 9.91549 22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M12 15L12 18"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Home
                </button>
              </li>
              <li className="inline-block">
                <button
                  onClick={() => toggleTabs("settings")}
                  className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                    tabs === "settings" ? "!border-primary text-primary" : ""
                  }`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="6"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <ellipse
                      opacity="0.5"
                      cx="12"
                      cy="17"
                      rx="7"
                      ry="4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                  Settings
                </button>
              </li>
            </ul>
          </div>

          {tabs === "home" && <ProjectHome project={project} />}
          {tabs === "settings" && <ProjectSettings project={project} />}
        </div>
      </div>
    </>
  );
};

export default withAuth(Project, ALL_ROLES, "ai-platform");
