import { AcademyCourse } from "@/utils/data/courses";
import React from "react";
import CourseCard from "./CourseCard";

const CourseList = ({
  courses,
  academySlug,
}: {
  courses: AcademyCourse[];
  academySlug: string;
}) => {
  return (
    <>
      <div className="grid gap-4 grid-cols-1 w-full max-w-[780px]">
        {courses.map(course => (
          <CourseCard
            key={course.slug}
            course={course}
            academySlug={academySlug}
          />
        ))}
      </div>
    </>
  );
};

export default CourseList;
