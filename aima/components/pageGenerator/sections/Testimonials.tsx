import React, { useState } from "react";

const ITEMS_COUNT = 3;

const Testimonials = () => {
  const [selected, setSelected] = useState(1); // 1, 2, 3

  return (
    <>
      {/* Container for demo purpose */}
      <div className="container my-24 mx-auto md:px-6">
        {/* Section: Design Block */}
        <section className="mb-32 text-center">
          <h2 className="mb-12 text-3xl font-bold">Testimonials</h2>
          <div
            id="carouselExampleCaptions"
            className="relative"
            data-te-carousel-init=""
            data-te-carousel-slide=""
          >
            <div className="relative w-full overflow-hidden after:clear-both after:block after:content-['']">
              <div
                className={`relative float-left -mr-[100%] ${selected !== 1 && "hidden"} w-full transition-transform duration-[600ms] ease-in-out motion-reduce:transition-none`}
                data-te-carousel-active=""
                data-te-carousel-item=""
                style={{ backfaceVisibility: "hidden" }}
              >
                <img
                  className="mx-auto mb-6 rounded-full shadow-lg dark:shadow-black/20 w-[150px]"
                  src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(10).jpg"
                  alt="avatar"
                />
                <div className="flex flex-wrap justify-center">
                  <div className="w-full shrink-0 grow-0 basis-auto px-3 lg:w-8/12">
                    <h5 className="mb-2 text-lg font-bold">Maria Kate</h5>
                    <p className="mb-4 font-medium text-neutral-700 dark:text-neutral-400">
                      Photographer
                    </p>
                    <p className="mb-6 text-neutral-500 dark:text-neutral-300">
                      In ac turpis justo. Vivamus auctor quam vitae odio feugiat
                      pulvinar. Sed semper ligula sed lorem tincidunt dignissim.
                      Nam sed cursus lectus. Proin non rutrum magna. Proin
                      gravida, justo et imperdiet tristique turpis nisi viverra.
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 96 960 960"
                        className="inline-block w-6"
                      >
                        <path
                          fill="currentColor"
                          d="M580 556h160V396H580v160Zm-360 0h160V396H220v160Zm406 220 80-160H520V336h280v288l-76 152h-98Zm-360 0 80-160H160V336h280v288l-76 152h-98Zm34-300Zm360 0Z"
                        />
                      </svg>
                    </p>
                    <ul className="mb-0 flex justify-center">
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 96 960 960"
                          className="w-5 text-warning"
                        >
                          <path
                            fill="currentColor"
                            d="m233 976 65-281L80 506l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"
                          />
                        </svg>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 96 960 960"
                          className="w-5 text-warning"
                        >
                          <path
                            fill="currentColor"
                            d="m233 976 65-281L80 506l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"
                          />
                        </svg>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 96 960 960"
                          className="w-5 text-warning"
                        >
                          <path
                            fill="currentColor"
                            d="m233 976 65-281L80 506l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"
                          />
                        </svg>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 96 960 960"
                          className="w-5 text-warning"
                        >
                          <path
                            fill="currentColor"
                            d="m233 976 65-281L80 506l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"
                          />
                        </svg>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 96 960 960"
                          className="w-5 text-warning"
                        >
                          <path
                            fill="currentColor"
                            d="m480 757 157 95-42-178 138-120-182-16-71-168v387ZM233 976l65-281L80 506l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"
                          />
                        </svg>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div
                className={`relative float-left -mr-[100%] ${selected !== 2 && "hidden"} w-full transition-transform duration-[600ms] ease-in-out motion-reduce:transition-none`}
                data-te-carousel-item=""
                style={{ backfaceVisibility: "hidden" }}
              >
                <img
                  className="mx-auto mb-6 rounded-full shadow-lg dark:shadow-black/20 w-[150px]"
                  src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(32).jpg"
                  alt="avatar"
                />
                <div className="flex flex-wrap justify-center">
                  <div className="w-full shrink-0 grow-0 basis-auto px-3 lg:w-8/12">
                    <h5 className="mb-2 text-lg font-bold">John Doe</h5>
                    <p className="mb-4 font-medium text-neutral-700 dark:text-neutral-400">
                      Web Developer
                    </p>
                    <p className="mb-6 text-neutral-500 dark:text-neutral-300">
                      Maecenas auctor, quam eget tincidunt pretium, felis diam
                      semper turpis, sed scelerisque diam libero facilisis
                      libero. Quisque vitae semper metus. Aliquam eu dui
                      aliquam, faucibus metus quis, elementum nunc.
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 96 960 960"
                        className="inline-block w-6"
                      >
                        <path
                          fill="currentColor"
                          d="M580 556h160V396H580v160Zm-360 0h160V396H220v160Zm406 220 80-160H520V336h280v288l-76 152h-98Zm-360 0 80-160H160V336h280v288l-76 152h-98Zm34-300Zm360 0Z"
                        />
                      </svg>
                    </p>
                    <ul className="mb-0 flex justify-center">
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 96 960 960"
                          className="w-5 text-warning"
                        >
                          <path
                            fill="currentColor"
                            d="m233 976 65-281L80 506l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"
                          />
                        </svg>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 96 960 960"
                          className="w-5 text-warning"
                        >
                          <path
                            fill="currentColor"
                            d="m233 976 65-281L80 506l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"
                          />
                        </svg>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 96 960 960"
                          className="w-5 text-warning"
                        >
                          <path
                            fill="currentColor"
                            d="m233 976 65-281L80 506l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"
                          />
                        </svg>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 96 960 960"
                          className="w-5 text-warning"
                        >
                          <path
                            fill="currentColor"
                            d="m233 976 65-281L80 506l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"
                          />
                        </svg>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 96 960 960"
                          className="w-5 text-warning"
                        >
                          <path
                            fill="currentColor"
                            d="m233 976 65-281L80 506l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"
                          />
                        </svg>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div
                className={`relative float-left -mr-[100%] ${selected !== 3 && "hidden"} w-full transition-transform duration-[600ms] ease-in-out motion-reduce:transition-none`}
                data-te-carousel-item=""
                style={{ backfaceVisibility: "hidden" }}
              >
                <img
                  className="mx-auto mb-6 rounded-full shadow-lg dark:shadow-black/20 w-[150px]"
                  src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(1).jpg"
                  alt="avatar"
                />
                <div className="flex flex-wrap justify-center">
                  <div className="w-full shrink-0 grow-0 basis-auto px-3 lg:w-8/12">
                    <h5 className="mb-2 text-lg font-bold">Anna Deynah</h5>
                    <p className="mb-4 font-medium text-neutral-700 dark:text-neutral-400">
                      UX Designer
                    </p>
                    <p className="mb-6 text-neutral-500 dark:text-neutral-300">
                      Duis sagittis, turpis in ullamcorper venenatis, ligula
                      nibh porta dui, sit amet rutrum enim massa in ante.
                      Curabitur in justo at lorem laoreet ultricies. Nunc ligula
                      felis, sagittis eget nisi vitae ex arcu sit amet erat.
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 96 960 960"
                        className="inline-block w-6"
                      >
                        <path
                          fill="currentColor"
                          d="M580 556h160V396H580v160Zm-360 0h160V396H220v160Zm406 220 80-160H520V336h280v288l-76 152h-98Zm-360 0 80-160H160V336h280v288l-76 152h-98Zm34-300Zm360 0Z"
                        />
                      </svg>
                    </p>
                    <ul className="mb-0 flex justify-center">
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 96 960 960"
                          className="w-5 text-warning"
                        >
                          <path
                            fill="currentColor"
                            d="m233 976 65-281L80 506l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"
                          />
                        </svg>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 96 960 960"
                          className="w-5 text-warning"
                        >
                          <path
                            fill="currentColor"
                            d="m233 976 65-281L80 506l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"
                          />
                        </svg>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 96 960 960"
                          className="w-5 text-warning"
                        >
                          <path
                            fill="currentColor"
                            d="m233 976 65-281L80 506l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"
                          />
                        </svg>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 96 960 960"
                          className="w-5 text-warning"
                        >
                          <path
                            fill="currentColor"
                            d="m233 976 65-281L80 506l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"
                          />
                        </svg>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 96 960 960"
                          className="w-5 text-warning"
                        >
                          <path
                            fill="currentColor"
                            d="m323 851 157-94 157 95-42-178 138-120-182-16-71-168-71 167-182 16 138 120-42 178Zm-90 125 65-281L80 506l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-355Z"
                          />
                        </svg>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <button
              className="absolute top-0 bottom-0 left-0 z-[1] flex w-[15%] items-center justify-center border-0 bg-none p-0 text-center text-white opacity-50 transition-opacity duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] hover:text-white hover:no-underline hover:opacity-90 hover:outline-none focus:text-white focus:no-underline focus:opacity-90 focus:outline-none motion-reduce:transition-none"
              type="button"
              data-te-target="#carouselExampleCaptions"
              data-te-slide="prev"
              onClick={() =>
                setSelected(prev => (prev <= 1 ? ITEMS_COUNT : prev - 1))
              }
            >
              <span className="inline-block h-8 w-8">
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  className="text-neutral-600 dark:text-neutral-300"
                >
                  <path
                    fill="currentColor"
                    d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                  />
                </svg>
              </span>
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Previous
              </span>
            </button>
            <button
              className="absolute top-0 bottom-0 right-0 z-[1] flex w-[15%] items-center justify-center border-0 bg-none p-0 text-center text-white opacity-50 transition-opacity duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] hover:text-white hover:no-underline hover:opacity-90 hover:outline-none focus:text-white focus:no-underline focus:opacity-90 focus:outline-none motion-reduce:transition-none"
              type="button"
              data-te-target="#carouselExampleCaptions"
              data-te-slide="next"
              onClick={() =>
                setSelected(prev => (prev >= ITEMS_COUNT ? 1 : prev + 1))
              }
            >
              <span className="inline-block h-8 w-8">
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  className="text-neutral-600 dark:text-neutral-300"
                >
                  <path
                    fill="currentColor"
                    d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                  />
                </svg>
              </span>
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Next
              </span>
            </button>
          </div>
        </section>
        {/* Section: Design Block */}
      </div>
      {/* Container for demo purpose */}
    </>
  );
};

export default Testimonials;
