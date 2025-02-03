import React from "react";

const SocialProof = () => {
  return (
    <>
      {/* Container for demo purpose */}
      <div className="container my-24 mx-auto md:px-6">
        {/* Section: Design Block */}
        <section className="mb-32 text-center">
          <h2 className="mb-16 text-3xl font-bold">
            Trusted by <u className="">2,000,000+</u> users
          </h2>
          <div className="grid items-center gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="mb-12 lg:mb-0">
              <img
                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/landing-page/2.png"
                className="px-6 dark:brightness-150 md:px-12"
                alt="Nasa - logo"
              />
            </div>
            <div className="mb-12 lg:mb-0">
              <img
                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/landing-page/1.png"
                className="px-6 dark:brightness-150 md:px-12"
                alt="Amazon - logo"
              />
            </div>
            <div className="mb-12 lg:mb-0">
              <img
                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/landing-page/3.png"
                className="px-6 dark:brightness-150 md:px-12"
                alt="Nike - logo"
              />
            </div>
            <div className="mb-12 lg:mb-0">
              <img
                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/landing-page/4.png"
                className="px-6 dark:brightness-150 md:px-12"
                alt="Ikea - logo"
              />
            </div>
          </div>
        </section>
        {/* Section: Design Block */}
      </div>
      {/* Container for demo purpose */}
    </>
  );
};

export default SocialProof;
