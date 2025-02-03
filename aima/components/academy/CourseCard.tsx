import { AcademyCourse } from "@/utils/data/courses";
import React from "react";
import Link from "next/link";
import { CourseSVG } from "@/components/icons/SVGData";

const CourseCard = ({
  course,
  academySlug,
}: {
  course: AcademyCourse;
  academySlug: string;
}) => {
  return (
    <Link href={`/academy/lessons/${course.slug}?a=${academySlug}`}>
      <div className="w-full rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 px-6">
          <div className="md:col-span-2 flex flex-row">
            <CourseSVG />
            <h5 className="ml-3 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
              {course.title}
            </h5>
          </div>
          <div className="flex items-center justify-center md:justify-end mt-2 md:mt-0">
            <p className="text-white-dark">
              {`${course.videos.length} Video${course.videos.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
