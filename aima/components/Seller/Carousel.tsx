import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper";
import { useDispatch, useSelector } from "react-redux";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { IRootState } from "@/store";
interface CarouselProps {
  imageFilenames: {
    fileName: string;
    fileUrl: string;
    tempFileUrl?: string;
  }[];
}

const Carousel: React.FC<CarouselProps> = ({ imageFilenames }) => {
  const dispatch = useDispatch();
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);

  return (
    <>
      <div className=" ">
        <div className="swiper mx-auto mb-5 aspect-[4/2.5] !max-w-full !overflow-visible">
          <div className="swiper-wrapper">
            <Swiper
              modules={[Navigation, Pagination]}
              slidesPerView={1}
              spaceBetween={30}
              loop={false}
              pagination={{
                clickable: true,
                type: "fraction",
              }}
              navigation={{
                nextEl: ".swiper-button-next-ex4",
                prevEl: ".swiper-button-prev-ex4",
              }}
              className=""
              dir={themeConfig.rtlClass}
              key={themeConfig.rtlClass === "rtl" ? "true" : "false"}
            >
              {imageFilenames.map((file, index) => (
                <SwiperSlide key={index} className="w-full">
                  <img
                    src={file.tempFileUrl}
                    className="mx-auto h-full w-auto max-w-full !object-contain"
                    alt={`slide${index + 1}`}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <button className="swiper-button-prev-ex4 absolute top-1/2 z-[999] grid -translate-y-1/2 place-content-center rounded-full border border-primary p-1  text-primary transition hover:border-primary hover:bg-primary hover:text-white ltr:left-2 rtl:right-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 rtl:rotate-180"
            >
              <path
                d="M15 5L9 12L15 19"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button className="swiper-button-next-ex4 absolute top-1/2 z-[999] grid -translate-y-1/2 place-content-center rounded-full border border-primary p-1  text-primary transition hover:border-primary hover:bg-primary hover:text-white ltr:right-2 rtl:left-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="rtl:rotate-180"
            >
              <path
                d="M9 5L15 12L9 19"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default Carousel;
