import Head from "next/head";
import CourseList from "@/components/academy/CourseList";
import { CourseSVG } from "@/components/icons/SVGData";
import { ACADEMY_ROLES } from "@/utils/roles";
import withAuth from "@/helpers/withAuth";
import React, { useEffect } from "react";
import { createProfileAPI } from "@/store/features/profileApi";
import { createAcademyApi } from "@/store/features/academyApi";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setPageTitle } from "@/store/themeConfigSlice";

const LessonsPage = () => {
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

  const profileApiClient = createProfileAPI;

  const {
    data: profile,
    isLoading,
    refetch,
  } = profileApiClient.useGetProfileQuery() ?? {};

  const role = profile?.user?.roles;

  const { data: academy } = createAcademyApi.useGetAcademyBySlugQuery(
    {
      slug: academySlug,
    },
    { skip: !role?.some((role: string) => ACADEMY_ROLES.includes(role)) }
  );
  const isPlatformUser = (role || []).some(
    (item: string) => item === "user" || item === "lite" || item === "admin"
  );

  return (
    <>
      <Head>
        <title>AI Marketing Academy</title>
      </Head>
      <div className="p-3">
        {academySlug === "ai-software-academy" && (
          <div className="flex justify-center mb-6">
            <div className="flex items-center w-full max-w-[780px] bg-primary text-white p-3 rounded-lg">
              Welcome to the AI Software academy. The first live call will be on
              Tuesday, April 2nd. Stay tuned for updates!
            </div>
          </div>
        )}
        {academy && academy.courses && academy.courses.length > 0 && (
          <div className="flex justify-center">
            <div className="flex items-center w-full max-w-[780px]">
              <CourseSVG />
              <h2 className="ml-3 text-2xl font-bold">Lessons</h2>
            </div>
          </div>
        )}
        <div className="flex justify-center mt-6">
          {academy && (
            <CourseList courses={academy.courses} academySlug={academySlug} />
          )}
        </div>

        {!isLoading && !isPlatformUser && (
          <div className="mt-8 flex w-full max-w-[780px] items-center justify-center">
            <div className="mb-8 text-center text-gray-300">
              <h2 className="mb-3 text-2xl  font-bold">
                Ready to use our AI Marketing Software?
              </h2>

              <a
                href="https://deal.ai/unlockaisoftware"
                target="_self"
                className="mt-4 block w-full rounded-md bg-gradient-to-r from-blue-500 to-purple-500 py-2 px-4 text-center text-white shadow transition duration-300 ease-in-out"
              >
                Subscribe to Software
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default withAuth(LessonsPage, ACADEMY_ROLES, "academy");
