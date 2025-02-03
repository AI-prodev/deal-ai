import PageGeneratorForms from "@/components/pageGenerator/Forms";
import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";
import React, { useEffect, useState } from "react";
import { createFunnelApi, createProjectApi } from "@/store/features/projectApi";
import Link from "next/link";
import { useRouter } from "next/router";
import { PageData } from "@/pages/apps/page-generator";
import Head from "next/head";

type Props = {};

const Funnel = (props: Props) => {
  const router = useRouter();
  const projectId = router.query.id as string;
  const funnelId = router.query.funnelId as string;
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
  const [pageData, setPageData] = useState<PageData[]>([]);
  let href = "/websites";

  if (type === "funnels") {
    href = "/funnels";
  } else if (type === "easy-websites") {
    href = "/easy-websites";
  } else if (type === "simple-websites") {
    href = "/simple-websites";
  }

  if (!project || !funnel) {
    return <></>;
  }

  return (
    <>
      <Head>
        <title>{funnel ? funnel.title : "New Page"}</title>
      </Head>
      <div>
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
            <Link
              href={`/projects/${project._id}/${href}/${funnel._id}`}
              className="text-primary hover:underline"
            >
              {funnel.title}
            </Link>
          </li>
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <span>New Page</span>
          </li>
        </ul>
        <div className="pt-5">
          <div className="mb-5 flex items-center">
            <h5 className="ml-3 text-lg font-semibold dark:text-white-light">
              New page
            </h5>
          </div>
          <hr className="mb-5 overflow-y-auto whitespace-nowrap border border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex" />
          <div className="max-w-2xl">
            <PageGeneratorForms
              pageData={pageData}
              setPageData={setPageData}
              funnel={funnel}
              project={project}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(Funnel, USER_ROLES, "ai-platform");
