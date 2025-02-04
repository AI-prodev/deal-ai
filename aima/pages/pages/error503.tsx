import React from "react";
import Link from "next/link";
import BlankLayout from "@/components/Layouts/BlankLayout";
import Head from "next/head";

const Error503 = () => {
  return (
    <>
      <Head>
        <title>Error 503</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-t from-[#c39be3] to-[#f2eafa]">
        <div className="p-5 text-center font-semibold">
          <h2 className="mb-8 text-[50px] font-bold leading-none md:text-[80px]">
            Error 503
          </h2>
          <h4 className="mb-5 text-xl font-semibold text-primary sm:text-5xl">
            Ooops!
          </h4>
          <p className="text-base">Service Unavailable!</p>
          <Link href="/" className="btn btn-primary mx-auto mt-10 w-max">
            Home
          </Link>
        </div>
      </div>
    </>
  );
};
Error503.getLayout = (page: any) => {
  return <BlankLayout>{page}</BlankLayout>;
};
export default Error503;
