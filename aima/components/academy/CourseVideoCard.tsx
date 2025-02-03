import { AcademyVideo } from "@/utils/data/courses";
import React, { useState } from "react";
import CourseVideoModal from "./CourseVideoModal";
import { PlaySVG } from "@/components/icons/SVGData";

const CourseVideoCard = ({ video }: { video: AcademyVideo }) => {
  const [isCourseVideoModalOpen, setCourseVideoModalOpen] = useState(false);

  const handleCourseVideoModalClose = () => {
    setCourseVideoModalOpen(false);
  };

  const handleCourseVideoModalOpen = () => {
    setCourseVideoModalOpen(true);
  };

  return (
    <>
      <CourseVideoModal
        isOpen={isCourseVideoModalOpen}
        onRequestClose={handleCourseVideoModalClose}
        title={video.title}
        vimeoId={video.vimeoId}
      />
      <div
        onClick={handleCourseVideoModalOpen}
        className="cursor-pointer w-full rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none"
      >
        <div className="py-4 px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-2 md:mb-0">
            <div
              style={{
                width: 120,
                height: 80,
                backgroundImage: `url(${video.thumbnail})`,
                backgroundSize: "cover",
                borderRadius: "8px",
                backgroundPosition: "center center",
              }}
            />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-start md:pl-8">
            <PlaySVG />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-start w-full md:pl-2">
            <p className="text-white-dark">{video.title}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseVideoCard;
