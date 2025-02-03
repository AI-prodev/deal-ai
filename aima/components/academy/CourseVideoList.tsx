import { AcademyCourse } from "@/utils/data/courses";
import React from "react";
import CourseVideoCard from "./CourseVideoCard";

const CourseVideoList = ({ course }: { course: AcademyCourse }) => {
  return (
    <div className="grid gap-4 grid-cols-1 max-w-[780px]">
      {course.videos.map(video => (
        <CourseVideoCard key={video.slug} video={video} />
      ))}
    </div>
  );
};

export default CourseVideoList;
