import Head from "next/head";
import CourseVideoList from "@/components/academy/CourseVideoList";
import { CourseSVG } from "@/components/icons/SVGData";
import withAuth from "@/helpers/withAuth";
import { createAcademyApi } from "@/store/features/academyApi";

import { createProfileAPI } from "@/store/features/profileApi";
import { isMastermindAuthorized } from "@/utils/roleIsAuthorized";
import { ACADEMY_ROLES } from "@/utils/roles";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo } from "react";

import { useDispatch } from "react-redux";
import { setPageTitle } from "@/store/themeConfigSlice";

const AcademyCourse = () => {
  const profileApiClient = createProfileAPI;
  const router = useRouter();
  const academySlug = router.query?.a
    ? (router.query?.a as string)
    : "ai-marketing-academy";

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      setPageTitle(
        academySlug === "ai-marketing-academy"
          ? "AI Marketing Academy"
          : "AI Software Academy"
      )
    );
  }, [dispatch]);

  const {
    data: profile,

    isLoading,

    refetch,
  } = profileApiClient.useGetProfileQuery() ?? {};
  const courseSlug = router.query.courseSlug as string;
  const userRoles = profile?.user?.roles || [];

  const { data: academy } = createAcademyApi.useGetAcademyBySlugQuery(
    { slug: academySlug },

    {
      skip: !userRoles.some((role: string) => ACADEMY_ROLES.includes(role)),
    }
  );

  const course = useMemo(() => {
    if (academy && courseSlug) {
      return academy.courses.find(c => c.slug === courseSlug);
    }
    return null;
  }, [academy, courseSlug]);

  if (!course) {
    return <></>;
  }

  return (
    <>
      <Head>
        <title>AI Marketing Academy</title>
      </Head>
      <div>
        <ul className="flex space-x-2 rtl:space-x-reverse">
          <li>
            <Link
              href={`/academy/lessons?a=${academySlug}`}
              className="text-primary hover:underline"
            >
              Lessons
            </Link>
          </li>
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <span>{course.title}</span>
          </li>
        </ul>
        <div className="pt-5">
          <div className="mb-5 flex items-center">
            <CourseSVG />
            <h5 className="ml-3 text-lg font-semibold dark:text-white-light">
              {course.title}
            </h5>
          </div>
          <hr className="mb-5 overflow-y-auto whitespace-nowrap border border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex" />
          <CourseVideoList course={course} />
        </div>
        {!isMastermindAuthorized(userRoles) &&
          course.slug === "case-studies-from-mastermind-members" && (
            <div className="mt-12 flex max-w-[780px] items-center justify-center">
              <div className="mb-8 text-center text-gray-300">
                <h2 className="mb-3 text-2xl  font-bold">
                  Don't miss out on the next call:
                </h2>

                <a
                  href="https://deal.ai/joinmastermind"
                  target="_blank"
                  className="mt-4 block w-full rounded-md bg-gradient-to-r from-blue-500 to-purple-500 py-2 px-4 text-center text-white shadow transition duration-300 ease-in-out"
                  rel="noreferrer"
                >
                  Join the exclusive AI Mastermind
                </a>
              </div>
            </div>
          )}
        {course.slug === "agency-in-a-box" && (
          <div className="mt-12 flex max-w-[780px] items-center justify-center">
            <div className="mb-8 text-center text-gray-300">
              <h2 className="mb-3 text-2xl font-bold">
                Start an agency today:
              </h2>

              <a
                href="https://deal.ai/agencyinabox"
                target="_blank"
                className="mt-4 block w-full rounded-md bg-gradient-to-r from-blue-500 to-purple-500 py-2 px-4 text-center text-white shadow transition duration-300 ease-in-out"
                rel="noreferrer"
              >
                Get your own Agency-In-A-Box
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default withAuth(AcademyCourse, ACADEMY_ROLES, "academy");
